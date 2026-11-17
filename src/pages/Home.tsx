import { ABOUT, CERTIFICATIONS, EDUCATION, PRIOR_EDUCATION, EXPERIENCE, HIGHLIGHTS, PROFILE, PROJECTS, SKILLS, type Project } from '../data'
import { Section } from '../components/Layout'
import { ArrowIcon, DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon } from '../components/Icons'
import { PipelineTerminal } from '../components/PipelineTerminal'
import { useReveal } from '../useReveal'
import { POSTS, BLOG_PATH } from '../blog/posts'
import { PostCard } from './Blog'
import { RecruiterTeaser } from '../components/recruiter/RecruiterTeaser'

const KIND_LABEL: Record<Project['kind'], string> = {
  flagship: 'Flagship',
  original: 'Own project',
  academic: 'Academic',
  lab: 'Lab · fork',
}

function ProjectCard({ p }: { p: Project }) {
  const repoName = p.repo.replace('https://github.com/', '')
  return (
    <article className={`repo repo--${p.kind}`}>
      <header className="repo__head">
        <span className="repo__path"><GitHubIcon size={15} /> {repoName}</span>
        <span className={`badge badge--${p.kind}`}>{KIND_LABEL[p.kind]}</span>
      </header>
      <h3>{p.name}</h3>
      <p className="repo__proves"><span aria-hidden="true">→</span> {p.proves}</p>
      <p className="repo__summary">{p.summary}</p>
      {p.note && <p className="muted small">{p.note}</p>}
      <ul className="tokens">{p.tech.map((t) => <li key={t}>{t}</li>)}</ul>
      <a className="link repo__link" href={p.repo} target="_blank" rel="noopener noreferrer">View repository <ArrowIcon /></a>
    </article>
  )
}

export default function Home() {
  useReveal()
  const flagship = PROJECTS.find((p) => p.kind === 'flagship')!
  const builds = [...PROJECTS.filter((p) => p.kind === 'original'), ...PROJECTS.filter((p) => p.kind === 'academic')]
  const labs = PROJECTS.filter((p) => p.kind === 'lab')

  return (
    <>
      <section className="hero t-hero" aria-labelledby="hero-title">
        <div className="hero__grid" aria-hidden="true" />
        <div className="container t-hero__inner">
          <div className="t-hero__text">
            <p className="prompt"><span className="prompt__user">iyed@devops</span>:<span className="prompt__path">~</span>$ whoami</p>
            <h1 id="hero-title" className="t-name">{PROFILE.name}</h1>
            <p className="t-role">Junior <strong>DevOps</strong> &amp; <strong>DevSecOps</strong> Engineer</p>
            <p className="t-pitch">{PROFILE.pitch.replace('Junior DevOps / DevSecOps engineer. ', '')}</p>
            <ul className="status" aria-label="Status">
              <li><span className="dot" /> Open to my first full-time role</li>
              <li>Tunisia · open to relocation</li>
              <li>CKA in preparation</li>
            </ul>
            <div className="hero__actions">
              <a className="btn" href="#projects">See my projects <ArrowIcon /></a>
              <a className="btn btn--ghost" href={PROFILE.cv} download><DownloadIcon /> CV (PDF)</a>
              <a className="btn btn--ghost" href="/recruiter">✦ Recruiter mode</a>
            </div>
          </div>
          <PipelineTerminal />
        </div>
        <div className="container">
          <ul className="metrics" aria-label="Measured results from my final-year project">
            {HIGHLIGHTS.map((h) => (
              <li key={h.label}><strong>{h.value}</strong><span>{h.label}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <Section id="projects" cmd="ls ~/projects" title="Projects: what I have actually built">
        <article className="flagship">
          <a className="flagship__media" href={flagship.details} aria-label="Open the project page">
            <img src={flagship.image} alt="Architecture of the DevSecOps platform: CI/CD, Kubernetes DOKS and AI remediation" loading="lazy" width="1600" height="740" />
          </a>
          <div className="flagship__body">
            <div className="repo__head">
              <span className="repo__path"><GitHubIcon size={15} /> final-year project · SFM Technologies · 2026</span>
              <span className="badge badge--flagship">Flagship</span>
            </div>
            <h3>{flagship.name}</h3>
            <p className="repo__proves"><span aria-hidden="true">→</span> {flagship.proves}</p>
            <p className="repo__summary">{flagship.summary}</p>
            <ul className="tokens">{flagship.tech.map((t) => <li key={t}>{t}</li>)}</ul>
            <div className="featured__actions">
              <a className="btn" href={flagship.details}>Case study <ArrowIcon /></a>
              <a className="btn btn--ghost" href={flagship.demo}>Walkthrough demo</a>
              <a className="btn btn--ghost" href={flagship.repo} target="_blank" rel="noopener noreferrer"><GitHubIcon size={16} /> Code</a>
            </div>
          </div>
          {flagship.shots && (
            <ul className="flagship__shots" aria-label="Screenshots from the running platform">
              {flagship.shots.map((s) => (
                <li key={s.src}>
                  <a href={flagship.details}><img src={s.src} alt={s.alt} loading="lazy" /></a>
                  <span>{s.alt}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <div className="repos">
          {builds.map((p) => <ProjectCard key={p.name} p={p} />)}
        </div>

        {labs.length > 0 && (
          <>
            <h3 className="subhead"><span className="prompt__path">#</span> Labs: public repositories I forked to practise on</h3>
            <div className="repos repos--labs">
              {labs.map((p) => <ProjectCard key={p.name} p={p} />)}
            </div>
          </>
        )}
      </Section>

      <Section id="experience" cmd="git log --experience" title="Experience">
        <ol className="gitlog">
          {EXPERIENCE.map((e) => (
            <li key={e.company} className="gitlog__item">
              <div className="gitlog__head">
                <h3>{e.role}</h3>
                <span className="gitlog__date">{e.dates}</span>
              </div>
              <p className="gitlog__company">{e.company} <span className="muted">· {e.place}</span></p>
              <ul>{e.bullets.map((b) => <li key={b.slice(0, 24)}>{b}</li>)}</ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="skills" cmd="cat stack.yaml" title="Stack, with honest levels">
        <div className="tw tw--static">
          <div className="tw__bar" aria-hidden="true"><span /><span /><span /><em>stack.yaml</em></div>
          <div className="yaml">
            {SKILLS.map((s) => (
              <div className="yaml__group" key={s.group}>
                <p className="yaml__key">{s.group.toLowerCase().replace(/ & /g, '_').replace(/[^a-z_]+/g, '_')}:</p>
                <ul>
                  {s.items.map((i) => {
                    const training = i.includes('(training)')
                    return (
                      <li key={i}>
                        <span className="yaml__dash">- </span>{i.replace(' (training)', '')}
                        {training && <span className="yaml__comment">  # training only</span>}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <p className="muted small skills__note">Want proof for a specific skill? <a className="link" href="/recruiter#skills">Recruiter mode</a> maps each one to project, internship or training evidence.</p>
      </Section>

      <Section id="about" cmd="cat about.md" title="Automation, cloud and security, built into delivery">
        <div className="about">
          <div className="about__text">
            {ABOUT.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
          </div>
          <aside className="card about__card">
            <h3>Education</h3>
            <p><strong>{EDUCATION.degree}</strong></p>
            <p className="muted">{EDUCATION.school} · {EDUCATION.dates}</p>
            <p><strong>{PRIOR_EDUCATION.degree}</strong></p>
            <p className="muted">{PRIOR_EDUCATION.school} · {PRIOR_EDUCATION.dates}</p>
            <h3>Certifications</h3>
            <ul className="certs-mini">
              {CERTIFICATIONS.map((c) => (
                <li key={c.name}><span className={c.inProgress ? 'cert-dot cert-dot--progress' : 'cert-dot'} />{c.name} <span className="muted">· {c.date}</span></li>
              ))}
            </ul>
            <h3>Languages</h3>
            <p className="muted">Arabic (native) · French (professional) · English (professional)</p>
          </aside>
        </div>
      </Section>

      <Section id="blog" cmd="ls ~/blog" title="Write-ups from the pipeline">
        <div className="posts">
          {POSTS.slice(0, 3).map((p) => <PostCard key={p.slug} post={p} />)}
        </div>
        <p className="blog-more"><a className="btn btn--ghost" href={BLOG_PATH}>All {POSTS.length} articles <ArrowIcon /></a></p>
      </Section>

      <RecruiterTeaser />

      <Section id="contact" cmd="./contact.sh" title="Hiring a junior DevOps engineer? Let's talk.">
        <div className="contact">
          <p className="contact__lead">
            I am looking for my first <strong>Junior DevOps, DevSecOps, Cloud or Platform Engineer</strong> role, in Tunisia, Europe or abroad. The fastest way to reach me is by email.
          </p>
          <div className="contact__links">
            <a className="card contact__item" href={`mailto:${PROFILE.email}`}><MailIcon /><span><strong>Email</strong>{PROFILE.email}</span></a>
            <a className="card contact__item" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /><span><strong>LinkedIn</strong>in/iyed-boubakri-1a1376327</span></a>
            <a className="card contact__item" href={PROFILE.github} target="_blank" rel="noopener noreferrer"><GitHubIcon /><span><strong>GitHub</strong>github.com/iyedboubakri12</span></a>
            <a className="card contact__item" href={PROFILE.cv} download><DownloadIcon size={20} /><span><strong>CV</strong>Download PDF</span></a>
          </div>
        </div>
      </Section>
    </>
  )
}
