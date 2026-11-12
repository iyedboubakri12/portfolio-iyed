import { useEffect, useState } from 'react'
import type { InterviewTopic } from './knowledge'
import type { Lang } from './i18n'

export type Role = 'user' | 'assistant'
export type Msg = { role: Role; content: string }
export type Source = { title: string; href: string }

export type ChatPayload = {
  mode: 'chat' | 'job' | 'interview'
  lang: Lang
  messages: Msg[]
  topic?: InterviewTopic
  jobDescription?: string
}

export class ApiError extends Error {
  code: string
  status: number
  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
  }
}

export type StreamResult = { mode: 'llm' | 'fallback'; sources: Source[] }

export async function streamChat(payload: ChatPayload, onText: (full: string) => void, signal?: AbortSignal): Promise<StreamResult> {
  let res: Response
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new ApiError(0, 'network', 'Network error')
  }

  if (!res.ok) {
    let code = 'http_error'
    let message = `HTTP ${res.status}`
    try {
      const j = (await res.json()) as { code?: string; error?: string }
      code = j.code ?? code
      message = j.error ?? message
    } catch {
      /* not JSON (e.g. static hosting without functions) */
      if (res.status === 404) code = 'no_api'
    }
    throw new ApiError(res.status, code, message)
  }

  let sources: Source[] = []
  try {
    sources = JSON.parse(decodeURIComponent(res.headers.get('X-Iyed-AI-Sources') ?? '%5B%5D')) as Source[]
  } catch {
    /* ignore */
  }
  const mode = res.headers.get('X-Iyed-AI-Mode') === 'fallback' ? 'fallback' : 'llm'

  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader()
  let full = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    full += value
    onText(full)
  }
  return { mode, sources: sources.filter((s) => typeof s?.href === 'string' && typeof s?.title === 'string') }
}

/* AI availability, fetched once per page load. */
let statusPromise: Promise<boolean> | null = null
export function getAiStatus(): Promise<boolean> {
  statusPromise ??= fetch('/api/status')
    .then((r) => (r.ok ? r.json() : { ai: false }))
    .then((j: { ai?: boolean }) => Boolean(j.ai))
    .catch(() => false)
  return statusPromise
}

export function useAiStatus(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => {
    let alive = true
    getAiStatus().then((v) => alive && setOk(v))
    return () => {
      alive = false
    }
  }, [])
  return ok
}

/* Open the floating assistant from anywhere on the site. */
export type OpenRequest = { tab?: 'chat' | 'job' | 'interview'; prompt?: string; topic?: InterviewTopic }
export const OPEN_EVENT = 'iyedai:open'
export function openAssistant(req: OpenRequest = {}) {
  window.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: req }))
}

/** Friendly message for an error, in the UI language. */
export function errorText(err: unknown, s: { generic: string; network: string; rate: string }): string {
  if (err instanceof ApiError) {
    if (err.code === 'network') return s.network
    if (err.code === 'rate_limited') return s.rate
    if (err.code === 'no_api') return s.generic
    if (err.status === 400 || err.status === 429) return err.message
  }
  return s.generic
}
