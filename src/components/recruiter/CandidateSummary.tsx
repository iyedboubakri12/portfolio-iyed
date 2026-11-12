import { useState } from 'react'
import { candidateSummary } from '../../ai/knowledge'
import { useLang, type Lang } from '../../ai/i18n'

// The summary is generated from the verified knowledge base, not by the LLM,
// so it is instant, works offline and cannot contain invented facts.
export function CandidateSummary() {
  const [uiLang] = useLang()
  const [lang, setLang] = useState<Lang | null>(null)
  const [shown, setShown] = useState(false)
  const [copied, setCopied] = useState(false)
  const l = lang ?? uiLang
  const text = candidateSummary(l)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="summary">
      <div className="summary__bar">
        {!shown ? (
          <button className="btn" onClick={() => setShown(true)}>✦ {uiLang === 'fr' ? 'Générer la synthèse candidat' : 'Generate Candidate Summary'}</button>
        ) : (
          <>
            <div className="segmented" role="group" aria-label="Summary language">
              {(['en', 'fr'] as const).map((x) => (
                <button key={x} className={x === l ? 'is-active' : ''} aria-pressed={x === l} onClick={() => setLang(x)}>{x === 'en' ? 'English' : 'Français'}</button>
              ))}
            </div>
            <button className="btn btn--small" onClick={copy} aria-live="polite">{copied ? (uiLang === 'fr' ? 'Copié ✓' : 'Copied ✓') : uiLang === 'fr' ? 'Copier' : 'Copy summary'}</button>
          </>
        )}
        <span className="muted small">{uiLang === 'fr' ? 'Généré à partir des informations vérifiées uniquement.' : 'Generated from verified information only.'}</span>
      </div>
      {shown && <pre className="summary__text fade-in" tabIndex={0}>{text}</pre>}
    </div>
  )
}
