import { INTERVIEW_TOPICS, type InterviewTopic } from '../../src/ai/knowledge.js'

export type Mode = 'chat' | 'job' | 'interview'
export type Lang = 'en' | 'fr'
export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export type ChatRequest = {
  mode: Mode
  lang: Lang
  messages: ChatMessage[]
  topic?: InterviewTopic
  jobDescription?: string
}

export const LIMITS = {
  bodyBytes: 40_000,
  messages: 16,
  userChars: 1_500,
  assistantChars: 6_000,
  jobMin: 80,
  jobMax: 12_000,
}

export class ValidationError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

// Strip control characters (keep \n and \t) so nothing odd reaches the model or the logs.
// eslint-disable-next-line no-control-regex -- matching control characters is the point
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()

export function parseChatRequest(raw: string): ChatRequest {
  if (raw.length > LIMITS.bodyBytes) throw new ValidationError('too_large', 'Request body is too large.')
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    throw new ValidationError('bad_json', 'Body must be valid JSON.')
  }
  if (!isObj(body)) throw new ValidationError('bad_body', 'Body must be a JSON object.')

  const mode = body.mode
  if (mode !== 'chat' && mode !== 'job' && mode !== 'interview') throw new ValidationError('bad_mode', 'Unknown mode.')
  const lang: Lang = body.lang === 'fr' ? 'fr' : 'en'

  const rawMessages = body.messages ?? []
  if (!Array.isArray(rawMessages)) throw new ValidationError('bad_messages', 'messages must be an array.')
  if (rawMessages.length > LIMITS.messages) throw new ValidationError('too_many_messages', 'Conversation is too long. Start a new one.')

  const messages: ChatMessage[] = rawMessages.map((m, i) => {
    if (!isObj(m) || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') {
      throw new ValidationError('bad_message', `Message ${i} is invalid.`)
    }
    const content = clean(m.content)
    const max = m.role === 'user' ? LIMITS.userChars : LIMITS.assistantChars
    if (content.length > max) throw new ValidationError('message_too_long', `Messages are limited to ${max} characters.`)
    return { role: m.role, content }
  })

  // Must alternate and start/end with the user (the API contracts require it).
  for (let i = 0; i < messages.length; i++) {
    const expected = i % 2 === 0 ? 'user' : 'assistant'
    if (messages[i].role !== expected) throw new ValidationError('bad_order', 'Messages must alternate user / assistant, starting with user.')
  }

  const req: ChatRequest = { mode, lang, messages }

  if (mode === 'chat') {
    if (!messages.length || messages[messages.length - 1].role !== 'user') throw new ValidationError('empty', 'Please type a question.')
    if (!messages[messages.length - 1].content) throw new ValidationError('empty', 'Please type a question.')
  }

  if (mode === 'job') {
    const jd = typeof body.jobDescription === 'string' ? clean(body.jobDescription) : ''
    if (jd.length < LIMITS.jobMin) throw new ValidationError('job_too_short', `Paste a job description of at least ${LIMITS.jobMin} characters.`)
    if (jd.length > LIMITS.jobMax) throw new ValidationError('job_too_long', `Job descriptions are limited to ${LIMITS.jobMax} characters.`)
    req.jobDescription = jd
    if (messages.length && messages[messages.length - 1].role !== 'user') throw new ValidationError('bad_order', 'Last message must be from the user.')
  }

  if (mode === 'interview') {
    if (typeof body.topic !== 'string' || !(INTERVIEW_TOPICS as readonly string[]).includes(body.topic)) throw new ValidationError('bad_topic', 'Unknown interview topic.')
    req.topic = body.topic as InterviewTopic
    if (messages.length && messages[messages.length - 1].role !== 'user') throw new ValidationError('bad_order', 'Last message must be from the user.')
  }

  return req
}
