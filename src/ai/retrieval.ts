// Small BM25 retriever over the knowledge chunks and blog sections.
// No embeddings and no external service: the corpus is a few hundred short
// chunks, so lexical search with a handful of synonyms is fast and predictable.
import type { Chunk } from './knowledge.js'

const STOP = new Set(
  ('a an and are as at be by can do does for from has have he his how i in is it its of on or that the this to was what when where which who why with you your ' +
    'about any did tell me us we our they them there their would could should will him iyed iyed’s boubakri experience experiences worked work works working use used using knowledge hands-on' +
    ' le la les un une des du de et en est il elle son sa ses pour par sur dans que qui quoi expérience travaillé utilisé connaissances quel quelle quels quelles avec au aux ce cette ces pas plus ou se sont a été être fait faire peut-il peut est-ce').split(/\s+/),
)

const SYNONYMS: Record<string, string> = {
  k8s: 'kubernetes', kube: 'kubernetes', kubectl: 'kubernetes', doks: 'kubernetes', aks: 'azure', eks: 'aws',
  argo: 'argocd', gitops: 'argocd', ci: 'pipeline', cd: 'pipeline', cicd: 'pipeline', gitlab: 'pipeline', pipelines: 'pipeline',
  sast: 'sonarqube', sonar: 'sonarqube', sca: 'trivy', cve: 'trivy', cves: 'trivy', vulnerabilities: 'trivy', secrets: 'gitleaks', secret: 'gitleaks',
  dast: 'zap', rego: 'opa', conftest: 'opa', gatekeeper: 'opa', policy: 'opa', policies: 'opa', sbom: 'cosign', signing: 'cosign', signature: 'cosign',
  falcosidekick: 'falco', runtime: 'falco', ebpf: 'falco', llm: 'ai', rag: 'ai', groq: 'ai', llama: 'ai', ia: 'ai', agent: 'ai', bot: 'ai', remediation: 'ai', remédiation: 'ai',
  monitoring: 'prometheus', observability: 'prometheus', supervision: 'prometheus', dashboards: 'grafana', iac: 'terraform', infrastructure: 'terraform',
  conteneur: 'docker', conteneurs: 'docker', container: 'docker', containers: 'docker', image: 'docker', images: 'docker',
  stage: 'internship', stagiaire: 'internship', internships: 'internship', intern: 'internship',
  formation: 'education', diplôme: 'education', degree: 'education', university: 'education', université: 'education', école: 'education',
  sécurité: 'security', securite: 'security', secure: 'security', securing: 'security', projet: 'project', projects: 'project', projets: 'project',
  compétences: 'skills', competences: 'skills', skill: 'skills', certification: 'certifications', certifié: 'certifications', cka: 'certifications',
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[^\p{L}\p{N}\s.+#/-]/gu, ' ')
    .split(/[\s/]+/)
    .map((t) => t.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => SYNONYMS[t] ?? t)
}

type Indexed = { chunk: Chunk; tf: Map<string, number>; len: number }

export class Retriever {
  private docs: Indexed[]
  private df = new Map<string, number>()
  private avgLen: number

  constructor(chunks: Chunk[]) {
    this.docs = chunks.map((chunk) => {
      const tokens = tokenize(`${chunk.title} ${chunk.title} ${chunk.keywords ?? ''} ${chunk.text}`)
      const tf = new Map<string, number>()
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
      for (const t of tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1)
      return { chunk, tf, len: tokens.length }
    })
    this.avgLen = this.docs.reduce((s, d) => s + d.len, 0) / Math.max(1, this.docs.length)
  }

  search(query: string, k = 6): { chunk: Chunk; score: number }[] {
    const q = Array.from(new Set(tokenize(query)))
    if (!q.length) return []
    const N = this.docs.length
    const k1 = 1.4
    const b = 0.75
    return this.docs
      .map((d) => {
        let score = 0
        for (const t of q) {
          const f = d.tf.get(t)
          if (!f) continue
          const df = this.df.get(t) ?? 0
          const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5))
          score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / this.avgLen)))
        }
        return { chunk: d.chunk, score }
      })
      .filter((r) => r.score > 0)
      .sort((a, b2) => b2.score - a.score)
      .slice(0, k)
  }
}

/** Splits a Markdown article into one chunk per `##` section. */
export function markdownChunks(slug: string, raw: string): Chunk[] {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) return []
  const title = m[1].match(/^title:\s*"?(.*?)"?\s*$/m)?.[1] ?? slug
  if (/^draft:\s*true/m.test(m[1])) return []
  const sections = m[2].split(/\n(?=## )/)
  return sections
    .map((s, i) => {
      const heading = s.match(/^## (.*)/)?.[1]
      const text = s
        .replace(/^## .*\n/, '')
        .replace(/```[\s\S]*?```/g, (code) => code.slice(0, 600))
        .replace(/\s+/g, ' ')
        .trim()
      return { id: `blog:${slug}:${i}`, title: `Article "${title}"${heading ? ` — ${heading}` : ''}`, text: text.slice(0, 1800), href: `/blog/${slug}` }
    })
    .filter((c) => c.text.length > 40)
}
