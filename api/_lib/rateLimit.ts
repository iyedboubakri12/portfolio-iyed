// Fixed-window rate limiting per client IP, plus a global daily cap that
// protects the LLM budget.
//
// With UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN set, counters live in
// Redis and are shared by every serverless instance. Without them, counters are
// kept in memory: good enough for local development and light traffic, but each
// Vercel instance then has its own counters.

type Window = { name: string; limit: number; seconds: number }

const num = (v: string | undefined, d: number) => (v && /^\d+$/.test(v) ? Number(v) : d)

export const WINDOWS: Window[] = [
  { name: 'min', limit: num(process.env.RATE_LIMIT_PER_MINUTE, 8), seconds: 60 },
  { name: 'day', limit: num(process.env.RATE_LIMIT_PER_DAY, 60), seconds: 86_400 },
]
const GLOBAL_DAILY = num(process.env.LLM_DAILY_CAP, 1_500)

const memory = new Map<string, { count: number; reset: number }>()

function memoryIncr(key: string, seconds: number): number {
  const now = Date.now()
  const hit = memory.get(key)
  if (!hit || hit.reset <= now) {
    memory.set(key, { count: 1, reset: now + seconds * 1000 })
    if (memory.size > 5_000) for (const [k, v] of memory) if (v.reset <= now) memory.delete(k)
    return 1
  }
  hit.count += 1
  return hit.count
}

async function redisIncr(key: string, seconds: number): Promise<number> {
  const url = process.env.UPSTASH_REDIS_REST_URL!
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!
  const res = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', key],
      ['EXPIRE', key, String(seconds), 'NX'],
    ]),
    signal: AbortSignal.timeout(2_000),
  })
  if (!res.ok) throw new Error(`redis ${res.status}`)
  const data = (await res.json()) as { result: number }[]
  return Number(data[0]?.result ?? 0)
}

const redisEnabled = () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

async function incr(key: string, seconds: number) {
  if (redisEnabled()) {
    try {
      return await redisIncr(key, seconds)
    } catch {
      // Redis unavailable: degrade to per-instance memory rather than failing open completely.
    }
  }
  return memoryIncr(key, seconds)
}

export type RateResult = { ok: true } | { ok: false; retryAfter: number; scope: 'client' | 'global' }

export async function checkRateLimit(ip: string): Promise<RateResult> {
  const now = Math.floor(Date.now() / 1000)
  for (const w of WINDOWS) {
    const bucket = Math.floor(now / w.seconds)
    const count = await incr(`iyedai:${w.name}:${bucket}:${ip}`, w.seconds)
    if (count > w.limit) return { ok: false, retryAfter: (bucket + 1) * w.seconds - now, scope: 'client' }
  }
  const day = Math.floor(now / 86_400)
  const total = await incr(`iyedai:global:${day}`, 86_400)
  if (total > GLOBAL_DAILY) return { ok: false, retryAfter: (day + 1) * 86_400 - now, scope: 'global' }
  return { ok: true }
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  const ip = (fwd ? fwd.split(',')[0] : req.headers.get('x-real-ip')) ?? 'unknown'
  return ip.trim().slice(0, 64) || 'unknown'
}
