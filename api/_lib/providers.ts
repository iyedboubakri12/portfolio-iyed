// Configurable LLM provider. Everything runs server-side; keys never reach the browser.
//
//   LLM_PROVIDER = anthropic | groq | openai | gemini | openrouter | mistral | openai-compatible
//   LLM_API_KEY  = key for that provider (or ANTHROPIC_API_KEY / GROQ_API_KEY / OPENAI_API_KEY ...)
//   LLM_MODEL    = optional for anthropic and groq, required for the others
//   LLM_BASE_URL = required for openai-compatible (e.g. a self-hosted vLLM or Ollama gateway)
//
// Anthropic uses the official SDK. The other providers all expose an
// OpenAI-compatible /chat/completions endpoint and are called with fetch.
import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage } from './validate.js'

export type ProviderName = 'anthropic' | 'groq' | 'openai' | 'gemini' | 'openrouter' | 'mistral' | 'openai-compatible'

type OpenAIPreset = { baseUrl: string; keyEnv: string; defaultModel?: string; fallbackModel?: string }

const OPENAI_PRESETS: Record<Exclude<ProviderName, 'anthropic'>, OpenAIPreset> = {
  groq: { baseUrl: 'https://api.groq.com/openai/v1', keyEnv: 'GROQ_API_KEY', defaultModel: 'openai/gpt-oss-120b', fallbackModel: 'openai/gpt-oss-20b' },
  openai: { baseUrl: 'https://api.openai.com/v1', keyEnv: 'OPENAI_API_KEY' },
  gemini: { baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', keyEnv: 'GEMINI_API_KEY' },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', keyEnv: 'OPENROUTER_API_KEY' },
  mistral: { baseUrl: 'https://api.mistral.ai/v1', keyEnv: 'MISTRAL_API_KEY' },
  'openai-compatible': { baseUrl: '', keyEnv: 'LLM_API_KEY' },
}

export type ProviderConfig = { provider: ProviderName; apiKey: string; model: string; baseUrl?: string; fallbackModel?: string }

export class ProviderError extends Error {
  status: number
  constructor(message: string, status = 502) {
    super(message)
    this.status = status
  }
}

/** Returns null when no provider is configured (the API then answers from the knowledge base only). */
export function resolveProvider(env = process.env): ProviderConfig | null {
  let provider = (env.LLM_PROVIDER ?? '').trim().toLowerCase() as ProviderName | ''
  if (!provider) {
    if (env.ANTHROPIC_API_KEY) provider = 'anthropic'
    else if (env.GROQ_API_KEY) provider = 'groq'
    else return null
  }
  if (provider === 'anthropic') {
    const apiKey = env.LLM_API_KEY || env.ANTHROPIC_API_KEY
    if (!apiKey) return null
    return { provider, apiKey, model: env.LLM_MODEL || 'claude-opus-5-5' }
  }
  const preset = OPENAI_PRESETS[provider]
  if (!preset) return null
  const apiKey = env.LLM_API_KEY || env[preset.keyEnv]
  const model = env.LLM_MODEL || preset.defaultModel
  const baseUrl = (env.LLM_BASE_URL || preset.baseUrl).replace(/\/$/, '')
  if (!apiKey || !model || !baseUrl) return null
  const fallbackModel = env.LLM_FALLBACK_MODEL === 'none' ? undefined : env.LLM_FALLBACK_MODEL || (env.LLM_MODEL ? undefined : preset.fallbackModel)
  return { provider, apiKey, model, baseUrl, fallbackModel }
}

export type CompletionInput = {
  system: string
  messages: ChatMessage[]
  maxTokens: number
  signal?: AbortSignal
}

const TIMEOUT_MS = 45_000
const MAX_RETRY_WAIT_S = 12

export async function* streamCompletion(cfg: ProviderConfig, input: CompletionInput): AsyncGenerator<string> {
  if (cfg.provider === 'anthropic') yield* streamAnthropic(cfg, input)
  else yield* streamOpenAICompatible(cfg, input)
}

async function* streamAnthropic(cfg: ProviderConfig, input: CompletionInput): AsyncGenerator<string> {
  const client = new Anthropic({ apiKey: cfg.apiKey, timeout: TIMEOUT_MS, maxRetries: 1 })
  const isOpus55 = cfg.model === 'claude-opus-5-5'
  try {
    const stream = client.beta.messages.stream(
      {
        model: cfg.model,
        // Thinking is always on for Claude Opus 5.5 and counts against max_tokens,
        // so leave headroom above the visible answer length.
        max_tokens: Math.max(4_000, input.maxTokens * 4),
        // Stable system prompt first, cached; the per-question context goes in the user turn.
        system: [{ type: 'text', text: input.system, cache_control: { type: 'ephemeral' } }],
        messages: input.messages,
        output_config: { effort: 'low' },
        ...(isOpus55 ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
      },
      { signal: input.signal },
    )
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') yield event.delta.text
      if (event.type === 'message_delta' && event.delta.stop_reason === 'refusal') {
        yield '\n\n_(The model declined to answer this request.)_'
      }
    }
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new ProviderError('LLM authentication failed', 502)
    if (err instanceof Anthropic.RateLimitError) throw new ProviderError('LLM provider rate limit', 503)
    if (err instanceof Anthropic.APIUserAbortError) return
    if (err instanceof Anthropic.APIError) throw new ProviderError(`LLM provider error ${err.status ?? ''}`.trim(), 502)
    throw err
  }
}

// Models that accept `reasoning_effort` and stream their reasoning in a separate
// field (never shown to the recruiter: only `delta.content` is forwarded).
const REASONING_MODEL = /gpt-oss|(^|\/)o\d|qwen3|deepseek-r1/i

async function* streamOpenAICompatible(cfg: ProviderConfig, input: CompletionInput): AsyncGenerator<string> {
  let model = cfg.model
  const signals = [AbortSignal.timeout(TIMEOUT_MS)]
  if (input.signal) signals.push(input.signal)
  const send = () => {
    const reasoning = REASONING_MODEL.test(model)
    return fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.2,
      // Reasoning models spend tokens before the visible answer: keep the effort
      // low and leave headroom so the answer is never cut off.
      max_tokens: reasoning ? input.maxTokens + 900 : input.maxTokens,
      ...(reasoning ? { reasoning_effort: process.env.LLM_REASONING_EFFORT || 'low' } : {}),
      messages: [{ role: 'system', content: input.system }, ...input.messages],
    }),
    signal: AbortSignal.any(signals),
    })
  }
  let res = await send()
  // Rate limits are per model (Groq): a second model doubles free-tier capacity.
  if (res.status === 429 && cfg.fallbackModel && cfg.fallbackModel !== model) {
    await res.body?.cancel()
    model = cfg.fallbackModel
    res = await send()
  }
  // Free tiers (e.g. Groq: tokens per minute) often ask to wait only a few
  // seconds: wait once and retry instead of failing the question.
  if (res.status === 429) {
    const wait = Number(res.headers.get('retry-after'))
    if (Number.isFinite(wait) && wait > 0 && wait <= MAX_RETRY_WAIT_S) {
      await res.body?.cancel()
      await new Promise((r) => setTimeout(r, wait * 1000 + 250))
      res = await send()
    }
  }
  if (!res.ok || !res.body) {
    // Never forward the provider's error body: it can echo request details.
    throw new ProviderError(`LLM provider error ${res.status}`, res.status === 429 ? 503 : 502)
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const data = line.trim()
      if (!data.startsWith('data:')) continue
      const payload = data.slice(5).trim()
      if (payload === '[DONE]') return
      try {
        const json = JSON.parse(payload) as { choices?: { delta?: { content?: string } }[] }
        const text = json.choices?.[0]?.delta?.content
        if (text) yield text
      } catch {
        // ignore keep-alives and partial lines
      }
    }
  }
}
