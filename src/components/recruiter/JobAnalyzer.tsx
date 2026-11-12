import { useMemo, useRef, useState } from 'react'
import { analyzeJob, type JobMatch, type MatchItem } from '../../ai/jobMatch'
import { LEVEL_LABEL } from '../../ai/knowledge'
import { T, useLang } from '../../ai/i18n'
import { errorText, streamChat, useAiStatus } from '../../ai/client'
import { Markdown } from '../assistant/Markdown'

const SAMPLE = `Junior DevOps Engineer (m/f)

We are looking for a Junior DevOps Engineer to join our platform team.

Responsibilities:
- Build and maintain CI/CD pipelines (GitLab CI or GitHub Actions)
- Deploy and operate containerised services on Kubernetes
- Automate infrastructure with Terraform on AWS
- Improve monitoring with Prometheus and Grafana
- Integrate security scanning (SAST, dependency and container scanning) into pipelines

Requirements:
- Bachelor's or engineering degree in computer science
- 1+ years of experience with Docker and Kubernetes
- Good knowledge of Linux and Bash scripting
- Python is a plus
- Fluent English, French is a plus`

function Chips({ items, tone, lang }: { items: MatchItem[]; tone: 'ok' | 'part' | 'miss'; lang: 'en' | 'fr' }) {
  if (!items.length) return <p className="muted small">{T[lang].job.none}</p>
  return (
    <ul className="evchips">
      {items.map((i) => (
        <li key={i.skill.id} className={`evchip evchip--${tone}`} title={i.skill.detail}>
          <strong>{i.skill.label}</strong>
          <span>{LEVEL_LABEL[i.level][lang]}</span>
          {i.skill.evidence[0] && (
            <a href={i.skill.evidence[0].href} className="evchip__link" {...(/^https?:/.test(i.skill.evidence[0].href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {i.skill.evidence[0].label} →
            </a>
          )}
        </li>
      ))}
    </ul>
  )
}

function Score({ m, lang }: { m: JobMatch; lang: 'en' | 'fr' }) {
  const s = T[lang].job
  const r = 34
  const c = 2 * Math.PI * r
  return (
    <div className="jobscore">
      <svg viewBox="0 0 80 80" width="88" height="88" role="img" aria-label={`${s.coverage}: ${m.coverage}%`}>
        <circle cx="40" cy="40" r={r} className="jobscore__track" />
        <circle cx="40" cy="40" r={r} className="jobscore__value" strokeDasharray={`${(m.coverage / 100) * c} ${c}`} transform="rotate(-90 40 40)" />
        <text x="40" y="45" textAnchor="middle" className="jobscore__num">{m.coverage}%</text>
      </svg>
      <div>
        <strong>{s.coverage}</strong>
        <p className="muted small">{s.coverageHint}</p>
        {m.yearsRequired !== null && m.yearsRequired >= 1 && <p className="jobwarn">{s.years(m.yearsRequired)}</p>}
        {m.seniority === 'senior' && <p className="jobwarn">{s.senior}</p>}
      </div>
    </div>
  )
}

export function JobAnalyzer({ compact = false }: { compact?: boolean }) {
  const [lang] = useLang()
  const s = T[lang]
  const ai = useAiStatus()
  const [jd, setJd] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [fallback, setFallback] = useState(false)
  const abort = useRef<AbortController | null>(null)

  const match = useMemo(() => (submitted ? analyzeJob(submitted) : null), [submitted])

  async function run() {
    const text = jd.trim()
    if (text.length < 80) {
      setError(s.job.tooShort)
      return
    }
    setError('')
    setSubmitted(text)
    setAnswer('')
    setFallback(false)
    if (ai === false) return // deterministic scorecard only
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setBusy(true)
    try {
      const r = await streamChat({ mode: 'job', lang, messages: [], jobDescription: text }, setAnswer, ctrl.signal)
      setFallback(r.mode === 'fallback')
    } catch (err) {
      if ((err as Error).name !== 'AbortError') setError(errorText(err, s.errors))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`jobtool ${compact ? 'jobtool--compact' : ''}`}>
      {!compact && <p className="muted">{s.job.intro}</p>}
      <label className="sr-only" htmlFor={compact ? 'jd-compact' : 'jd-full'}>{s.job.title}</label>
      <textarea
        id={compact ? 'jd-compact' : 'jd-full'}
        className="field field--area"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder={s.job.placeholder}
        rows={compact ? 6 : 9}
        maxLength={12000}
      />
      <div className="jobtool__actions">
        <button className="btn btn--small" onClick={run} disabled={busy || !jd.trim()}>{busy ? s.job.analyzing : s.job.analyze}</button>
        <button className="btn btn--ghost btn--small" onClick={() => setJd(SAMPLE)} disabled={busy}>{s.job.sample}</button>
        <span className="muted small">{jd.length.toLocaleString()} / 12,000</span>
      </div>
      {error && <p className="ai-error" role="alert">{error}</p>}

      {match && (
        <div className="jobresult fade-in" aria-live="polite">
          {match.recognised ? <Score m={match} lang={lang} /> : <p className="muted">{s.job.unrecognised}</p>}
          <div className={compact ? 'jobcols jobcols--stack' : 'jobcols'}>
            <div><h4>{s.job.matched} · {match.matched.length}</h4><Chips items={match.matched} tone="ok" lang={lang} /></div>
            <div><h4>{s.job.partial} · {match.partial.length}</h4><Chips items={match.partial} tone="part" lang={lang} /></div>
            <div><h4>{s.job.missing} · {match.missing.length}</h4><Chips items={match.missing} tone="miss" lang={lang} /></div>
          </div>
          {(answer || busy) && (
            <div className="jobai" aria-busy={busy}>
              <h4>{s.job.aiTitle}</h4>
              {answer ? <Markdown text={answer} /> : <TypingDots />}
              {fallback && <p className="muted small">{s.fallbackNote}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function TypingDots() {
  return (
    <span className="typing" aria-label="…">
      <span /><span /><span />
    </span>
  )
}
