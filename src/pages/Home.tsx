import { ABOUT, CERTIFICATIONS, EDUCATION, EXPERIENCE, HIGHLIGHTS, PROFILE, PROJECTS, SKILLS } from '../data'
import { Section } from '../components/Layout'
import { ArrowIcon, DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon } from '../components/Icons'
import { useReveal } from '../useReveal'
import { POSTS, BLOG_PATH } from '../blog/posts'
import { PostCard } from './Blog'

export default function Home() {
  useReveal()
  const [featured, ...others] = PROJECTS

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__grid" aria-hidden="true" />
        <div className="container hero__inner">
          <p className="hero__badge"><span className="dot" /> Open to Junior DevOps / DevSecOps / Cloud roles</p>
          <h1 id="hero-title" className="hero__name">{PROFILE.name}</h1>
          <p className="hero__title">{PROFILE.title}</p>
          <p className="hero__school">{PROFILE.school}</p>
          <p className="hero__pitch">{PROFILE.pitch}</p>
          <div className="hero__actions">
            <a className="btn" href="#projects">View Projects <ArrowIcon /></a>
            <a className="btn btn--ghost" href={PROFILE.cv} download><DownloadIcon /> Download CV</a>
            <a className="btn btn--ghost" href="#contact">Contact Me</a>
          </div>
          <ul className="hero__stats" aria-label="Key results">
            {HIGHLIGHTS.map((h) => (
              <li key={h.label}><strong>{h.value}</strong><span>{h.label}</span></li>
            ))}
          </ul>
        </div>
      </section>

      <Section id="about" eyebrow="About me" title="Automation, cloud and security, built into delivery">
        <div className="about">
          <div className="about__text">
            {ABOUT.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
          </div>
          <aside className="card about__card">
            <h3>Education</h3>
            <p><strong>{EDUCATION.degree}</strong></p>
            <p className="muted">{EDUCATION.school} · {EDUCATION.dates}</p>
            <h3>Languages</h3>
            <p className="muted">Arabic (native) · French (professional) · English (professional)</p>
            <h3>Location</h3>
            <p className="muted">{PROFILE.location}</p>
          </aside>
        </div>
      </Section>

      <Section id="skills" eyebrow="Technical skills" title="Tooling I use across the delivery chain">
        <div className="skills">
          {SKILLS.map((s) => (
            <div className="card skill" key={s.group}>
              <h3>{s.group}</h3>
              <ul className="chips">
                {s.items.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="projects" eyebrow="Featured projects" title="What I have built">
        <article className="card featured">
          <a className="featured__media" href={featured.details} aria-label="Open the project page">
            <img src={featured.image} alt="Architecture of the DevSecOps platform: CI/CD, Kubernetes DOKS and AI remediation" loading="lazy" width="1600" height="740" />
          </a>
          <div className="featured__body">
            <p className="eyebrow">Final-year project · SFM Technologies · 2026</p>
            <h3>{featured.name}</h3>
            <p>{featured.summary}</p>
            <ul className="chips chips--small">{featured.tech.map((t) => <li key={t}>{t}</li>)}</ul>
            <div className="featured__actions">
              <a className="btn" href={featured.details}>Project Details <ArrowIcon /></a>
              <a className="btn btn--ghost" href={featured.demo}>Live Demo (walkthrough)</a>
              <a className="btn btn--ghost" href={featured.repo} target="_blank" rel="noopener noreferrer"><GitHubIcon size={16} /> GitHub Repository</a>
            </div>
          </div>
        </article>
        <div className="projects">
          {others.map((p) => (
            <article className="card project" key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.summary}</p>
              {p.note && <p className="muted small">{p.note}</p>}
              <ul className="chips chips--small">{p.tech.map((t) => <li key={t}>{t}</li>)}</ul>
              <a className="link" href={p.repo} target="_blank" rel="noopener noreferrer"><GitHubIcon size={16} /> Repository</a>
            </article>
          ))}
        </div>
      </Section>

      <Section id="experience" eyebrow="Experience" title="Where I have worked">
        <ol className="timeline">
          {EXPERIENCE.map((e) => (
            <li key={e.company} className="timeline__item">
              <div className="timeline__head">
                <h3>{e.role}</h3>
                <span className="muted">{e.dates}</span>
              </div>
              <p className="timeline__company">{e.company} · <span className="muted">{e.place}</span></p>
              <ul>{e.bullets.map((b) => <li key={b.slice(0, 24)}>{b}</li>)}</ul>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="certifications" eyebrow="Certifications" title="Certifications and training">
        <ul className="certs">
          {CERTIFICATIONS.map((c) => (
            <li key={c.name} className={`card cert ${c.inProgress ? 'cert--progress' : ''}`}>
              <strong>{c.name}</strong>
              <span className="muted">{c.issuer}</span>
              <span className={c.inProgress ? 'tag tag--accent' : 'tag'}>{c.date}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="blog" eyebrow="Blog" title="Latest articles on DevOps and DevSecOps">
        <div className="posts">
          {POSTS.slice(0, 3).map((p) => <PostCard key={p.slug} post={p} />)}
        </div>
        <p className="blog-more"><a className="btn btn--ghost" href={BLOG_PATH}>All {POSTS.length} articles <ArrowIcon /></a></p>
      </Section>

      <Section id="contact" eyebrow="Contact" title="Let's talk">
        <div className="contact">
          <p className="contact__lead">
            I am looking for a <strong>Junior DevOps, DevSecOps, Cloud or Cloud Security Engineer</strong> position in Europe or abroad, and I am open to relocation. The fastest way to reach me is by email.
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
