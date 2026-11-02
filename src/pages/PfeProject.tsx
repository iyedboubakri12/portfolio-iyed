import { useCallback, useEffect, useState } from 'react'
import { HIGHLIGHTS, IMG, PFE_REPO, PROFILE } from '../data'
import { DEMO, GALLERY, STAGES, type Stage } from '../pfe'
import { Lightbox } from '../components/Layout'
import { ArrowIcon, GitHubIcon } from '../components/Icons'
import { useReveal } from '../useReveal'

const GROUP_LABEL: Record<Stage['group'], string> = {
  build: 'Build & test',
  security: 'Security check',
  supply: 'Supply chain',
  deploy: 'Deploy',
  runtime: 'AI remediation',
}

type Shot = { src: string; caption: string }

export default function PfeProject() {
  useReveal()
  const [shot, setShot] = useState<Shot | null>(null)
  const close = useCallback(() => setShot(null), [])

  return (
    <article className="pfe">
      <header className="pfe__hero">
        <div className="container">
          <a href="/#projects" className="link small">← All projects</a>
          <p className="eyebrow">Final-year engineering project · ESPRIT × SFM Technologies · 2025–2026</p>
          <h1>Cloud-Native DevSecOps Platform with AI-Assisted Remediation</h1>
          <p className="pfe__lead">
            A 13-stage GitLab CI/CD pipeline secures every commit. Argo CD delivers 7 signed images to a 3-node DigitalOcean Kubernetes cluster.
            Falco watches the running workloads, and an AI agent (RAG + Llama 3.3 70B via Groq) explains each alert and proposes a fix in Slack for an engineer to approve.
          </p>
          <div className="hero__actions">
            <a className="btn" href="#demo">Start the walkthrough <ArrowIcon /></a>
            <a className="btn btn--ghost" href={PFE_REPO} target="_blank" rel="noopener noreferrer"><GitHubIcon size={16} /> Source code</a>
          </div>
          <div className="notice" role="note">
            <strong>About this demo.</strong> The DOKS cluster, SonarQube, DefectDojo and the Slack workspace used during the PFE have been shut down after the defence, so there is no public live URL.
            This page replays the <em>real</em> run: every image below is a screenshot taken in the project environment, and every pipeline stage maps to a job in the repository.
          </div>
        </div>
      </header>

      <section className="section reveal">
        <div className="container">
          <ul className="hero__stats hero__stats--wide" aria-label="Project results">
            {HIGHLIGHTS.map((h) => <li key={h.label}><strong>{h.value}</strong><span>{h.label}</span></li>)}
          </ul>
        </div>
      </section>

      <section id="architecture" className="section reveal">
        <div className="container">
          <p className="eyebrow">1 · Architecture</p>
          <h2 className="section__title">Three loops: build securely, run securely, fix fast</h2>
          <div className="arch">
            <div className="arch__col">
              <span className="arch__num">1</span>
              <h3>Shift-left CI/CD</h3>
              <p>GitLab CI on a self-hosted runner: build, tests, SAST, SCA, secrets, Policy-as-Code, image scan, SBOM, signing and DAST. Every report goes to DefectDojo.</p>
            </div>
            <div className="arch__col">
              <span className="arch__num">2</span>
              <h3>Cloud-native runtime</h3>
              <p>DOKS with 3 nodes. Argo CD syncs the <code>k8s/</code> manifests from Git with self-heal, Gatekeeper enforces admission policies, Falco (eBPF) watches syscalls and Prometheus with Grafana provide observability.</p>
            </div>
            <div className="arch__col">
              <span className="arch__num">3</span>
              <h3>AI remediation</h3>
              <p>Falcosidekick sends alerts to a Python agent. The agent retrieves the matching internal rules (RAG), asks Llama 3.3 70B for a fix and posts it to Slack. A human approves before anything is applied.</p>
            </div>
          </div>
          <button className="figure" onClick={() => setShot({ src: `${IMG}/global-architecture.webp`, caption: 'Global architecture of the platform' })}>
            <img src={`${IMG}/global-architecture.webp`} alt="Global architecture: CI/CD pipeline, Kubernetes DOKS cluster, AI remediation loop" loading="lazy" width="1600" height="740" />
            <span className="figure__hint">Click to enlarge</span>
          </button>
          <button className="figure" onClick={() => setShot({ src: `${IMG}/physical-architecture.webp`, caption: 'Physical architecture: DOKS cluster, CI VM and external services' })}>
            <img src={`${IMG}/physical-architecture.webp`} alt="Physical architecture: DOKS namespaces, Ubuntu VM with GitLab Runner, SonarQube and AI agent, external services" loading="lazy" width="1600" height="785" />
            <span className="figure__hint">Click to enlarge</span>
          </button>
        </div>
      </section>

      <PipelineExplorer onOpen={setShot} />

      <section id="kubernetes" className="section reveal">
        <div className="container">
          <p className="eyebrow">3 · Kubernetes & Argo CD</p>
          <h2 className="section__title">GitOps keeps the cluster equal to Git</h2>
          <div className="two-col">
            <div>
              <p>The Kubernetes manifests live in <code>k8s/</code>. An Argo CD <code>Application</code> watches that folder with <code>automated: {'{'} prune: true, selfHeal: true {'}'}</code>. Any drift, such as a manual edit or a deleted pod, is reverted to the state stored in Git.</p>
              <ul className="ticks">
                <li>7 workloads: Angular frontend, API Gateway, Eureka and 4 Spring Boot services</li>
                <li>PostgreSQL, MySQL and MongoDB on persistent volumes</li>
                <li>OPA Gatekeeper rejects Deployments without resource limits or with privileged containers</li>
                <li>Falco and kube-prometheus-stack installed with Helm from the pipeline</li>
              </ul>
            </div>
            <div className="shots">
              {['11-argocd-synced-healthy', '09-kubectl-pods-doks', '12-kubernetes-self-heal'].map((f) => {
                const g = GALLERY.find((x) => x.file === f)
                const caption = g?.caption ?? 'Kubernetes self-heal: the deleted pod is recreated'
                return (
                  <button key={f} className="shot" onClick={() => setShot({ src: `${IMG}/${f}.webp`, caption })}>
                    <img src={`${IMG}/${f}.webp`} alt={caption} loading="lazy" />
                    <span>{caption}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="section reveal">
        <div className="container">
          <p className="eyebrow">4 · Security controls</p>
          <h2 className="section__title">One control per layer</h2>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Layer</th><th>Control</th><th>Tooling</th></tr></thead>
              <tbody>
                <tr><td>Code</td><td>SAST with a quality gate per microservice</td><td>SonarQube</td></tr>
                <tr><td>Dependencies</td><td>SCA, HIGH/CRITICAL CVEs</td><td>Trivy fs, npm audit</td></tr>
                <tr><td>Secrets</td><td>Scan of the full Git history, redacted SARIF</td><td>Gitleaks</td></tr>
                <tr><td>Manifests</td><td>Limits required, runAsNonRoot, no privileged containers</td><td>OPA / Conftest (Rego)</td></tr>
                <tr><td>Admission</td><td>Policies enforced inside the cluster</td><td>OPA Gatekeeper</td></tr>
                <tr><td>Images</td><td>Non-root hardened builds, image scan</td><td>Dockerfile.secure, Trivy</td></tr>
                <tr><td>Supply chain</td><td>SBOM and cryptographic signature</td><td>CycloneDX, Cosign</td></tr>
                <tr><td>Running app</td><td>Dynamic scan of the exposed endpoints</td><td>OWASP ZAP</td></tr>
                <tr><td>Runtime</td><td>Syscall-level threat detection</td><td>Falco (eBPF), Falcosidekick</td></tr>
                <tr><td>Governance</td><td>All findings in one place</td><td>DefectDojo</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <DemoPlayer onOpen={setShot} />

      <section id="gallery" className="section reveal">
        <div className="container">
          <p className="eyebrow">6 · Evidence</p>
          <h2 className="section__title">Screenshots from the project environment</h2>
          <div className="gallery">
            {GALLERY.map((g) => (
              <button key={g.file} className="shot" onClick={() => setShot({ src: `${IMG}/${g.file}.webp`, caption: g.caption })}>
                <img src={`${IMG}/${g.file}.webp`} alt={g.caption} loading="lazy" />
                <span>{g.caption}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container cta">
          <h2>Want the details?</h2>
          <p className="muted">The repository contains the pipeline, the Kubernetes manifests, the Rego policies, the Argo CD application and the AI agent.</p>
          <div className="hero__actions">
            <a className="btn" href={PFE_REPO} target="_blank" rel="noopener noreferrer"><GitHubIcon size={16} /> View on GitHub</a>
            <a className="btn btn--ghost" href={`mailto:${PROFILE.email}?subject=DevSecOps%20platform`}>Ask me about it</a>
          </div>
        </div>
      </section>

      {shot && <Lightbox src={shot.src} caption={shot.caption} onClose={close} />}
    </article>
  )
}

function PipelineExplorer({ onOpen }: { onOpen: (s: Shot) => void }) {
  const [active, setActive] = useState(4)
  const [running, setRunning] = useState(false)
  const stage = STAGES[active - 1]

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => {
      if (active >= STAGES.length) setRunning(false)
      else setActive(active + 1)
    }, 900)
    return () => clearTimeout(t)
  }, [running, active])

  const run = () => {
    setActive(1)
    setRunning(true)
  }

  return (
    <section id="pipeline" className="section reveal">
      <div className="container">
        <p className="eyebrow">2 · CI/CD pipeline</p>
        <h2 className="section__title">13 stages, 32 jobs, security at every step</h2>
        <p className="muted">Click a stage to see what it does and the tools it runs, or replay the pipeline order.</p>
        <div className="pipe__toolbar">
          <button className="btn btn--small" onClick={run} disabled={running}>{running ? 'Running…' : '▶ Replay pipeline'}</button>
          <ul className="legend">
            {Object.entries(GROUP_LABEL).map(([k, v]) => <li key={k}><span className={`sw sw--${k}`} />{v}</li>)}
          </ul>
        </div>
        <ol className="pipe" aria-label="Pipeline stages">
          {STAGES.map((s) => (
            <li key={s.id}>
              <button
                className={`pipe__stage pipe__stage--${s.group} ${s.n === active ? 'is-active' : ''} ${running && s.n < active ? 'is-done' : ''}`}
                onClick={() => { setRunning(false); setActive(s.n) }}
                aria-pressed={s.n === active}
              >
                <span className="pipe__n">{s.n}</span>
                <span className="pipe__label">{s.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="card pipe__detail" aria-live="polite">
          <div>
            <p className="eyebrow">Stage {stage.n} · <code>{stage.id}</code> · {GROUP_LABEL[stage.group]}</p>
            <h3>{stage.label}</h3>
            <p>{stage.what}</p>
            <p className="muted small"><strong>Tools:</strong> {stage.tools}</p>
          </div>
          {stage.evidence && (
            <button className="shot shot--inline" onClick={() => onOpen({ src: `${IMG}/${stage.evidence}.webp`, caption: `${stage.label}: screenshot from the project` })}>
              <img src={`${IMG}/${stage.evidence}.webp`} alt={`${stage.label}: screenshot from the project`} loading="lazy" />
              <span>Real screenshot · click to enlarge</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

function DemoPlayer({ onOpen }: { onOpen: (s: Shot) => void }) {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(false)
  const step = DEMO[i]

  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => {
      if (i >= DEMO.length - 1) setAuto(false)
      else setI(i + 1)
    }, 4500)
    return () => clearTimeout(t)
  }, [auto, i])

  return (
    <section id="demo" className="section reveal">
      <div className="container">
        <p className="eyebrow">5 · Live demo (recorded walkthrough)</p>
        <h2 className="section__title">From an attack to an approved fix in six steps</h2>
        <p className="muted">This is the scenario shown at the PFE defence, replayed step by step with the real screenshots and logs.</p>

        <div className="demo">
          <ol className="demo__steps">
            {DEMO.map((d, n) => (
              <li key={d.title}>
                <button className={`demo__step ${n === i ? 'is-active' : ''} ${n < i ? 'is-done' : ''}`} onClick={() => { setAuto(false); setI(n) }}>
                  <span className="demo__n">{n + 1}</span>
                  <span><strong>{d.actor}</strong><small>{d.title}</small></span>
                </button>
              </li>
            ))}
          </ol>

          <div className="card demo__panel" aria-live="polite">
            <p className="eyebrow">Step {i + 1} / {DEMO.length} · {step.actor}</p>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            {step.log && (
              <pre className="terminal" aria-label="Log excerpt"><code>{step.log.join('\n')}</code></pre>
            )}
            <button className="shot shot--demo" onClick={() => onOpen({ src: step.img, caption: step.title })}>
              <img key={step.img} src={step.img} alt={step.title} className="fade-in" />
              <span>Real screenshot · click to enlarge</span>
            </button>
            <div className="demo__controls">
              <button className="btn btn--ghost btn--small" onClick={() => { setAuto(false); setI(Math.max(0, i - 1)) }} disabled={i === 0}>← Previous</button>
              <button className="btn btn--small" onClick={() => { if (i === DEMO.length - 1) setI(0); setAuto(!auto) }}>{auto ? '❚❚ Pause' : '▶ Autoplay'}</button>
              <button className="btn btn--ghost btn--small" onClick={() => { setAuto(false); setI(Math.min(DEMO.length - 1, i + 1)) }} disabled={i === DEMO.length - 1}>Next →</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
