import { useState } from 'react'
import { ARCH_EDGES, ARCH_NODES, type ArchNode } from '../../ai/knowledge'
import { openAssistant } from '../../ai/client'
import { useLang } from '../../ai/i18n'

const W = 150
const H = 56

const ZONE_LABEL = { ci: 'Shift-left CI/CD', runtime: 'Cloud-native runtime', ai: 'AI remediation', gov: 'Observability & governance' }

function center(id: string) {
  const n = ARCH_NODES.find((x) => x.id === id)!
  return { x: n.x, y: n.y }
}

function edgePath(from: string, to: string) {
  const a = center(from)
  const b = center(to)
  if (a.y === b.y) {
    const dir = b.x > a.x ? 1 : -1
    return `M${a.x + (dir * W) / 2} ${a.y} L${b.x - (dir * W) / 2 - dir * 6} ${b.y}`
  }
  const dir = b.y > a.y ? 1 : -1
  return `M${a.x} ${a.y + (dir * H) / 2} L${b.x} ${b.y - (dir * H) / 2 - dir * 6}`
}

export function ArchitectureMap() {
  const [lang] = useLang()
  const [active, setActive] = useState<ArchNode>(ARCH_NODES[1])

  return (
    <div className="archmap">
      <div className="archmap__canvas">
        <svg viewBox="0 0 1010 520" role="group" aria-label="Interactive architecture of the DevSecOps platform">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" className="archmap__arrowhead" />
            </marker>
            <linearGradient id="nodeActive" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#4f8cff" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <rect x="10" y="30" width="990" height="100" rx="16" className="archmap__zone archmap__zone--ci" />
          <text x="24" y="24" className="archmap__zonelabel">{ZONE_LABEL.ci}</text>
          <rect x="10" y="200" width="990" height="100" rx="16" className="archmap__zone archmap__zone--gov" />
          <text x="24" y="194" className="archmap__zonelabel">{ZONE_LABEL.gov} · {ZONE_LABEL.runtime}</text>
          <rect x="10" y="370" width="990" height="100" rx="16" className="archmap__zone archmap__zone--ai" />
          <text x="24" y="364" className="archmap__zonelabel">{ZONE_LABEL.ai}</text>

          {ARCH_EDGES.map((e) => {
            const d = e.path ?? edgePath(e.from, e.to)
            const on = active.id === e.from || active.id === e.to
            return (
              <g key={`${e.from}-${e.to}`}>
                <path d={d} className={`archmap__edge ${on ? 'is-on' : ''}`} markerEnd="url(#arrow)" />
                {e.label && on && <EdgeLabel d={d} label={e.label} />}
              </g>
            )
          })}

          {ARCH_NODES.map((n) => {
            const on = n.id === active.id
            return (
              <g
                key={n.id}
                className={`archmap__node archmap__node--${n.zone} ${on ? 'is-active' : ''}`}
                transform={`translate(${n.x - W / 2} ${n.y - H / 2})`}
                tabIndex={0}
                role="button"
                aria-pressed={on}
                aria-label={`${n.label}: ${n.sub}`}
                onClick={() => setActive(n)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setActive(n))}
              >
                <rect width={W} height={H} rx="12" />
                <text x={W / 2} y="24" textAnchor="middle" className="archmap__label">{n.label}</text>
                <text x={W / 2} y="42" textAnchor="middle" className="archmap__sub">{n.sub.length > 26 ? n.sub.slice(0, 25) + '…' : n.sub}</text>
              </g>
            )
          })}
        </svg>
      </div>

      <ul className="archmap__chips" aria-label="Components">
        {ARCH_NODES.map((n) => (
          <li key={n.id}>
            <button className={n.id === active.id ? 'is-active' : ''} onClick={() => setActive(n)} aria-pressed={n.id === active.id}>{n.label}</button>
          </li>
        ))}
      </ul>

      <article className="card archmap__detail fade-in" key={active.id} aria-live="polite">
        <div>
          <p className="eyebrow">{ZONE_LABEL[active.zone]}</p>
          <h3>{active.label}</h3>
          <p className="muted small">{active.sub}</p>
          <p>{active.what}</p>
          <p className="archmap__why"><strong>{lang === 'fr' ? 'Pourquoi' : 'Why it matters'}:</strong> {active.why}</p>
          <button className="btn btn--small" onClick={() => openAssistant({ tab: 'chat', prompt: lang === 'fr' ? `Explique-moi ce composant du projet DevSecOps : ${active.label}.` : active.ask })}>
            ✦ {lang === 'fr' ? 'Demander à Iyed AI' : 'Ask Iyed AI about this'}
          </button>
        </div>
        {active.img && (
          <a className="archmap__shot" href={active.img} target="_blank" rel="noopener noreferrer">
            <img src={active.img} alt={`Screenshot: ${active.label}`} loading="lazy" />
            <span>{lang === 'fr' ? 'Capture réelle du projet' : 'Real screenshot from the project'} ↗</span>
          </a>
        )}
      </article>
    </div>
  )
}

function EdgeLabel({ d, label }: { d: string; label: string }) {
  const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i + 1 < nums.length; i += 2) pts.push({ x: nums[i], y: nums[i + 1] })
  const mid = pts[Math.floor(pts.length / 2)]
  const prev = pts[Math.max(0, Math.floor(pts.length / 2) - 1)]
  const x = (mid.x + prev.x) / 2
  const y = (mid.y + prev.y) / 2
  const w = label.length * 7 + 14
  return (
    <g className="archmap__edgelabel" transform={`translate(${x - w / 2} ${y - 11})`}>
      <rect width={w} height="22" rx="11" />
      <text x={w / 2} y="15" textAnchor="middle">{label}</text>
    </g>
  )
}
