// Deterministic job-description matcher. It only recognises skills listed in
// SKILL_EVIDENCE (including the ones Iyed does NOT have), so a requirement is
// never reported as matched without evidence. The LLM receives this result as
// ground truth and only writes the narrative around it.
import { SKILL_EVIDENCE, type EvidenceLevel, type SkillEvidence } from './knowledge.js'

export type MatchItem = { skill: SkillEvidence; level: EvidenceLevel; hits: string[] }

export type JobMatch = {
  matched: MatchItem[] // project or internship evidence
  partial: MatchItem[] // training only
  missing: MatchItem[] // listed in the JD, not documented
  coverage: number // 0..100, only over recognised requirements
  recognised: number
  yearsRequired: number | null
  seniority: 'junior' | 'mid' | 'senior' | null
  wordCount: number
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function aliasRegex(alias: string) {
  // Word-ish boundaries that also work for "ci/cd", ".net", "c#", "k8s".
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escape(alias)}(?=$|[^\\p{L}\\p{N}])`, 'iu')
}

const COMPILED = SKILL_EVIDENCE.map((s) => ({ skill: s, regs: s.aliases.map((a) => [a, aliasRegex(a)] as const) }))

export function analyzeJob(text: string): JobMatch {
  const jd = text.normalize('NFKC')
  const matched: MatchItem[] = []
  const partial: MatchItem[] = []
  const missing: MatchItem[] = []

  for (const { skill, regs } of COMPILED) {
    const hits = regs.filter(([, r]) => r.test(jd)).map(([a]) => a)
    if (!hits.length) continue
    const item = { skill, level: skill.level, hits }
    if (skill.level === 'project' || skill.level === 'internship') matched.push(item)
    else if (skill.level === 'training') partial.push(item)
    else missing.push(item)
  }

  const recognised = matched.length + partial.length + missing.length
  const coverage = recognised ? Math.round(((matched.length + 0.4 * partial.length) / recognised) * 100) : 0

  const years = Array.from(jd.matchAll(/(\d{1,2})\s*\+?\s*(?:-\s*\d{1,2}\s*)?(?:years?|yrs?|ans|années)/gi)).map((m) => Number(m[1])).filter((n) => n > 0 && n < 30)
  const yearsRequired = years.length ? Math.max(...years) : null

  let seniority: JobMatch['seniority'] = null
  if (/\b(senior|lead|staff|principal|confirmé|expert)\b/i.test(jd)) seniority = 'senior'
  else if (/\b(mid[- ]level|intermediate|intermédiaire)\b/i.test(jd)) seniority = 'mid'
  else if (/\b(junior|graduate|entry[- ]level|débutant|jeune diplômé|stage|intern(ship)?)\b/i.test(jd)) seniority = 'junior'

  return { matched, partial, missing, coverage, recognised, yearsRequired, seniority, wordCount: jd.split(/\s+/).filter(Boolean).length }
}

/** Plain-text version given to the model as ground truth. */
export function matchToText(m: JobMatch): string {
  const line = (i: MatchItem) => `- ${i.skill.label} [${i.level}] (found in JD as: ${i.hits.join(', ')}): ${i.skill.detail}`
  return `Deterministic skill match computed from the verified knowledge base (treat as ground truth):
Coverage of recognised requirements: ${m.coverage}% (${m.recognised} recognised)
Years of experience required by the JD: ${m.yearsRequired ?? 'not stated'}
Seniority signalled by the JD: ${m.seniority ?? 'not stated'}
MATCHED (hands-on evidence):
${m.matched.map(line).join('\n') || '- none'}
PARTIAL (training only, no project evidence):
${m.partial.map(line).join('\n') || '- none'}
MISSING (requested but not documented):
${m.missing.map(line).join('\n') || '- none'}
Requirements not in the skill dictionary must be judged from the knowledge base only; if absent, mark them "not documented".`
}
