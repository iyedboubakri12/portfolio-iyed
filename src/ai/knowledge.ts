// Verified knowledge base for "Iyed AI".
//
// Everything the assistant is allowed to state about Iyed comes from this file
// (plus the blog articles in /content/blog, which are retrieved per question).
// It is built from the same data the portfolio renders (src/data.ts, src/pfe.ts)
// and from Iyed's own LinkedIn export. If a fact is not here, the assistant must
// say it is not documented. Do not add anything that Iyed cannot back up.
//
// This module is imported by the browser bundle AND by the serverless function
// in /api, so it must stay free of browser-only APIs. Relative imports use the
// `.js` extension so they also resolve in Node ESM on Vercel.
import { CERTIFICATIONS, EDUCATION, EXPERIENCE, HIGHLIGHTS, PFE_PATH, PFE_REPO, PROFILE, PROJECTS, IMG } from '../data.js'
import { DEMO, STAGES } from '../pfe.js'

export const SITE_URL = 'https://portfolio-iyed-iota.vercel.app'
export const RECRUITER_PATH = '/recruiter'

/* ------------------------------------------------------------------ */
/* Evidence levels                                                     */
/* ------------------------------------------------------------------ */

/**
 * project    – used hands-on in a documented project (screenshots, repo or article)
 * internship – used during an internship (described, no public artefact)
 * training   – courses, labs or certification preparation only
 * none       – not documented anywhere in the portfolio
 */
export type EvidenceLevel = 'project' | 'internship' | 'training' | 'none'

export const LEVEL_LABEL: Record<EvidenceLevel, { en: string; fr: string }> = {
  project: { en: 'Hands-on · project', fr: 'Pratique · projet' },
  internship: { en: 'Hands-on · internship', fr: 'Pratique · stage' },
  training: { en: 'Training / lab only', fr: 'Formation / lab uniquement' },
  none: { en: 'Not documented', fr: 'Non documenté' },
}

export type Evidence = { label: string; href: string }

export type SkillEvidence = {
  id: string
  label: string
  category: 'CI/CD & GitOps' | 'Containers & Kubernetes' | 'Security' | 'Cloud & IaC' | 'Observability' | 'Programming & AI' | 'Web & Backend'
  level: EvidenceLevel
  /** What Iyed actually did with it, in one sentence. */
  detail: string
  evidence: Evidence[]
  /** Lower-case aliases used by the job-description matcher. */
  aliases: string[]
}

const PFE = PFE_PATH
const blog = (slug: string) => `/blog/${slug}`
const BLOG = {
  pipeline: blog('devsecops-pipeline-gitlab-ci-13-stages'),
  falco: blog('falco-ai-remediation-human-in-the-loop'),
  speed: blog('faster-gitlab-ci-caching-parallel-jobs'),
  opa: blog('policy-as-code-opa-conftest-gatekeeper'),
  gates: blog('report-only-to-blocking-security-gates'),
  supply: blog('supply-chain-security-cosign-sbom'),
}

export const SKILL_EVIDENCE: SkillEvidence[] = [
  // CI/CD & GitOps
  { id: 'gitlab-ci', label: 'GitLab CI/CD', category: 'CI/CD & GitOps', level: 'project', detail: 'Designed a 13-stage, 32-job GitLab pipeline on a self-hosted runner and cut its runtime by 40% with caching, parallel matrices and the needs DAG.', evidence: [{ label: 'Pipeline explorer', href: `${PFE}#pipeline` }, { label: 'Article: 13-stage pipeline', href: BLOG.pipeline }, { label: 'Article: −40% CI time', href: BLOG.speed }, { label: 'Repository', href: PFE_REPO }], aliases: ['gitlab ci', 'gitlab-ci', 'gitlab', 'ci/cd', 'ci cd', 'cicd', 'continuous integration', 'continuous delivery', 'continuous deployment', 'pipeline', 'pipelines', 'intégration continue', 'déploiement continu'] },
  { id: 'argocd', label: 'Argo CD / GitOps', category: 'CI/CD & GitOps', level: 'project', detail: 'Delivered the microservices to DOKS with Argo CD auto-sync and self-heal: the cluster is reconciled from the k8s/ manifests in Git.', evidence: [{ label: 'GitOps section', href: `${PFE}#kubernetes` }, { label: 'Screenshot: Synced & Healthy', href: `${IMG}/11-argocd-synced-healthy.webp` }], aliases: ['argo cd', 'argocd', 'argo', 'gitops', 'flux'] },
  { id: 'jenkins', label: 'Jenkins', category: 'CI/CD & GitOps', level: 'internship', detail: 'Automated build and deployment workflows with Jenkins during the STB Bank internship (2025).', evidence: [{ label: 'Experience: STB Bank', href: '/#experience' }], aliases: ['jenkins'] },
  { id: 'git', label: 'Git', category: 'CI/CD & GitOps', level: 'project', detail: 'Daily use; Git is the source of truth for the GitOps delivery and the Gitleaks scan covers the full history (420 commits).', evidence: [{ label: 'Repository', href: PFE_REPO }], aliases: ['git', 'version control', 'github', 'bitbucket'] },
  { id: 'github-actions', label: 'GitHub Actions', category: 'CI/CD & GitOps', level: 'none', detail: 'Not documented. His CI/CD experience is with GitLab CI and Jenkins.', evidence: [], aliases: ['github actions', 'gh actions'] },

  // Containers & Kubernetes
  { id: 'kubernetes', label: 'Kubernetes', category: 'Containers & Kubernetes', level: 'project', detail: 'Ran 7 microservice images on a 3-node DigitalOcean Kubernetes (DOKS) cluster with namespaces, RBAC, resource limits, Gatekeeper admission policies, Falco and kube-prometheus-stack. Preparing the CKA (not yet certified).', evidence: [{ label: 'Kubernetes & GitOps', href: `${PFE}#kubernetes` }, { label: 'Screenshot: pods on DOKS', href: `${IMG}/09-kubectl-pods-doks.webp` }, { label: 'Screenshot: self-healing', href: `${IMG}/12-kubernetes-self-heal.webp` }], aliases: ['kubernetes', 'k8s', 'kubectl', 'aks', 'eks', 'gke', 'doks', 'container orchestration', 'orchestration'] },
  { id: 'docker', label: 'Docker', category: 'Containers & Kubernetes', level: 'project', detail: 'Built 7 hardened images (non-root UID 1001) in CI and pushed them to the GitLab Container Registry.', evidence: [{ label: 'Pipeline stage 6', href: `${PFE}#pipeline` }], aliases: ['docker', 'containers', 'containerization', 'containerisation', 'dockerfile', 'container', 'conteneurs', 'podman'] },
  { id: 'helm', label: 'Helm', category: 'Containers & Kubernetes', level: 'project', detail: 'Installed and upgraded Falco and kube-prometheus-stack with Helm from the deploy stage.', evidence: [{ label: 'Pipeline stage 10', href: `${PFE}#pipeline` }], aliases: ['helm', 'helm charts'] },
  { id: 'openshift', label: 'OpenShift', category: 'Containers & Kubernetes', level: 'none', detail: 'Not documented.', evidence: [], aliases: ['openshift'] },
  { id: 'service-mesh', label: 'Service mesh (Istio/Linkerd)', category: 'Containers & Kubernetes', level: 'none', detail: 'Not documented.', evidence: [], aliases: ['istio', 'linkerd', 'service mesh'] },

  // Security
  { id: 'devsecops', label: 'DevSecOps', category: 'Security', level: 'project', detail: 'Built security into every layer of delivery: code, dependencies, secrets, manifests, admission, images, supply chain, running app, runtime and governance.', evidence: [{ label: 'One control per layer', href: `${PFE}#security` }, { label: 'Article: report-only vs blocking gates', href: BLOG.gates }], aliases: ['devsecops', 'shift left', 'shift-left', 'security automation', 'secure sdlc', 'application security', 'appsec', 'ci/cd security', 'pipeline security'] },
  { id: 'sast', label: 'SonarQube (SAST)', category: 'Security', level: 'project', detail: 'Static analysis with a quality gate per microservice, run as a parallel matrix.', evidence: [{ label: 'Screenshot: SonarQube', href: `${IMG}/04-sonarqube-sast.webp` }], aliases: ['sonarqube', 'sonar', 'sast', 'static analysis', 'code quality'] },
  { id: 'trivy', label: 'Trivy (SCA & image scan)', category: 'Security', level: 'project', detail: 'Dependency (fs) and image scanning for HIGH/CRITICAL CVEs, plus CycloneDX SBOM generation.', evidence: [{ label: 'Screenshot: Trivy', href: `${IMG}/05-trivy-sca-report.webp` }, { label: 'Article: supply chain', href: BLOG.supply }], aliases: ['trivy', 'sca', 'dependency scanning', 'vulnerability scanning', 'image scanning', 'container scanning', 'snyk', 'grype'] },
  { id: 'gitleaks', label: 'Gitleaks (secret detection)', category: 'Security', level: 'project', detail: 'Scanned the full Git history (420 commits) and exported a redacted SARIF report.', evidence: [{ label: 'Screenshot: Gitleaks', href: `${IMG}/06-gitleaks-secret-detection.webp` }], aliases: ['gitleaks', 'secret detection', 'secrets scanning', 'secret scanning'] },
  { id: 'zap', label: 'OWASP ZAP (DAST)', category: 'Security', level: 'project', detail: 'Baseline DAST scan of the API gateway and frontend after deployment.', evidence: [{ label: 'Screenshot: ZAP report', href: `${IMG}/20-owasp-zap-dast.webp` }], aliases: ['owasp zap', 'zap', 'dast', 'dynamic analysis', 'owasp', 'penetration testing'] },
  { id: 'opa', label: 'OPA / Conftest / Gatekeeper', category: 'Security', level: 'project', detail: 'Rego policies checked in CI with Conftest and enforced at admission with Gatekeeper; manifest compliance went from 38% to 100%. His own review found gaps in the Gatekeeper setup, documented in the article.', evidence: [{ label: 'Article: Policy-as-Code', href: BLOG.opa }, { label: 'Screenshot: Conftest', href: `${IMG}/07-opa-conftest-results.webp` }], aliases: ['opa', 'open policy agent', 'conftest', 'gatekeeper', 'rego', 'policy as code', 'policy-as-code', 'kyverno', 'admission controller'] },
  { id: 'cosign', label: 'Cosign & CycloneDX SBOM', category: 'Security', level: 'project', detail: 'Signed every image with Cosign and generated CycloneDX SBOMs. He documents that signing is not yet conditional on a clean scan.', evidence: [{ label: 'Article: Cosign & SBOM', href: BLOG.supply }, { label: 'Screenshot: signature verified', href: `${IMG}/08-cosign-signature-verify.webp` }], aliases: ['cosign', 'sigstore', 'sbom', 'cyclonedx', 'supply chain', 'software supply chain', 'image signing', 'slsa'] },
  { id: 'falco', label: 'Falco (runtime security)', category: 'Security', level: 'project', detail: 'eBPF runtime detection on the cluster; Falcosidekick routes alerts to the AI agent and DefectDojo. Tested with a simulated /etc/shadow read.', evidence: [{ label: 'Runtime walkthrough', href: `${PFE}#demo` }, { label: 'Article: Falco + AI', href: BLOG.falco }], aliases: ['falco', 'falcosidekick', 'runtime security', 'ebpf', 'threat detection', 'cnapp', 'cwpp'] },
  { id: 'defectdojo', label: 'DefectDojo', category: 'Security', level: 'project', detail: 'Centralised Gitleaks, Trivy, ZAP, SonarQube and OPA findings through the DefectDojo API v2.', evidence: [{ label: 'Screenshot: DefectDojo', href: `${IMG}/19-defectdojo-dashboard.webp` }], aliases: ['defectdojo', 'vulnerability management', 'aspm'] },
  { id: 'auth', label: 'JWT / OAuth2 authentication', category: 'Security', level: 'internship', detail: 'Implemented JWT / OAuth2 authentication at STB Bank (2025) and JWT auth in the ESPRIT carpooling app (2024).', evidence: [{ label: 'Experience', href: '/#experience' }], aliases: ['jwt', 'oauth', 'oauth2', 'openid', 'oidc', 'keycloak', 'authentication', 'iam'] },
  { id: 'vault', label: 'HashiCorp Vault', category: 'Security', level: 'none', detail: 'Not documented.', evidence: [], aliases: ['vault', 'hashicorp vault', 'secrets management'] },
  { id: 'siem', label: 'SIEM (Splunk, Sentinel…)', category: 'Security', level: 'none', detail: 'Not documented.', evidence: [], aliases: ['siem', 'splunk', 'sentinel', 'qradar', 'soc'] },

  // Cloud & IaC
  { id: 'digitalocean', label: 'DigitalOcean (DOKS)', category: 'Cloud & IaC', level: 'project', detail: 'The PFE platform ran on a 3-node DigitalOcean Kubernetes cluster (since shut down after the defence).', evidence: [{ label: 'Physical architecture', href: `${PFE}#architecture` }], aliases: ['digitalocean', 'digital ocean', 'doks'] },
  { id: 'aws', label: 'AWS', category: 'Cloud & IaC', level: 'training', detail: 'AWS Academy Graduate – Cloud Foundations (Nov 2025). No documented project on AWS.', evidence: [{ label: 'Certifications', href: '/#certifications' }], aliases: ['aws', 'amazon web services', 'ec2', 's3', 'iam', 'lambda', 'cloudformation', 'eks', 'ecs', 'rds', 'cloudwatch'] },
  { id: 'azure', label: 'Microsoft Azure', category: 'Cloud & IaC', level: 'training', detail: 'Practised AKS through a forked hands-on lab repository (deployments, services, ingress, storage, Azure DevOps pipelines). No documented production project on Azure.', evidence: [{ label: 'AKS lab (fork)', href: 'https://github.com/iyedboubakri12/azure-aks-kubernetes-masterclass' }], aliases: ['azure', 'microsoft azure', 'azure devops', 'arm templates', 'bicep', 'entra'] },
  { id: 'gcp', label: 'Google Cloud', category: 'Cloud & IaC', level: 'none', detail: 'Not documented.', evidence: [], aliases: ['gcp', 'google cloud', 'cloud run', 'bigquery'] },
  { id: 'terraform', label: 'Terraform', category: 'Cloud & IaC', level: 'training', detail: 'Training level. Terraform appears in the forked AKS lab he practised on; no Terraform code of his own is documented in the portfolio.', evidence: [{ label: 'AKS lab (fork)', href: 'https://github.com/iyedboubakri12/azure-aks-kubernetes-masterclass' }], aliases: ['terraform', 'infrastructure as code', 'iac', 'opentofu', 'pulumi', 'hcl'] },
  { id: 'ansible', label: 'Ansible', category: 'Cloud & IaC', level: 'training', detail: 'Training level. No documented project use.', evidence: [], aliases: ['ansible', 'configuration management', 'puppet', 'chef', 'saltstack'] },
  { id: 'linux', label: 'Linux', category: 'Cloud & IaC', level: 'project', detail: 'Operated the Ubuntu VM hosting the GitLab Runner, SonarQube and the AI agent; worked inside containers and cluster nodes.', evidence: [{ label: 'Physical architecture', href: `${PFE}#architecture` }], aliases: ['linux', 'ubuntu', 'debian', 'centos', 'rhel', 'red hat', 'unix', 'system administration', 'sysadmin'] },
  { id: 'networking', label: 'Networking (DNS, TCP/IP, load balancing)', category: 'Cloud & IaC', level: 'none', detail: 'Not documented as a standalone skill (Kubernetes services and ingress were used in the AKS lab).', evidence: [], aliases: ['networking', 'tcp/ip', 'dns', 'load balancing', 'vpn', 'firewall', 'nginx'] },

  // Observability
  { id: 'prometheus', label: 'Prometheus', category: 'Observability', level: 'project', detail: 'Deployed kube-prometheus-stack with Helm and ServiceMonitor targets for the services.', evidence: [{ label: 'Screenshot: targets', href: `${IMG}/22-prometheus-targets.webp` }], aliases: ['prometheus', 'monitoring', 'servicemonitor', 'alertmanager', 'observability'] },
  { id: 'grafana', label: 'Grafana', category: 'Observability', level: 'project', detail: 'Dashboards of cluster CPU and memory per namespace.', evidence: [{ label: 'Screenshot: Grafana', href: `${IMG}/21-grafana-cluster-resources.webp` }], aliases: ['grafana', 'dashboards'] },
  { id: 'elk', label: 'ELK / Loki / Datadog', category: 'Observability', level: 'none', detail: 'Not documented.', evidence: [], aliases: ['elk', 'elasticsearch', 'kibana', 'logstash', 'loki', 'datadog', 'new relic', 'dynatrace', 'opentelemetry'] },

  // Programming & AI
  { id: 'python', label: 'Python', category: 'Programming & AI', level: 'project', detail: 'Wrote the AI remediation agent (Flask + Slack Bolt, RAG, LLM API) and the CI remediation scripts.', evidence: [{ label: 'Runtime walkthrough', href: `${PFE}#demo` }, { label: 'Repository (ai-remediator/)', href: PFE_REPO }], aliases: ['python', 'flask', 'scripting'] },
  { id: 'bash', label: 'Bash / shell', category: 'Programming & AI', level: 'project', detail: 'Shell scripting in GitLab CI jobs (scanners, kubectl, Helm).', evidence: [{ label: 'Article: pipeline', href: BLOG.pipeline }], aliases: ['bash', 'shell', 'shell scripting'] },
  { id: 'llm', label: 'LLM integration & RAG', category: 'Programming & AI', level: 'project', detail: 'Grounded an LLM (Llama 3.3 70B via the Groq API) in internal security standards with RAG to explain Falco alerts and propose Kubernetes fixes, with a human approval step in Slack.', evidence: [{ label: 'Article: Falco + AI', href: BLOG.falco }, { label: 'Screenshot: proposed fix', href: `${IMG}/17-slack-ai-proposed-fix.webp` }], aliases: ['llm', 'genai', 'generative ai', 'rag', 'ai', 'openai', 'llama', 'machine learning', 'mlops', 'aiops'] },
  { id: 'java', label: 'Java / Spring Boot', category: 'Web & Backend', level: 'project', detail: 'Built a Spring Boot REST API (JPA, validation, WebSocket notifications, e-mail) for a sports training platform; the PFE pipeline builds and tests Spring Boot services with Maven.', evidence: [{ label: 'Repository: backendsport', href: 'https://github.com/iyedboubakri12/backendsport' }], aliases: ['java', 'spring', 'spring boot', 'maven', 'jpa'] },
  { id: 'angular', label: 'Angular / TypeScript', category: 'Web & Backend', level: 'internship', detail: 'Angular frontends at STB Bank (2025) and in the ESPRIT carpooling app (2024).', evidence: [{ label: 'Experience', href: '/#experience' }], aliases: ['angular', 'typescript', 'javascript', 'frontend', 'react'] },
  { id: 'dotnet', label: '.NET Core', category: 'Web & Backend', level: 'internship', detail: 'Secure banking microservices with .NET Core at STB Bank (2025).', evidence: [{ label: 'Experience: STB Bank', href: '/#experience' }], aliases: ['.net', 'dotnet', 'c#', 'asp.net'] },
  { id: 'microservices', label: 'Microservices', category: 'Web & Backend', level: 'project', detail: 'Secured and delivered a 6-service Spring Boot + Angular application (API gateway, Eureka, users, courses, exams, answers); developed .NET Core microservices at STB.', evidence: [{ label: 'Article: pipeline', href: BLOG.pipeline }], aliases: ['microservices', 'microservice', 'api gateway', 'rest api', 'restful', 'distributed systems'] },
  { id: 'sql', label: 'SQL databases', category: 'Web & Backend', level: 'internship', detail: 'MySQL in the ESPRIT carpooling app; the PFE application used MySQL, PostgreSQL and MongoDB databases.', evidence: [], aliases: ['sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'database'] },
  { id: 'go', label: 'Go', category: 'Programming & AI', level: 'none', detail: 'Not documented.', evidence: [], aliases: ['golang', 'go language'] },
  { id: 'kafka', label: 'Kafka / messaging', category: 'Web & Backend', level: 'none', detail: 'Not documented.', evidence: [], aliases: ['kafka', 'rabbitmq', 'message queue'] },
]

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export type ProjectDetail = {
  id: string
  name: string
  context: string
  problem: string
  architecture: string
  tech: string[]
  contribution: string
  challenges: string[]
  results: string[]
  lessons: string[]
  links: Evidence[]
  hasDiagram?: boolean
}

const ND = 'Not documented in the portfolio.'

export const PROJECT_DETAILS: ProjectDetail[] = [
  {
    id: 'devsecops-pfe',
    name: PROJECTS[0].name,
    context: 'Final-year engineering project (PFE) · SFM Technologies (Groupe SFM) × ESPRIT · Jan–Jun 2026',
    problem: 'A microservices application (6 Spring Boot services and an Angular frontend) had to be delivered to Kubernetes securely. Security checks were manual and scattered, manifests did not respect basic security rules (38% compliance), and analysing a runtime security alert by hand took about 45 minutes.',
    architecture: 'Three loops. (1) Shift-left CI/CD: a 13-stage GitLab pipeline on a self-hosted runner runs build, tests, SAST, SCA, secret detection, Policy-as-Code, image build, scan, SBOM, signing, deployment and DAST; every report goes to DefectDojo. (2) Cloud-native runtime: a 3-node DigitalOcean Kubernetes cluster kept in sync with Git by Argo CD, Gatekeeper admission policies, Falco (eBPF) runtime detection, Prometheus and Grafana. (3) AI remediation: Falcosidekick sends alerts to a Python agent that retrieves the matching internal rules (RAG), asks Llama 3.3 70B (Groq API) for a diagnosis and fix, and posts it to Slack, where an engineer approves before anything is applied.',
    tech: PROJECTS[0].tech.concat(['Gitleaks', 'OWASP ZAP', 'CycloneDX', 'Prometheus', 'Grafana', 'Slack']),
    contribution: 'Iyed designed and built the platform end to end as the DevSecOps intern: the pipeline, the policies, the GitOps delivery, the runtime detection and the AI remediation agent.',
    challenges: [
      'Keeping a 32-job security pipeline fast enough that developers do not skip it (solved with caching, parallel matrices and the needs DAG).',
      'Conftest and Gatekeeper receive different inputs (a file vs an AdmissionReview), so Rego policies cannot be copied as-is between them.',
      'Adding many scanners one by one without blocking all work: most security jobs were left report-only (`|| true` / `allow_failure`) during the project.',
      'LLMs make mistakes, so the agent proposes fixes but a human must approve them in Slack before they are applied.',
    ],
    results: HIGHLIGHTS.map((h) => `${h.label}: ${h.value}`).concat([
      '7 hardened, signed images with SBOMs delivered through Argo CD to a 3-node DOKS cluster.',
      'End-to-end runtime loop demonstrated: simulated attack → Falco → AI agent → Slack approval → patched deployment.',
    ]),
    lessons: [
      'A pipeline is only a security control if it can say no: move report-only scans to blocking gates progressively, with explicit, reviewed exceptions (baselines, .trivyignore) instead of `|| true`.',
      'Sign only what passed: a signature should mean the image passed the checks, so the scan must fail on CRITICAL findings before signing.',
      'Keep a human in the loop for AI-generated changes to production.',
    ],
    links: [
      { label: 'Project page', href: PFE },
      { label: 'Runtime walkthrough', href: `${PFE}#demo` },
      { label: 'Source code', href: PFE_REPO },
      { label: 'Article: honest retrospective on security gates', href: BLOG.gates },
    ],
    hasDiagram: true,
  },
  {
    id: 'stb-banking',
    name: 'Secure banking microservices (STB Bank internship)',
    context: 'Summer internship · STB Bank, Tunis · Jun–Aug 2025',
    problem: ND,
    architecture: 'Microservices with .NET Core and an Angular frontend; build and deployment automated with Jenkins. No diagram is published.',
    tech: ['.NET Core', 'Angular', 'JWT', 'OAuth2', 'Jenkins'],
    contribution: 'Developed the microservices application, implemented JWT / OAuth2 authentication and automated build and deployment workflows with Jenkins.',
    challenges: [ND],
    results: [ND],
    lessons: [ND],
    links: [{ label: 'Experience', href: '/#experience' }],
  },
  {
    id: 'sports-platform',
    name: PROJECTS[1].name,
    context: 'Personal / academic project',
    problem: ND,
    architecture: 'A Spring Boot REST API (JPA, validation, WebSocket notifications, e-mail) and a separate web frontend.',
    tech: PROJECTS[1].tech,
    contribution: 'Built the backend API (public repository) and a separate frontend repository.',
    challenges: [ND],
    results: [ND],
    lessons: [ND],
    links: [{ label: 'Backend repository', href: PROJECTS[1].repo }, { label: 'Frontend repository', href: 'https://github.com/iyedboubakri12/frontSport' }],
  },
  {
    id: 'carpooling',
    name: 'ESPRIT carpooling application (internship)',
    context: 'Internship · ESPRIT, Tunis · Jul–Aug 2024',
    problem: 'Students and employees of ESPRIT needed a way to share rides to campus.',
    architecture: 'Web and mobile application with a Symfony backend, an Angular frontend and a MySQL database.',
    tech: ['Symfony', 'Angular', 'JWT', 'MySQL', 'Google Maps'],
    contribution: 'Secure JWT authentication, user profiles with carbon-emission tracking, trip creation and search, Google Maps for pick-up and destination points, join requests with accept/refuse, notifications and a reward system.',
    challenges: [ND],
    results: [ND],
    lessons: [ND],
    links: [],
  },
  {
    id: 'aks-lab',
    name: PROJECTS[2].name,
    context: 'Training lab (forked repository, not original work)',
    problem: 'Practise Azure Kubernetes Service hands-on.',
    architecture: 'Course material covering AKS deployments, services, ingress, storage and Azure DevOps pipelines.',
    tech: PROJECTS[2].tech,
    contribution: 'Worked through the lab exercises. The repository is a fork used for training.',
    challenges: [ND],
    results: [ND],
    lessons: [ND],
    links: [{ label: 'Repository (fork)', href: PROJECTS[2].repo }],
  },
]

/* ------------------------------------------------------------------ */
/* Interactive architecture (PFE)                                      */
/* ------------------------------------------------------------------ */

export type ArchNode = {
  id: string
  label: string
  sub: string
  x: number
  y: number
  zone: 'ci' | 'runtime' | 'ai' | 'gov'
  what: string
  why: string
  img?: string
  ask: string
}

export const ARCH_NODES: ArchNode[] = [
  { id: 'git', label: 'Git repository', sub: 'GitLab', x: 95, y: 80, zone: 'ci', what: 'Application code, Dockerfiles and Kubernetes manifests (k8s/) live in GitLab. Git is the single source of truth for both the pipeline and Argo CD.', why: 'GitOps: every change to the cluster is a reviewed commit.', ask: 'How is the Git repository organised for GitOps in the DevSecOps project?' },
  { id: 'ci', label: 'GitLab CI/CD', sub: '13 stages · 32 jobs', x: 285, y: 80, zone: 'ci', what: 'A 13-stage pipeline on a self-hosted runner: build, unit tests, security scans, Policy-as-Code, Docker build, scan/SBOM/sign, pipeline audit, deploy, DAST, DefectDojo import and AI remediation.', why: 'Security runs on every commit instead of at the end. Caching and parallel matrices cut the runtime by 40%.', img: `${IMG}/01-gitlab-pipeline-part1.webp`, ask: 'Walk me through the 13 stages of the GitLab pipeline and why they are in that order.' },
  { id: 'scan', label: 'Security scans', sub: 'SonarQube · Trivy · Gitleaks · Conftest · ZAP', x: 475, y: 80, zone: 'ci', what: 'SAST with SonarQube quality gates, SCA with Trivy and npm audit, secret detection with Gitleaks over the full history, Rego policies with Conftest, and a DAST baseline with OWASP ZAP after deployment.', why: 'One control per layer. During the project most of these jobs were report-only; Iyed documents how to turn them into blocking gates.', img: `${IMG}/04-sonarqube-sast.webp`, ask: 'Which security scans run in the pipeline, and do they block a bad commit?' },
  { id: 'registry', label: 'Registry · Cosign', sub: 'SBOM · signature', x: 665, y: 80, zone: 'ci', what: '7 hardened non-root images are pushed to the GitLab Container Registry, scanned by Trivy, described by a CycloneDX SBOM and signed with Cosign.', why: 'Supply-chain integrity: you can prove what an image contains and who built it.', img: `${IMG}/08-cosign-signature-verify.webp`, ask: 'How did Iyed secure the software supply chain with Cosign and SBOMs?' },
  { id: 'argocd', label: 'Argo CD', sub: 'auto-sync · self-heal', x: 880, y: 80, zone: 'runtime', what: 'Argo CD continuously reconciles the cluster with the manifests in Git, with auto-sync and self-heal enabled.', why: 'Manual drift in the cluster is reverted automatically; deployments are auditable commits.', img: `${IMG}/11-argocd-synced-healthy.webp`, ask: 'How does Argo CD keep the cluster in sync with Git in this project?' },
  { id: 'k8s', label: 'Kubernetes (DOKS)', sub: '3 nodes · 7 services', x: 880, y: 250, zone: 'runtime', what: 'A 3-node DigitalOcean Kubernetes cluster running the microservices, the frontend, the AI agent, Falco and the monitoring stack, with namespaces, RBAC and resource limits.', why: 'Managed Kubernetes kept the focus on delivery and security rather than control-plane operations.', img: `${IMG}/09-kubectl-pods-doks.webp`, ask: 'What did Iyed do hands-on with Kubernetes in the DevSecOps project?' },
  { id: 'gatekeeper', label: 'OPA Gatekeeper', sub: 'admission policies', x: 665, y: 250, zone: 'runtime', what: 'Admission policies inside the cluster: resource limits required, runAsNonRoot required, privileged containers forbidden. Compliance went from 38% to 100%.', why: 'A second line of defence: even a manifest that bypasses CI is checked at admission. Iyed\'s review found gaps that he documents.', img: `${IMG}/07-opa-conftest-results.webp`, ask: 'Explain the Policy-as-Code setup with Conftest and Gatekeeper.' },
  { id: 'prom', label: 'Prometheus', sub: 'ServiceMonitors', x: 475, y: 250, zone: 'gov', what: 'kube-prometheus-stack installed with Helm; ServiceMonitors scrape the services and the cluster.', why: 'Observability of the platform and the workloads.', img: `${IMG}/22-prometheus-targets.webp`, ask: 'How was monitoring set up with Prometheus and Grafana?' },
  { id: 'grafana', label: 'Grafana', sub: 'dashboards', x: 285, y: 250, zone: 'gov', what: 'Dashboards of cluster CPU and memory per namespace.', why: 'Lets the team see the effect of resource limits and spot anomalies.', img: `${IMG}/21-grafana-cluster-resources.webp`, ask: 'What did the Grafana dashboards show in the DevSecOps project?' },
  { id: 'defectdojo', label: 'DefectDojo', sub: 'all findings', x: 95, y: 250, zone: 'gov', what: 'Gitleaks, Trivy, ZAP, SonarQube and OPA results are imported through the DefectDojo API v2; Falco alerts are linked too.', why: 'One place to triage, deduplicate and track vulnerabilities instead of reading ten reports.', img: `${IMG}/19-defectdojo-dashboard.webp`, ask: 'How was vulnerability management centralised with DefectDojo?' },
  { id: 'falco', label: 'Falco', sub: 'eBPF runtime detection', x: 880, y: 420, zone: 'runtime', what: 'Falco watches syscalls on the nodes. In the demo it detects a process reading /etc/shadow inside the frontend container.', why: 'Shift-left cannot catch what happens inside a running container.', img: `${IMG}/14-attack-simulation-etc-shadow.webp`, ask: 'How does Falco detect runtime attacks in this project?' },
  { id: 'sidekick', label: 'Falcosidekick', sub: 'alert routing', x: 665, y: 420, zone: 'runtime', what: 'Forwards Falco events by webhook to the AI agent and to DefectDojo.', why: 'Decouples detection from response.', img: `${IMG}/13-falcosidekick-dashboard.webp`, ask: 'What is Falcosidekick used for in the platform?' },
  { id: 'agent', label: 'AI agent', sub: 'Python · RAG · Llama 3.3', x: 475, y: 420, zone: 'ai', what: 'A Python service (Flask + Slack Bolt) receives the alert, retrieves the matching internal security rules (RAG) and asks Llama 3.3 70B through the Groq API for a diagnosis and a corrected Kubernetes manifest — in about 20 seconds instead of ~45 minutes by hand.', why: 'Faster, consistent triage grounded in the company\'s own standards. Note: the runtime agent\'s source is not in the public repository; it is documented by screenshots.', img: `${IMG}/15-ai-agent-receives-falco-alert.webp`, ask: 'How does the AI remediation agent work, and how is it kept safe?' },
  { id: 'slack', label: 'Slack approval', sub: 'human in the loop', x: 285, y: 420, zone: 'ai', what: 'The agent posts severity, analysis, the violated rule and a proposed fix with "Apply fix" and "View in DefectDojo" buttons. Nothing changes until an engineer approves; then the deployment is patched and pods restart.', why: 'Models make mistakes: a wrong automatic patch in production would be a new incident.', img: `${IMG}/17-slack-ai-proposed-fix.webp`, ask: 'Why does the AI fix wait for a human approval in Slack?' },
]

export const ARCH_EDGES: { from: string; to: string; label?: string; path?: string }[] = [
  { from: 'git', to: 'ci', label: 'push' },
  { from: 'ci', to: 'scan' },
  { from: 'scan', to: 'registry' },
  { from: 'registry', to: 'argocd', label: 'signed image' },
  { from: 'argocd', to: 'k8s', label: 'sync' },
  { from: 'gatekeeper', to: 'k8s', label: 'admission' },
  { from: 'k8s', to: 'prom', label: 'metrics', path: 'M860 278 C 840 340, 500 340, 475 284' },
  { from: 'prom', to: 'grafana' },
  { from: 'scan', to: 'defectdojo', label: 'reports', path: 'M475 108 C 475 170, 95 150, 95 222' },
  { from: 'k8s', to: 'falco', label: 'syscalls' },
  { from: 'falco', to: 'sidekick' },
  { from: 'sidekick', to: 'agent', label: 'webhook' },
  { from: 'agent', to: 'slack', label: 'diagnosis + fix' },
  { from: 'slack', to: 'k8s', label: 'approved patch', path: 'M285 448 L285 492 L978 492 L978 250 L958 250' },
]

/* ------------------------------------------------------------------ */
/* Technical interview bank                                            */
/* ------------------------------------------------------------------ */

export const INTERVIEW_TOPICS = ['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'Linux', 'Cloud (AWS/Azure)', 'DevSecOps', 'Python'] as const
export type InterviewTopic = (typeof INTERVIEW_TOPICS)[number]

export type InterviewQuestion = { q: string; lookFor: string; evidence: string; link?: string }

export const INTERVIEW_BANK: Record<InterviewTopic, { level: EvidenceLevel; note: string; questions: InterviewQuestion[] }> = {
  Kubernetes: {
    level: 'project',
    note: 'Hands-on on a 3-node DOKS cluster during the PFE; CKA in preparation.',
    questions: [
      { q: 'How would you stop a privileged container or a pod without resource limits from reaching the cluster?', lookFor: 'Admission control (Gatekeeper/Kyverno), Pod Security Standards, checks in CI before deploy, defence in depth.', evidence: 'He enforced exactly these rules with Conftest in CI and Gatekeeper at admission (38% → 100% compliance).', link: blog('policy-as-code-opa-conftest-gatekeeper') },
      { q: 'A pod is in CrashLoopBackOff after a deploy. Walk me through your debugging.', lookFor: 'kubectl describe/logs --previous, events, probes, resource limits (OOMKilled), image/config changes, rollback.', evidence: 'Not specifically documented — a good question to test operational depth live.' },
      { q: 'What does Argo CD self-heal do, and when could it surprise an on-call engineer?', lookFor: 'Reverts manual drift to the Git state; a hotfix with kubectl gets undone unless committed.', evidence: 'He ran Argo CD with auto-sync and self-heal and captured the self-healing behaviour.', link: `${PFE}#kubernetes` },
    ],
  },
  Docker: {
    level: 'project',
    note: 'Built 7 hardened images in CI.',
    questions: [
      { q: 'What makes a container image "hardened"?', lookFor: 'Non-root user, minimal base, multi-stage builds, no secrets in layers, pinned versions, scanning.', evidence: 'His images run as non-root (UID 1001) from a Dockerfile.secure and are scanned with Trivy.', link: `${PFE}#security` },
      { q: 'How do you keep Docker builds fast in CI?', lookFor: 'Layer ordering, build cache / registry cache, dependency caching, parallel builds.', evidence: 'He documents the caching and parallelisation that cut his pipeline by 40%.', link: blog('faster-gitlab-ci-caching-parallel-jobs') },
      { q: 'How would you prove which image is running in production and what is inside it?', lookFor: 'Immutable tags/digests, SBOM, signatures (Cosign), verification at admission.', evidence: 'He signed images with Cosign and generated CycloneDX SBOMs.', link: blog('supply-chain-security-cosign-sbom') },
    ],
  },
  Terraform: {
    level: 'training',
    note: 'Training level only — no Terraform code of his own is documented. Use these to gauge fundamentals.',
    questions: [
      { q: 'What is Terraform state, and how should a team store and lock it?', lookFor: 'Remote backend (S3+DynamoDB, Azure Storage, Terraform Cloud), locking, no secrets in plain state, least privilege.', evidence: 'Not documented in the portfolio — tests fundamentals.' },
      { q: 'How would you structure Terraform for dev, staging and prod?', lookFor: 'Modules, separate state per environment, variables/tfvars or workspaces, CI plan/apply with review.', evidence: 'Not documented — tests reasoning.' },
      { q: 'How would you add security checks for Terraform to a pipeline?', lookFor: 'fmt/validate, tflint, Checkov/tfsec/Trivy config, OPA/Conftest on the plan, manual approval for apply.', evidence: 'Transferable: he already ran Trivy and OPA/Conftest policies in CI on Kubernetes manifests.', link: blog('policy-as-code-opa-conftest-gatekeeper') },
    ],
  },
  'CI/CD': {
    level: 'project',
    note: '13-stage GitLab pipeline in the PFE; Jenkins at STB Bank.',
    questions: [
      { q: 'How do you order security stages in a pipeline, and why?', lookFor: 'Cheap and fast checks first (secrets, SAST, SCA), image scan after build, DAST after deploy to a test environment, fail fast.', evidence: 'He wrote a full article on the order of his 13 stages.', link: blog('devsecops-pipeline-gitlab-ci-13-stages') },
      { q: 'Your security scans all pass, but they use `|| true`. What is wrong and how do you fix it without blocking the team?', lookFor: 'Report-only is not a control; baselines, gating on new findings, explicit exceptions with expiry, progressive enforcement.', evidence: 'This is a weakness he found in his own pipeline and documented with a remediation plan.', link: blog('report-only-to-blocking-security-gates') },
      { q: 'How did you make a 32-job pipeline 40% faster?', lookFor: 'Caching, parallel matrix, needs DAG, avoiding redundant work.', evidence: 'Documented with real snippets.', link: blog('faster-gitlab-ci-caching-parallel-jobs') },
    ],
  },
  Linux: {
    level: 'project',
    note: 'Operated the Ubuntu VM hosting the CI runner, SonarQube and the AI agent.',
    questions: [
      { q: 'A Linux VM running your CI runner is out of disk space. What do you check?', lookFor: 'df/du, Docker images and build cache (docker system prune), logs, journald, inode usage.', evidence: 'He ran a self-hosted GitLab Runner on an Ubuntu VM — a realistic scenario for him.', link: `${PFE}#architecture` },
      { q: 'Why is reading /etc/shadow inside a container a red flag, and how would you detect it?', lookFor: 'Credential access, should not happen in an app container; syscall monitoring (Falco/eBPF), non-root users, read-only filesystems.', evidence: 'This is exactly the attack he simulated and detected with Falco.', link: `${PFE}#demo` },
      { q: 'How do you find which process is listening on a port and who owns it?', lookFor: 'ss -tulpn / lsof -i, ps, systemctl status.', evidence: 'Not specifically documented — tests fundamentals.' },
    ],
  },
  'Cloud (AWS/Azure)': {
    level: 'training',
    note: 'AWS Academy Cloud Foundations and an AKS hands-on lab; his project cloud was DigitalOcean (DOKS).',
    questions: [
      { q: 'Explain the shared responsibility model with an example.', lookFor: 'Provider secures the cloud, customer secures what they run in it (IAM, data, config, patching for IaaS).', evidence: 'Covered by AWS Academy Cloud Foundations.' },
      { q: 'How would you give a CI pipeline access to a cloud account without long-lived keys?', lookFor: 'OIDC federation / workload identity, short-lived credentials, least-privilege roles.', evidence: 'Not documented — tests security reasoning.' },
      { q: 'What would change if you moved the DOKS platform to EKS or AKS?', lookFor: 'Managed identity/IAM integration, load balancers, storage classes, registry, cost, networking (VPC/VNet).', evidence: 'Connects his real DOKS project to the major clouds.', link: `${PFE}#architecture` },
    ],
  },
  DevSecOps: {
    level: 'project',
    note: 'The core of his PFE.',
    questions: [
      { q: 'Name one security control per layer, from code to runtime.', lookFor: 'SAST, SCA, secrets, IaC/manifest policies, admission, image scan, signing/SBOM, DAST, runtime detection, vulnerability management.', evidence: 'His "one control per layer" table maps each layer to a tool he used.', link: `${PFE}#security` },
      { q: 'Would you let an AI apply security fixes to production automatically?', lookFor: 'Human in the loop, scoped permissions, audit trail, grounding in internal standards, rollback.', evidence: 'His AI agent proposes fixes in Slack and waits for an engineer\'s approval.', link: blog('falco-ai-remediation-human-in-the-loop') },
      { q: 'What does an image signature actually guarantee?', lookFor: 'Provenance and integrity, not absence of vulnerabilities; sign only after checks pass; verify at admission.', evidence: 'He documents that his pipeline signs images even when the scan finds issues, and how to fix it.', link: blog('supply-chain-security-cosign-sbom') },
    ],
  },
  Python: {
    level: 'project',
    note: 'Wrote the AI remediation agent and CI scripts.',
    questions: [
      { q: 'How would you structure a small service that receives webhooks and calls an external API?', lookFor: 'Input validation, timeouts and retries, secrets from env, idempotency, logging, error handling.', evidence: 'His agent receives Falcosidekick webhooks and calls an LLM API and Slack.', link: `${PFE}#demo` },
      { q: 'How do you stop an LLM from inventing a fix that breaks your cluster?', lookFor: 'Grounding (RAG), output validation (e.g. YAML schema / dry-run), human approval, least privilege.', evidence: 'He grounds the model in internal standards and requires human approval.', link: blog('falco-ai-remediation-human-in-the-loop') },
      { q: 'How would you test that integration without calling the real APIs?', lookFor: 'Mocks/fakes, recorded fixtures, contract tests, a manual CI job for end-to-end.', evidence: 'He used a manual CI job that simulates an attack to test the full loop.', link: `${PFE}#pipeline` },
    ],
  },
}

/* ------------------------------------------------------------------ */
/* Core profile facts (always given to the model)                      */
/* ------------------------------------------------------------------ */

export const NOT_DOCUMENTED_TOPICS = [
  'salary expectations',
  'notice period / exact start date',
  'visa or work-permit status for any country',
  'phone number or home address',
  'references or testimonials',
  'years of professional experience beyond the internships listed',
]

export function coreProfileText(): string {
  const exp = EXPERIENCE.map((e) => `- ${e.role} — ${e.company} (${e.place}), ${e.dates}\n${e.bullets.map((b) => `  • ${b}`).join('\n')}`).join('\n')
  const certs = CERTIFICATIONS.map((c) => `- ${c.name} — ${c.issuer} — ${c.inProgress ? 'IN PREPARATION, NOT OBTAINED' : c.date}`).join('\n')
  const skills = SKILL_EVIDENCE.map((s) => `- ${s.label} [${s.level}]: ${s.detail}`).join('\n')
  const projects = PROJECT_DETAILS.map((p) => `### ${p.name}\nContext: ${p.context}\nProblem: ${p.problem}\nArchitecture: ${p.architecture}\nTechnologies: ${p.tech.join(', ')}\nContribution: ${p.contribution}\nChallenges: ${p.challenges.join(' | ')}\nResults: ${p.results.join(' | ')}\nLessons: ${p.lessons.join(' | ')}`).join('\n\n')
  const stages = STAGES.map((s) => `${s.n}. ${s.label} (${s.tools}): ${s.what}`).join('\n')
  const demo = DEMO.map((d, i) => `${i + 1}. ${d.title} — ${d.text}`).join('\n')

  return `# Candidate: ${PROFILE.name}
Title: ${PROFILE.title}
Positioning: ${PROFILE.pitch}
Status: graduated in 2026; looking for a first full-time role as Junior DevOps, DevSecOps, Cloud or Cloud Security Engineer.
Location & mobility: ${PROFILE.location}. (Remote preference, visa status and start date are not documented.)
Languages: Arabic (native), French (professional), English (professional).

## Education
- ${EDUCATION.degree} — ${EDUCATION.school} (${EDUCATION.dates}, graduated 2026).
- Bachelor's degree (Licence) in Electronics, Electrical Engineering and Automation — Faculty of Sciences of Gabès, University of Gabès (2020–2023).

## Experience
${exp}
- Intern — ESPRIT (Tunis), Jul 2024 – Aug 2024
  • Built a web/mobile carpooling application for ESPRIT students and staff (Symfony, Angular, JWT, MySQL): JWT authentication, profiles with carbon-emission tracking, trip creation and search, Google Maps, join requests, notifications and rewards.

## Certifications & training
${certs}
- Building Transformer-Based Natural Language Processing Applications — issuer not documented
- Fundamentals of Deep Learning — issuer not documented

## Skills with evidence level
(project = hands-on in a documented project; internship = used in an internship; training = courses/labs only; none = not documented)
${skills}

## Projects
${projects}

## PFE pipeline stages (mirrors .gitlab-ci.yml)
${stages}

## PFE runtime demo (real screenshots)
${demo}

## Known limitations Iyed documents himself
- Most security jobs in the PFE pipeline were report-only (\`|| true\` / \`allow_failure: true\`): findings were sent to DefectDojo but did not block deployment. He wrote a plan to make them blocking gates.
- Images were signed even if the Trivy scan found issues; he documents "sign only what passed" as the fix.
- He found gaps in the Gatekeeper setup when reviewing it (see the Policy-as-Code article).
- The PFE cluster, SonarQube, DefectDojo and Slack workspace were shut down after the defence: there is no live demo, only real screenshots.
- The public repository contains the pipeline, manifests and the CI remediation scripts (ai-remediator/). The Flask + Slack Bolt runtime agent shown in the screenshots is not published.
- The reported metrics (38% → 100%, −40%, ~45 min → ~20 s) come from Iyed's own project measurements; there is no third-party audit.

## Not documented (say so and suggest contacting Iyed)
${NOT_DOCUMENTED_TOPICS.map((t) => `- ${t}`).join('\n')}

## Links
- Portfolio: ${SITE_URL}
- Recruiter mode: ${SITE_URL}${RECRUITER_PATH}
- DevSecOps project page: ${SITE_URL}${PFE_PATH}
- GitHub: ${PROFILE.github}
- PFE repository: ${PFE_REPO}
- LinkedIn: ${PROFILE.linkedin}
- CV (PDF): ${SITE_URL}${PROFILE.cv}
- Email: ${PROFILE.email}
`
}

/* ------------------------------------------------------------------ */
/* Retrieval chunks built from the structured data                     */
/* ------------------------------------------------------------------ */

export type Chunk = { id: string; title: string; text: string; href: string; keywords?: string }

export function knowledgeChunks(): Chunk[] {
  const chunks: Chunk[] = [
    {
      id: 'profile:logistics',
      title: 'Profile: location, mobility, languages and contact',
      text: `${PROFILE.location}. Languages: Arabic (native), French (professional), English (professional). Contact: ${PROFILE.email}, LinkedIn, GitHub, CV PDF. Not documented: salary expectations, notice period / start date, visa or work-permit status, remote preference, phone number.`,
      keywords: 'relocation relocate relocalisation mobilité mobility move abroad europe international remote télétravail visa permit location localisation based country pays languages langues english french anglais français arabic contact email mail phone salary salaire availability disponibilité start notice',
      href: '/#contact',
    },
    {
      id: 'profile:education',
      title: 'Profile: education',
      text: `${EDUCATION.degree}, ${EDUCATION.school}, ${EDUCATION.dates}. Bachelor's (Licence) in Electronics, Electrical Engineering and Automation, Faculty of Sciences of Gabès, 2020–2023.`,
      keywords: 'education formation degree diplôme engineering ingénieur university université school école esprit gabes gabès licence bachelor studies études',
      href: '/#about',
    },
  ]
  for (const s of SKILL_EVIDENCE) {
    chunks.push({ id: `skill:${s.id}`, title: `Skill: ${s.label}`, text: `${s.detail} Evidence level: ${LEVEL_LABEL[s.level].en}.`, keywords: s.aliases.join(' '), href: s.evidence[0]?.href ?? `${RECRUITER_PATH}#skills` })
  }
  for (const p of PROJECT_DETAILS) {
    chunks.push({ id: `project:${p.id}`, title: `Project: ${p.name}`, text: `${p.context}. ${p.problem} ${p.architecture} Contribution: ${p.contribution} Technologies: ${p.tech.join(', ')}. Results: ${p.results.join('; ')}. Lessons: ${p.lessons.join('; ')}`, href: p.links[0]?.href ?? `${RECRUITER_PATH}#projects` })
  }
  for (const n of ARCH_NODES) {
    chunks.push({ id: `arch:${n.id}`, title: `Architecture: ${n.label}`, text: `${n.label} — ${n.sub}. ${n.what} ${n.why}`, href: `${RECRUITER_PATH}#architecture` })
  }
  for (const s of STAGES) {
    chunks.push({ id: `stage:${s.id}`, title: `Pipeline stage ${s.n}: ${s.label}`, text: `Stage ${s.n} ${s.label}, tools ${s.tools}. ${s.what}`, href: `${PFE_PATH}#pipeline` })
  }
  for (const e of EXPERIENCE) {
    chunks.push({ id: `exp:${e.company}`, title: `Experience: ${e.company}`, text: `${e.role} at ${e.company}, ${e.place}, ${e.dates}. ${e.bullets.join(' ')}`, href: '/#experience' })
  }
  return chunks
}

/* ------------------------------------------------------------------ */
/* Candidate summary (deterministic, no LLM needed)                    */
/* ------------------------------------------------------------------ */

export function candidateSummary(lang: 'en' | 'fr'): string {
  const strong = SKILL_EVIDENCE.filter((s) => s.level === 'project').map((s) => s.label)
  const top = ['GitLab CI/CD', 'Kubernetes', 'Argo CD / GitOps', 'Docker', 'OPA / Conftest / Gatekeeper', 'Falco (runtime security)', 'Trivy (SCA & image scan)', 'Cosign & CycloneDX SBOM', 'Prometheus', 'Python'].filter((s) => strong.includes(s))
  const training = SKILL_EVIDENCE.filter((s) => s.level === 'training').map((s) => s.label)
  const metrics = HIGHLIGHTS.map((h) => `${h.label} ${h.value}`).join(' · ')
  if (lang === 'fr') {
    return `CANDIDAT : ${PROFILE.name} — Ingénieur DevOps / DevSecOps / Cloud junior

FORMATION
• Diplôme national d'ingénieur en informatique, génie logiciel — ESPRIT, Tunis (2023–2026)
• Licence en électronique, électrotechnique et automatique — Faculté des sciences de Gabès (2020–2023)

COMPÉTENCES PROUVÉES PAR UN PROJET
${top.join(' · ')}
Niveau formation uniquement : ${training.join(', ')} (CKA en préparation, non obtenue)

EXPÉRIENCE PERTINENTE
• SFM Technologies — Ingénieur DevSecOps, PFE (janv.–juin 2026) : plateforme DevSecOps cloud-native — pipeline GitLab CI de 13 étapes, GitOps avec Argo CD sur Kubernetes (DOKS, 3 nœuds), Policy-as-Code OPA, Cosign/SBOM, Falco et agent de remédiation IA avec validation humaine dans Slack.
  Résultats annoncés : ${metrics}
• STB Bank — Stage DevOps & développement web (juin–août 2025) : microservices .NET Core / Angular, JWT/OAuth2, automatisation Jenkins.
• ESPRIT — Stage (juil.–août 2024) : application de covoiturage Symfony / Angular / MySQL.

POINTS FORTS
• Sécurité intégrée de bout en bout, du commit au runtime
• Documente ses choix et ses limites (rétrospective honnête sur ses propres security gates)
• Automatisation et IA appliquée à l'exploitation, avec humain dans la boucle

ADÉQUATION POTENTIELLE
DevOps Engineer junior · DevSecOps Engineer · Cloud / Platform Engineer junior · Cloud Security Engineer junior
Mobilité : Tunisie, ouvert à une relocalisation en Europe et à l'international

LIENS
Portfolio : ${SITE_URL}
Projet DevSecOps : ${SITE_URL}${PFE_PATH}
GitHub : ${PROFILE.github}
LinkedIn : ${PROFILE.linkedin}
CV : ${SITE_URL}${PROFILE.cv}
Contact : ${PROFILE.email}`
  }
  return `CANDIDATE: ${PROFILE.name} — Junior DevOps / DevSecOps / Cloud Engineer

EDUCATION
• National Engineering Degree in Computer Science, Software Engineering — ESPRIT, Tunis (2023–2026)
• Bachelor's in Electronics, Electrical Engineering and Automation — Faculty of Sciences of Gabès (2020–2023)

SKILLS WITH PROJECT EVIDENCE
${top.join(' · ')}
Training level only: ${training.join(', ')} (CKA in preparation, not yet obtained)

RELEVANT EXPERIENCE
• SFM Technologies — DevSecOps Engineer, final-year internship (Jan–Jun 2026): cloud-native DevSecOps platform — 13-stage GitLab CI pipeline, GitOps with Argo CD on Kubernetes (3-node DOKS), OPA Policy-as-Code, Cosign/SBOM, Falco and an AI remediation agent with human approval in Slack.
  Reported results: ${metrics}
• STB Bank — DevOps & Web Developer intern (Jun–Aug 2025): .NET Core / Angular microservices, JWT/OAuth2, Jenkins automation.
• ESPRIT — Intern (Jul–Aug 2024): carpooling app with Symfony / Angular / MySQL.

MAIN STRENGTHS
• Security built in end to end, from commit to runtime
• Documents decisions and limitations openly (public retrospective on his own security gates)
• Practical automation and applied AI for operations, with a human in the loop

POTENTIAL ROLE FIT
Junior DevOps Engineer · DevSecOps Engineer · Junior Cloud / Platform Engineer · Junior Cloud Security Engineer
Mobility: based in Tunisia, open to relocation in Europe and internationally

LINKS
Portfolio: ${SITE_URL}
DevSecOps project: ${SITE_URL}${PFE_PATH}
GitHub: ${PROFILE.github}
LinkedIn: ${PROFILE.linkedin}
CV: ${SITE_URL}${PROFILE.cv}
Contact: ${PROFILE.email}`
}
