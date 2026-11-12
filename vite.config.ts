import { defineConfig, loadEnv, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'

// Serves the Vercel functions in /api during `npm run dev`, so the assistant
// works locally with the same code that runs in production. Server-only
// variables (LLM_API_KEY, ...) are read from .env.local and never exposed to
// the browser bundle (only VITE_* variables are).
function localApi(): Plugin {
  const routes: Record<string, string> = { '/api/chat': '/api/chat.ts', '/api/status': '/api/status.ts' }

  async function handle(server: ViteDevServer, req: IncomingMessage, res: ServerResponse, file: string) {
    const chunks: Buffer[] = []
    for await (const c of req) chunks.push(c as Buffer)
    const controller = new AbortController()
    res.on('close', () => controller.abort())
    const request = new Request(`http://${req.headers.host}${req.url}`, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : Buffer.concat(chunks),
      signal: controller.signal,
    })
    const mod = await server.ssrLoadModule(file)
    const fn = mod[req.method ?? 'GET'] as ((r: Request) => Promise<Response> | Response) | undefined
    const response = fn ? await fn(request) : new Response('Method not allowed', { status: 405 })
    res.statusCode = response.status
    response.headers.forEach((v, k) => res.setHeader(k, v))
    if (!response.body) return res.end()
    const reader = response.body.getReader()
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      res.write(value)
    }
    res.end()
  }

  return {
    name: 'local-vercel-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0]
        const file = routes[path]
        if (!file) return next()
        handle(server, req, res, file).catch((err) => {
          server.config.logger.error(`[api] ${err?.stack ?? err}`)
          if (!res.headersSent) res.statusCode = 500
          res.end()
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [k, v] of Object.entries(env)) if (!(k in process.env)) process.env[k] = v

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      localApi(),
    ],
  }
})
