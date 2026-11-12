import { useMemo, useState } from 'react'
import { LEVEL_LABEL, SKILL_EVIDENCE, type EvidenceLevel } from '../../ai/knowledge'
import { useLang } from '../../ai/i18n'
import { openAssistant } from '../../ai/client'

const LEVELS: EvidenceLevel[] = ['project', 'internship', 'training']

export function SkillEvidence() {
  const [lang] = useLang()
  const [level, setLevel] = useState<EvidenceLevel | 'all'>('all')
  const [q, setQ] = useState('')

  const skills = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return SKILL_EVIDENCE.filter((s) => s.level !== 'none')
      .filter((s) => level === 'all' || s.level === level)
      .filter((s) => !needle || s.label.toLowerCase().includes(needle) || s.aliases.some((a) => a.includes(needle)) || s.detail.toLowerCase().includes(needle))
  }, [level, q])

  const counts = Object.fromEntries(LEVELS.map((l) => [l, SKILL_EVIDENCE.filter((s) => s.level === l).length])) as Record<EvidenceLevel, number>
  const notDocumented = SKILL_EVIDENCE.filter((s) => s.level === 'none').map((s) => s.label)

  return (
    <div className="skillev">
      <div className="skillev__bar">
        <div className="segmented" role="group" aria-label={lang === 'fr' ? 'Filtrer par niveau de preuve' : 'Filter by evidence level'}>
          <button className={level === 'all' ? 'is-active' : ''} aria-pressed={level === 'all'} onClick={() => setLevel('all')}>{lang === 'fr' ? 'Tout' : 'All'}</button>
          {LEVELS.map((l) => (
            <button key={l} className={level === l ? 'is-active' : ''} aria-pressed={level === l} onClick={() => setLevel(l)}>
              <span className={`lvl-dot lvl-dot--${l}`} /> {LEVEL_LABEL[l][lang]} <span className="muted">{counts[l]}</span>
            </button>
          ))}
        </div>
        <input className="field field--search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={lang === 'fr' ? 'Rechercher (ex. k8s, sbom, aws)…' : 'Search (e.g. k8s, sbom, aws)…'} aria-label="Search skills" />
      </div>

      <ul className="skillev__grid">
        {skills.map((s) => (
          <li key={s.id} className={`card skillcard skillcard--${s.level}`}>
            <div className="skillcard__head">
              <h3>{s.label}</h3>
              <span className={`lvl lvl--${s.level}`}>{LEVEL_LABEL[s.level][lang]}</span>
            </div>
            <p className="muted small">{s.category}</p>
            <p>{s.detail}</p>
            <div className="skillcard__ev">
              {s.evidence.map((e) => (
                <a key={e.href + e.label} href={e.href} {...(/^https?:|\.webp$/.test(e.href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{e.label}</a>
              ))}
              <button onClick={() => openAssistant({ tab: 'chat', prompt: lang === 'fr' ? `Quelle est l'expérience d'Iyed avec ${s.label} ?` : `What is Iyed's experience with ${s.label}?` })}>✦ {lang === 'fr' ? 'Demander' : 'Ask'}</button>
            </div>
          </li>
        ))}
        {!skills.length && <li className="muted">{lang === 'fr' ? 'Aucune compétence ne correspond.' : 'No skill matches.'}</li>}
      </ul>

      <p className="muted small skillev__none">
        <strong>{lang === 'fr' ? 'Non documenté (pour être transparent) :' : 'Not documented (for transparency):'}</strong> {notDocumented.join(' · ')}
      </p>
    </div>
  )
}
