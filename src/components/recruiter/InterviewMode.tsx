import { useEffect, useRef, useState, type FormEvent } from 'react'
import { INTERVIEW_BANK, INTERVIEW_TOPICS, LEVEL_LABEL, type InterviewTopic } from '../../ai/knowledge'
import { T, useLang } from '../../ai/i18n'
import { errorText, streamChat, useAiStatus, type Msg } from '../../ai/client'
import { Markdown } from '../assistant/Markdown'
import { TypingDots } from './JobAnalyzer'

export function InterviewMode({ compact = false, initialTopic }: { compact?: boolean; initialTopic?: InterviewTopic }) {
  const [lang] = useLang()
  const s = T[lang]
  const ai = useAiStatus()
  const [topic, setTopic] = useState<InterviewTopic>(initialTopic ?? 'Kubernetes')
  const [thread, setThread] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const abort = useRef<AbortController | null>(null)
  const bank = INTERVIEW_BANK[topic]

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic)
  }, [initialTopic])

  function pick(t: InterviewTopic) {
    abort.current?.abort()
    setTopic(t)
    setThread([])
    setError('')
  }

  async function ask(followUp?: string) {
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    const previous = thread
    // Thread = [seed (user), assistant, user, assistant, …]. The first generation
    // is sent without history (the server writes the task); follow-ups replay it.
    const seed: Msg = { role: 'user', content: lang === 'fr' ? `Génère des questions d'entretien sur ${topic}.` : `Generate interview questions on ${topic}.` }
    const shown: Msg[] = followUp && previous.length ? [...previous, { role: 'user', content: followUp }] : [seed]
    const toSend: Msg[] = followUp && previous.length ? shown.slice(-12).map((m) => ({ ...m, content: m.content.slice(0, m.role === 'user' ? 1500 : 6000) })) : []
    if (toSend.length && toSend[0].role !== 'user') toSend.shift()
    setThread([...shown, { role: 'assistant', content: '' }])
    setBusy(true)
    setError('')
    try {
      await streamChat({ mode: 'interview', lang, topic, messages: toSend }, (full) => setThread([...shown, { role: 'assistant', content: full }]), ctrl.signal)
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError(errorText(err, s.errors))
        setThread(previous)
      }
    } finally {
      setBusy(false)
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const q = draft.trim()
    if (!q || busy) return
    setDraft('')
    ask(q.slice(0, 1500))
  }

  const answers = thread.slice(1)

  return (
    <div className={`interview ${compact ? 'interview--compact' : ''}`}>
      {!compact && <p className="muted">{s.interview.intro}</p>}
      <div className="topicbar" role="tablist" aria-label={s.interview.title}>
        {INTERVIEW_TOPICS.map((t) => (
          <button key={t} role="tab" aria-selected={t === topic} className={`topic ${t === topic ? 'is-active' : ''}`} onClick={() => pick(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="interview__head">
        <span className={`lvl lvl--${bank.level}`}>{s.interview.level}: {LEVEL_LABEL[bank.level][lang]}</span>
        <span className="muted small">{bank.note}</span>
      </div>

      <ol className="qlist">
        {bank.questions.map((q) => (
          <li key={q.q} className="qcard">
            <p className="qcard__q">{q.q}</p>
            <details>
              <summary>{s.interview.lookFor}</summary>
              <p>{q.lookFor}</p>
            </details>
            <p className="qcard__ev">
              <span className="muted">{s.interview.evidence}:</span> {q.evidence}{' '}
              {q.link && <a className="link" href={q.link}>→</a>}
            </p>
          </li>
        ))}
      </ol>

      {ai !== false && (
        <div className="interview__ai">
          {!answers.length && (
            <button className="btn btn--ghost btn--small" onClick={() => ask()} disabled={busy}>
              ✦ {busy ? s.interview.generating : s.interview.generate}
            </button>
          )}
          {answers.map((m, i) =>
            m.role === 'assistant' ? (
              <div key={i} className="jobai" aria-busy={busy && i === answers.length - 1}>
                {m.content ? <Markdown text={m.content} /> : <TypingDots />}
              </div>
            ) : (
              <p key={i} className="interview__you">{m.content}</p>
            ),
          )}
          {answers.length > 0 && (
            <form className="ai-input ai-input--inline" onSubmit={submit}>
              <input className="field" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={s.interview.followUp} maxLength={1500} aria-label={s.interview.followUp} />
              <button className="btn btn--small" disabled={busy || !draft.trim()}>{s.send}</button>
            </form>
          )}
        </div>
      )}
      {error && <p className="ai-error" role="alert">{error}</p>}
    </div>
  )
}
