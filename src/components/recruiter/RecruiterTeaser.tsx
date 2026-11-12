import { openAssistant } from '../../ai/client'
import { RECRUITER_PATH } from '../../ai/knowledge'
import { ArrowIcon } from '../Icons'

const CARDS = [
  { title: 'Ask Iyed AI', text: 'Questions about skills, projects or experience, answered only from verified portfolio content, with sources.', action: () => openAssistant({ tab: 'chat' }), cta: 'Open the assistant' },
  { title: 'Analyze a job description', text: 'Paste your job ad: matching evidence, training-only skills, gaps, and an honest fit assessment.', action: () => openAssistant({ tab: 'job' }), cta: 'Check the fit' },
  { title: 'Technical interview', text: 'Questions per topic with what a strong answer covers, linked to the real project work.', action: () => openAssistant({ tab: 'interview' }), cta: 'Start' },
]

export function RecruiterTeaser() {
  return (
    <section id="recruiters" className="section reveal">
      <div className="container">
        <p className="eyebrow">For recruiters</p>
        <h2 className="section__title">Don't just read the CV: question it</h2>
        <div className="teaser">
          {CARDS.map((c) => (
            <article key={c.title} className="card teaser__card">
              <span className="teaser__spark" aria-hidden="true">✦</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              <button className="link" onClick={c.action}>{c.cta} <ArrowIcon /></button>
            </article>
          ))}
          <a className="card teaser__card teaser__card--accent" href={RECRUITER_PATH}>
            <span className="teaser__spark" aria-hidden="true">◆</span>
            <h3>Recruiter mode</h3>
            <p>Skill evidence levels, project explorer, interactive architecture and a copy-ready candidate summary on one page.</p>
            <span className="link">Open recruiter mode <ArrowIcon /></span>
          </a>
        </div>
      </div>
    </section>
  )
}
