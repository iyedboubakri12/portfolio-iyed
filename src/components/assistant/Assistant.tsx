import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { PROFILE } from '../../data'
import { RECRUITER_PATH, type InterviewTopic } from '../../ai/knowledge'
import { detectLang, T, useLang } from '../../ai/i18n'
import { errorText, OPEN_EVENT, streamChat, useAiStatus, type Msg, type OpenRequest, type Source } from '../../ai/client'
import { Markdown } from './Markdown'
import { JobAnalyzer, TypingDots } from '../recruiter/JobAnalyzer'
import { InterviewMode } from '../recruiter/InterviewMode'
import { DownloadIcon, MailIcon } from '../Icons'

type Tab = 'chat' | 'job' | 'interview'
type Turn = Msg & { sources?: Source[]; fallback?: boolean; error?: boolean }

const MAX_HISTORY = 10

function Spark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 2.5z" fill="currentColor" />
      <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" fill="currentColor" opacity=".7" />
    </svg>
  )
}

export default function Assistant() {
  const [lang, setLang] = useLang()
  const s = T[lang]
  const ai = useAiStatus()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('chat')
  const [topic, setTopic] = useState<InterviewTopic | undefined>()
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [nudgeHidden, setNudgeHidden] = useState(false)
  const abort = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const pending = useRef<string | null>(null)

  const close = useCallback(() => {
    setOpen(false)
    launcherRef.current?.focus()
  }, [])

  const send = useCallback(
    async (text: string) => {
      const q = text.trim().slice(0, 1500)
      if (!q || busy) return
      const replyLang = detectLang(q, lang)
      const history: Msg[] = []
      for (const t of turns) if (!t.error) history.push({ role: t.role, content: t.content.slice(0, t.role === 'user' ? 1500 : 6000) })
      // keep strict user/assistant alternation and a bounded window
      const clean: Msg[] = []
      for (const m of history) if (m.role === (clean.length % 2 === 0 ? 'user' : 'assistant') && m.content) clean.push(m)
      if (clean.length % 2 === 1) clean.pop()
      const windowed = clean.slice(-MAX_HISTORY)
      const messages: Msg[] = [...windowed, { role: 'user', content: q }]

      const base: Turn[] = [...turns, { role: 'user', content: q }]
      setTurns([...base, { role: 'assistant', content: '' }])
      setDraft('')
      setBusy(true)
      abort.current?.abort()
      const ctrl = new AbortController()
      abort.current = ctrl
      try {
        const r = await streamChat({ mode: 'chat', lang: replyLang, messages }, (full) => setTurns([...base, { role: 'assistant', content: full }]), ctrl.signal)
        setTurns((cur) => {
          const next = [...cur]
          const last = next[next.length - 1]
          if (last?.role === 'assistant') next[next.length - 1] = { ...last, sources: r.sources, fallback: r.mode === 'fallback' }
          return next
        })
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          setTurns((cur) => {
            const last = cur[cur.length - 1]
            return last?.role === 'assistant' && !last.content ? cur.slice(0, -2) : cur
          })
        } else {
          setTurns([...base, { role: 'assistant', content: errorText(err, s.errors), error: true }])
        }
      } finally {
        setBusy(false)
      }
    },
    [busy, lang, turns, s.errors],
  )

  // Open requests from quick actions anywhere on the site.
  useEffect(() => {
    const onOpen = (e: Event) => {
      const req = (e as CustomEvent<OpenRequest>).detail ?? {}
      setOpen(true)
      setTab(req.tab ?? 'chat')
      if (req.topic) setTopic(req.topic)
      if (req.prompt) pending.current = req.prompt
    }
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (open && tab === 'chat' && pending.current && !busy) {
      const p = pending.current
      pending.current = null
      send(p)
    }
  }, [open, tab, busy, send])

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    if (tab === 'chat') setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, tab, close])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [turns])

  useEffect(() => () => abort.current?.abort(), [])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (busy) {
      abort.current?.abort()
      return
    }
    send(draft)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      if (!busy) send(draft)
    }
  }

  const answered = turns.filter((t) => t.role === 'assistant' && t.content && !t.error).length
  const showNudge = answered >= 2 && !nudgeHidden && !busy

  return (
    <>
      <button
        ref={launcherRef}
        className={`ai-launcher ${open ? 'is-hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="iyed-ai-panel"
      >
        <span className="ai-launcher__icon"><Spark /></span>
        <span className="ai-launcher__text">{s.open}</span>
      </button>

      <section
        id="iyed-ai-panel"
        className={`ai-panel ${open ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby="iyed-ai-title"
        hidden={!open}
      >
        <header className="ai-panel__head">
          <span className="ai-avatar" aria-hidden="true"><Spark size={18} /></span>
          <div className="ai-panel__title">
            <h2 id="iyed-ai-title">{s.assistantName}</h2>
            <p>
              <span className={`ai-status ${ai ? 'is-on' : ''}`} /> {s.assistantRole} · {ai === null ? '…' : ai ? s.online : s.offline}
            </p>
          </div>
          <div className="ai-lang" role="group" aria-label="Language">
            {(['en', 'fr'] as const).map((l) => (
              <button key={l} className={l === lang ? 'is-active' : ''} aria-pressed={l === lang} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
            ))}
          </div>
          <button className="ai-icon-btn" onClick={close} aria-label={s.close}>×</button>
        </header>

        <nav className="ai-tabs" role="tablist" aria-label="Assistant modes">
          {(['chat', 'job', 'interview'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'is-active' : ''} onClick={() => setTab(t)}>{s.tabs[t]}</button>
          ))}
          {tab === 'chat' && turns.length > 0 && (
            <button className="ai-tabs__reset" onClick={() => { abort.current?.abort(); setTurns([]); setNudgeHidden(false) }}>{s.newChat}</button>
          )}
        </nav>

        {tab === 'chat' && (
          <>
            <div className="ai-body" ref={listRef} aria-live="polite" aria-busy={busy}>
              <div className="ai-msg ai-msg--assistant">
                <Markdown text={s.welcome} />
                <p className="ai-note">{s.grounded}</p>
              </div>

              {turns.length === 0 && (
                <>
                  <ul className="ai-suggest" aria-label="Suggested questions">
                    {s.suggestions.map((q) => (
                      <li key={q}><button onClick={() => send(q)}>{q}</button></li>
                    ))}
                  </ul>
                  <div className="ai-quick">
                    <a href={`${RECRUITER_PATH}#skills`} onClick={close}>{s.quick.skills}</a>
                    <a href={`${RECRUITER_PATH}#projects`} onClick={close}>{s.quick.projects}</a>
                    <button onClick={() => setTab('job')}>{s.quick.job}</button>
                    <button onClick={() => setTab('interview')}>{s.quick.interview}</button>
                    <a href={PROFILE.cv} download>{s.quick.cv}</a>
                    <a href={`mailto:${PROFILE.email}`}>{s.quick.contact}</a>
                  </div>
                </>
              )}

              {turns.map((t, i) => (
                <div key={i} className={`ai-msg ai-msg--${t.role} ${t.error ? 'ai-msg--error' : ''}`}>
                  {t.role === 'assistant' ? (
                    t.content ? <Markdown text={t.content} /> : <TypingDots />
                  ) : (
                    <p>{t.content}</p>
                  )}
                  {t.fallback && <p className="ai-note">{s.fallbackNote}</p>}
                  {!!t.sources?.length && (
                    <div className="ai-sources">
                      <span>{s.sources}</span>
                      {t.sources.map((src) => (
                        <a key={src.href + src.title} href={src.href} {...(/^https?:/.test(src.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                          {src.title.replace(/^(Skill|Project|Architecture|Experience): /, '')}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {showNudge && (
                <div className="ai-nudge fade-in">
                  <span>{s.convert.text}</span>
                  <a className="btn btn--small" href={`mailto:${PROFILE.email}?subject=${encodeURIComponent('Opportunity for Iyed Boubakri')}`}><MailIcon size={14} /> {s.convert.email}</a>
                  <a className="btn btn--ghost btn--small" href={PROFILE.cv} download><DownloadIcon size={14} /> {s.convert.cv}</a>
                  <button className="ai-icon-btn ai-icon-btn--sm" onClick={() => setNudgeHidden(true)} aria-label={s.convert.dismiss}>×</button>
                </div>
              )}
            </div>

            <form className="ai-input" onSubmit={onSubmit}>
              <textarea
                ref={inputRef}
                className="field"
                rows={1}
                value={draft}
                maxLength={1500}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={s.placeholder}
                aria-label={s.placeholder}
              />
              <button className="btn btn--small" disabled={!busy && !draft.trim()} aria-label={busy ? s.stop : s.send}>
                {busy ? '■' : '↑'}
              </button>
            </form>
          </>
        )}

        {tab === 'job' && (
          <div className="ai-body ai-body--tool">
            <JobAnalyzer compact />
          </div>
        )}

        {tab === 'interview' && (
          <div className="ai-body ai-body--tool">
            <InterviewMode compact initialTopic={topic} />
          </div>
        )}
      </section>
    </>
  )
}
