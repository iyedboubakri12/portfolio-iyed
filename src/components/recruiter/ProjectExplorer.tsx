import { useState } from 'react'
import { PROJECT_DETAILS } from '../../ai/knowledge'
import { useLang } from '../../ai/i18n'
import { openAssistant } from '../../ai/client'

const FIELDS = [
  ['problem', { en: 'Problem', fr: 'Problème' }],
  ['architecture', { en: 'Architecture', fr: 'Architecture' }],
  ['tech', { en: 'Technologies', fr: 'Technologies' }],
  ['contribution', { en: 'My contribution', fr: 'Ma contribution' }],
  ['challenges', { en: 'Challenges', fr: 'Défis' }],
  ['results', { en: 'Results', fr: 'Résultats' }],
  ['lessons', { en: 'Lessons learned', fr: 'Enseignements' }],
] as const

const ND = 'Not documented in the portfolio.'

export function ProjectExplorer() {
  const [lang] = useLang()
  const [id, setId] = useState(PROJECT_DETAILS[0].id)
  const p = PROJECT_DETAILS.find((x) => x.id === id)!

  return (
    <div className="projx">
      <div className="projx__list" role="tablist" aria-label="Projects">
        {PROJECT_DETAILS.map((x) => (
          <button key={x.id} role="tab" aria-selected={x.id === id} className={x.id === id ? 'is-active' : ''} onClick={() => setId(x.id)}>
            <strong>{x.name}</strong>
            <span>{x.context}</span>
          </button>
        ))}
      </div>

      <article className="card projx__panel fade-in" key={p.id} role="tabpanel">
        <p className="eyebrow">{p.context}</p>
        <h3>{p.name}</h3>
        <dl className="projx__fields">
          {FIELDS.map(([key, label]) => {
            const v = p[key]
            const list = Array.isArray(v) ? v : null
            const empty = list ? list.length === 1 && list[0] === ND : v === ND
            return (
              <div key={key} className={empty ? 'is-empty' : ''}>
                <dt>{label[lang]}</dt>
                <dd>
                  {key === 'tech' && list ? (
                    <ul className="chips chips--small">{list.map((t) => <li key={t}>{t}</li>)}</ul>
                  ) : list ? (
                    empty ? <span className="muted">{lang === 'fr' ? 'Non documenté dans le portfolio.' : ND}</span> : <ul>{list.map((t) => <li key={t}>{t}</li>)}</ul>
                  ) : empty ? (
                    <span className="muted">{lang === 'fr' ? 'Non documenté dans le portfolio.' : ND}</span>
                  ) : (
                    <p>{v as string}</p>
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
        <div className="projx__actions">
          {p.hasDiagram && <a className="btn btn--small" href="#architecture">{lang === 'fr' ? 'Architecture interactive' : 'Interactive architecture'}</a>}
          {p.links.map((l) => (
            <a key={l.href} className="btn btn--ghost btn--small" href={l.href} {...(/^https?:/.test(l.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{l.label}</a>
          ))}
          <button className="btn btn--ghost btn--small" onClick={() => openAssistant({ tab: 'chat', prompt: lang === 'fr' ? `Parle-moi du projet « ${p.name} » : ce qu'Iyed a fait concrètement et ce qui n'est pas documenté.` : `Tell me about the "${p.name}" project: what Iyed did concretely and what is not documented.` })}>
            ✦ {lang === 'fr' ? 'Demander au projet' : 'Ask about this project'}
          </button>
        </div>
      </article>
    </div>
  )
}
