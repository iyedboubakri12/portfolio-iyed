import { useEffect, useState } from 'react'

// Replays the real stages of the PFE GitLab pipeline (.gitlab-ci.yml) as a terminal log.
// No invented timings or run numbers: only stage names and the tools that run in them.
const LINES: { t: string; k?: 'cmd' | 'ok' | 'info' | 'dim' }[] = [
  { t: '$ git push origin main', k: 'cmd' },
  { t: 'gitlab-ci  ▸ 13 stages · 32 jobs', k: 'dim' },
  { t: '✓ build       maven · npm', k: 'ok' },
  { t: '✓ test        junit · jest · jacoco', k: 'ok' },
  { t: '✓ sast/sca    sonarqube · trivy fs · gitleaks', k: 'ok' },
  { t: '✓ policy      opa/conftest  38% → 100%', k: 'ok' },
  { t: '✓ image       trivy · cyclonedx sbom · cosign', k: 'ok' },
  { t: '✓ deploy      argo cd → doks  synced · healthy', k: 'ok' },
  { t: '✓ dast        owasp zap', k: 'ok' },
  { t: '◉ runtime     falco → ai agent → slack (human approval)', k: 'info' },
  { t: 'pipeline runtime −40% after caching + parallel scans', k: 'dim' },
]

export function PipelineTerminal() {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [n, setN] = useState(reduced ? LINES.length : 1)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => setN((v) => (v >= LINES.length + 6 ? 1 : v + 1)), 420)
    return () => window.clearInterval(id)
  }, [reduced])

  return (
    <div className="tw" role="img" aria-label="Replay of the 13-stage DevSecOps pipeline from my final-year project">
      <div className="tw__bar" aria-hidden="true">
        <span /><span /><span />
        <em>pfe-devsecops · .gitlab-ci.yml</em>
      </div>
      <pre className="tw__body" aria-hidden="true">
        {LINES.slice(0, Math.min(n, LINES.length)).map((l, i) => (
          <span key={i} className={`tw__l tw__l--${l.k ?? 'ok'}`}>{l.t}{'\n'}</span>
        ))}
        {n <= LINES.length && <span className="caret" />}
      </pre>
    </div>
  )
}
