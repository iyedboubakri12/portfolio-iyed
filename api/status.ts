// GET /api/status — tells the UI whether a live model is configured.
// Exposes only a boolean and the provider family, never keys or model settings.
import { resolveProvider } from './_lib/providers.js'

export function GET(): Response {
  const cfg = resolveProvider()
  return new Response(JSON.stringify({ ai: Boolean(cfg) }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60', 'X-Content-Type-Options': 'nosniff' },
  })
}
