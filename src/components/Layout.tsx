import { useEffect, useState, type ReactNode } from 'react'
import { PROFILE } from '../data'
import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons'

const LINKS = [
  ['About', '/#about'],
  ['Skills', '/#skills'],
  ['Projects', '/#projects'],
  ['Experience', '/#experience'],
  ['Certifications', '/#certifications'],
  ['Blog', '/blog'],
  ['Contact', '/#contact'],
]

export function Nav({ onSubPage }: { onSubPage: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <a href="/" className="nav__brand" aria-label="Iyed Boubakri, home">
          <span className="nav__logo" aria-hidden="true">IB</span>
          <span>Iyed Boubakri</span>
        </a>
        <button
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="nav-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen(!open)}
        >
          <span /><span /><span />
        </button>
        <nav id="nav-menu" className={`nav__menu ${open ? 'is-open' : ''}`} aria-label="Main">
          {onSubPage && <a href="/" onClick={() => setOpen(false)}>← Home</a>}
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a className="btn btn--small" href={PROFILE.cv} download onClick={() => setOpen(false)}>Download CV</a>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <strong>Iyed Boubakri</strong>
          <p className="muted">Junior DevOps · DevSecOps · Cloud Engineer</p>
        </div>
        <div className="footer__links">
          <a href={PROFILE.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><GitHubIcon /></a>
          <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><LinkedInIcon /></a>
          <a href={`mailto:${PROFILE.email}`} aria-label="Email"><MailIcon /></a>
        </div>
        <p className="muted footer__copy">© {new Date().getFullYear()} Iyed Boubakri. Built with React, TypeScript and Vite.</p>
      </div>
    </footer>
  )
}

export function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="section reveal">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section__title">{title}</h2>
        {children}
      </div>
    </section>
  )
}

export function Lightbox({ src, caption, onClose }: { src: string; caption: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label={caption} onClick={onClose}>
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={src} alt={caption} />
        <figcaption>{caption}</figcaption>
      </figure>
      <button className="lightbox__close" onClick={onClose} aria-label="Close">×</button>
    </div>
  )
}
