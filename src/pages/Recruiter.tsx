import type { ReactNode } from 'react'
import { HIGHLIGHTS, PFE_PATH, PROFILE } from '../data'
import { T, useLang } from '../ai/i18n'
import { openAssistant, useAiStatus } from '../ai/client'
import { useReveal } from '../useReveal'
import { ArchitectureMap } from '../components/recruiter/ArchitectureMap'
import { SkillEvidence } from '../components/recruiter/SkillEvidence'
import { ProjectExplorer } from '../components/recruiter/ProjectExplorer'
import { JobAnalyzer } from '../components/recruiter/JobAnalyzer'
import { InterviewMode } from '../components/recruiter/InterviewMode'
import { CandidateSummary } from '../components/recruiter/CandidateSummary'
import { DownloadIcon, GitHubIcon, LinkedInIcon, MailIcon } from '../components/Icons'

function Block({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="section rsection reveal">
      <div className="container">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section__title">{title}</h2>
        {children}
      </div>
    </section>
  )
}

const COPY = {
  en: {
    eyebrow: 'Recruiter mode',
    title: 'Evaluate Iyed in five minutes, with evidence.',
    lead: 'Everything on this page is backed by a project, a screenshot, an article or the repository, and every skill shows how deep the evidence goes. Ask the assistant anything, or paste your job description to check the fit.',
    snapshot: [
      ['Target roles', 'Junior DevOps · DevSecOps · Cloud / Platform · Cloud Security'],
      ['Status', 'Software Engineering graduate (ESPRIT, 2026) · looking for a first full-time role'],
      ['Location', 'Tunisia · open to relocation in Europe and internationally'],
      ['Languages', 'Arabic (native) · French · English'],
    ],
    ask: 'Ask Iyed AI',
    sections: {
      summary: ['Candidate summary', 'A copy-ready profile for your ATS or hiring manager'],
      skills: ['Skill evidence', 'Every skill, how deep it goes, and where to check it'],
      projects: ['Project explorer', 'Problem, architecture, contribution, results and lessons'],
      architecture: ['Interactive architecture', 'Click a component of the DevSecOps platform'],
      job: ['Job match', 'Paste a job description and get an honest fit assessment'],
      interview: ['Technical interview', 'Questions with what to listen for, linked to his real work'],
      contact: ['Contact', 'Next step'],
    },
    contactLead: 'If the profile fits, the fastest way to reach Iyed is by email. He replies in English or French.',
    offline: 'The live AI model is not enabled on this deployment: the assistant answers from the knowledge base, and the job analyzer shows the evidence-based scorecard only.',
  },
  fr: {
    eyebrow: 'Mode recruteur',
    title: 'Évaluez Iyed en cinq minutes, preuves à l’appui.',
    lead: 'Tout ce qui figure sur cette page s’appuie sur un projet, une capture, un article ou le dépôt, et chaque compétence indique le niveau de preuve. Posez vos questions à l’assistant ou collez votre offre pour vérifier l’adéquation.',
    snapshot: [
      ['Postes visés', 'DevOps junior · DevSecOps · Cloud / Platform · Sécurité cloud'],
      ['Statut', 'Ingénieur en génie logiciel (ESPRIT, 2026) · à la recherche d’un premier poste à temps plein'],
      ['Localisation', 'Tunisie · ouvert à une relocalisation en Europe et à l’international'],
      ['Langues', 'Arabe (natif) · français · anglais'],
    ],
    ask: 'Demander à Iyed AI',
    sections: {
      summary: ['Synthèse candidat', 'Un profil prêt à copier pour votre ATS ou le manager'],
      skills: ['Preuves par compétence', 'Chaque compétence, son niveau de preuve et où le vérifier'],
      projects: ['Explorateur de projets', 'Problème, architecture, contribution, résultats et enseignements'],
      architecture: ['Architecture interactive', 'Cliquez sur un composant de la plateforme DevSecOps'],
      job: ['Adéquation au poste', 'Collez une offre et obtenez une évaluation honnête'],
      interview: ['Entretien technique', 'Des questions avec les points attendus, reliées à son travail réel'],
      contact: ['Contact', 'Prochaine étape'],
    },
    contactLead: 'Si le profil correspond, le plus rapide est d’écrire à Iyed. Il répond en français ou en anglais.',
    offline: 'Le modèle IA n’est pas activé sur ce déploiement : l’assistant répond à partir de la base de connaissances et l’analyseur d’offre affiche uniquement le bilan fondé sur les preuves.',
  },
}

export default function Recruiter() {
  useReveal()
  const [lang] = useLang()
  const c = COPY[lang]
  const s = T[lang]
  const ai = useAiStatus()

  const quick: { label: string; href?: string; onClick?: () => void; download?: boolean; icon: string }[] = [
    { label: s.quick.skills, href: '#skills', icon: '◆' },
    { label: s.quick.projects, href: '#projects', icon: '▣' },
    { label: s.quick.architecture, href: '#architecture', icon: '⬡' },
    { label: s.quick.job, href: '#job', icon: '⌕' },
    { label: s.quick.interview, href: '#interview', icon: '?' },
    { label: s.quick.summary, href: '#summary', icon: '≡' },
    { label: s.quick.cv, href: PROFILE.cv, download: true, icon: '↓' },
    { label: s.quick.contact, href: `mailto:${PROFILE.email}`, icon: '✉' },
  ]

  return (
    <div className="recruiter">
      <header className="rhero">
        <div className="hero__grid" aria-hidden="true" />
        <div className="container">
          <p className="hero__badge"><span className="dot" /> {c.eyebrow}</p>
          <h1>{c.title}</h1>
          <p className="pfe__lead">{c.lead}</p>
          <div className="hero__actions">
            <button className="btn" onClick={() => openAssistant({ tab: 'chat' })}>✦ {c.ask}</button>
            <a className="btn btn--ghost" href={PROFILE.cv} download><DownloadIcon /> {s.quick.cv}</a>
            <a className="btn btn--ghost" href={PFE_PATH}>{lang === 'fr' ? 'Projet DevSecOps' : 'DevSecOps project'}</a>
          </div>
          {ai === false && <p className="notice" role="note">{c.offline}</p>}

          <dl className="snapshot">
            {c.snapshot.map(([k, v]) => (
              <div key={k} className="card"><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>

          <ul className="hero__stats hero__stats--wide" aria-label="Reported project results">
            {HIGHLIGHTS.map((h) => <li key={h.label}><strong>{h.value}</strong><span>{h.label}</span></li>)}
          </ul>

          <nav className="quickgrid" aria-label="Quick actions">
            {quick.map((q) => (
              <a key={q.label} className="quickgrid__item" href={q.href} {...(q.download ? { download: true } : {})}>
                <span aria-hidden="true">{q.icon}</span>
                {q.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <Block id="summary" eyebrow={c.sections.summary[0]} title={c.sections.summary[1]}><CandidateSummary /></Block>
      <Block id="skills" eyebrow={c.sections.skills[0]} title={c.sections.skills[1]}><SkillEvidence /></Block>
      <Block id="projects" eyebrow={c.sections.projects[0]} title={c.sections.projects[1]}><ProjectExplorer /></Block>
      <Block id="architecture" eyebrow={c.sections.architecture[0]} title={c.sections.architecture[1]}><ArchitectureMap /></Block>
      <Block id="job" eyebrow={c.sections.job[0]} title={c.sections.job[1]}><JobAnalyzer /></Block>
      <Block id="interview" eyebrow={c.sections.interview[0]} title={c.sections.interview[1]}><InterviewMode /></Block>

      <Block id="contact" eyebrow={c.sections.contact[0]} title={c.sections.contact[1]}>
        <p className="contact__lead">{c.contactLead}</p>
        <div className="contact__links">
          <a className="card contact__item" href={`mailto:${PROFILE.email}`}><MailIcon /><span><strong>Email</strong>{PROFILE.email}</span></a>
          <a className="card contact__item" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer"><LinkedInIcon /><span><strong>LinkedIn</strong>Iyed Boubakri</span></a>
          <a className="card contact__item" href={PROFILE.github} target="_blank" rel="noopener noreferrer"><GitHubIcon /><span><strong>GitHub</strong>iyedboubakri12</span></a>
          <a className="card contact__item" href={PROFILE.cv} download><DownloadIcon size={20} /><span><strong>CV</strong>PDF</span></a>
        </div>
      </Block>
    </div>
  )
}
