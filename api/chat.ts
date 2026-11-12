// POST /api/chat — streaming endpoint for "Iyed AI".
// Vercel Node.js function using the Web-standard Request/Response signature.
// Response: text/plain stream of Markdown. Metadata travels in headers:
//   X-Iyed-AI-Mode: llm | fallback
//   X-Iyed-AI-Sources: URI-encoded JSON [{ title, href }]
import { checkRateLimit, clientIp } from './_lib/rateLimit.js'
import { parseChatRequest, ValidationError, type ChatRequest } from './_lib/validate.js'
import { buildPrompt, fallbackAnswer } from './_lib/prompt.js'
import { ProviderError, resolveProvider, streamCompletion } from './_lib/providers.js'

const SECURITY_HEADERS = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
}

function json(status: number, body: Record<string, unknown>, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS, ...extra } })
}

function allowedOrigin(req: Request): boolean {
  const origin = req.headers.get('origin')
  if (!origin) return true // same-origin fetches from some browsers, curl in dev
  let host: string
  try {
    host = new URL(origin).host
  } catch {
    return false
  }
  const self = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (host === self) return true
  const extra = (process.env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  return extra.some((o) => o === origin || o === host)
}

function textStream(first: string, rest: AsyncIterator<string> | null, onError: () => string): ReadableStream<Uint8Array> {
  const enc = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      if (first) controller.enqueue(enc.encode(first))
      if (rest) {
        try {
          for (;;) {
            const { value, done } = await rest.next()
            if (done) break
            controller.enqueue(enc.encode(value))
          }
        } catch {
          controller.enqueue(enc.encode(onError()))
        }
      }
      controller.close()
    },
    async cancel() {
      await rest?.return?.(undefined)
    },
  })
}

function streamResponse(body: ReadableStream<Uint8Array>, mode: 'llm' | 'fallback', sources: { title: string; href: string }[]) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Iyed-AI-Mode': mode,
      'X-Iyed-AI-Sources': encodeURIComponent(JSON.stringify(sources)),
      ...SECURITY_HEADERS,
    },
  })
}

function fallback(req: ChatRequest, reason: 'unconfigured' | 'error') {
  const fb = fallbackAnswer(req, reason)
  return streamResponse(textStream(fb.text, null, () => ''), 'fallback', fb.sources)
}

export async function POST(request: Request): Promise<Response> {
  if (!allowedOrigin(request)) return json(403, { error: 'Origin not allowed.', code: 'forbidden_origin' })
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json(415, { error: 'Use application/json.', code: 'bad_content_type' })

  let req: ChatRequest
  try {
    req = parseChatRequest(await request.text())
  } catch (err) {
    if (err instanceof ValidationError) return json(400, { error: err.message, code: err.code })
    return json(400, { error: 'Invalid request.', code: 'bad_request' })
  }

  const rate = await checkRateLimit(clientIp(request))
  if (!rate.ok) {
    return json(
      429,
      {
        error: rate.scope === 'global' ? 'The assistant has reached its daily limit. Please email Iyed directly.' : 'Too many questions in a short time. Please wait a moment.',
        code: rate.scope === 'global' ? 'daily_cap' : 'rate_limited',
        retryAfter: rate.retryAfter,
      },
      { 'Retry-After': String(rate.retryAfter) },
    )
  }

  const cfg = resolveProvider()
  if (!cfg) return fallback(req, 'unconfigured')

  const prompt = buildPrompt(req)
  const iterator = streamCompletion(cfg, { system: prompt.system, messages: prompt.messages, maxTokens: prompt.maxTokens, signal: request.signal })[Symbol.asyncIterator]()

  // Pull the first token before answering, so provider errors (bad key, quota,
  // outage) turn into a grounded fallback instead of a broken stream.
  let first = ''
  try {
    for (;;) {
      const r = await iterator.next()
      if (r.done) break
      first += r.value
      if (first.trim()) break
    }
  } catch (err) {
    console.error('[iyed-ai] provider error:', err instanceof ProviderError ? `${err.status} ${err.message}` : (err as Error)?.name)
    return fallback(req, 'error')
  }
  if (!first.trim()) return fallback(req, 'error')

  const cut = req.lang === 'fr' ? '\n\n_(Réponse interrompue. Réessayez.)_' : '\n\n_(The answer was interrupted. Please try again.)_'
  return streamResponse(textStream(first, iterator, () => cut), 'llm', prompt.sources)
}

export function GET(): Response {
  return json(405, { error: 'Use POST.', code: 'method_not_allowed' }, { Allow: 'POST' })
}
