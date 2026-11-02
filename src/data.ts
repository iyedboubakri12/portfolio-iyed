export const PROFILE = {
  name: 'Iyed Boubakri',
  title: 'DevOps Engineer | DevSecOps | Cloud & CI/CD',
  school: 'Software Engineering graduate from ESPRIT, Tunisia',
  pitch:
    'Junior DevOps / DevSecOps engineer. I build secure CI/CD pipelines, ship workloads to Kubernetes with GitOps and automate security from commit to runtime, including an AI agent that turns Falco alerts into reviewed fixes.',
  email: 'boubakriiyed.i@gmail.com',
  linkedin: 'https://www.linkedin.com/in/iyed-boubakri-1a1376327/',
  github: 'https://github.com/iyedboubakri12',
  cv: '/cv/Iyed-Boubakri-DevOps-Cloud-CV.pdf',
  location: 'Tunisia · open to relocation in Europe and internationally',
}

export const PFE_REPO = 'https://github.com/iyedboubakri12/-pfe-devsecops-microservices'
export const PFE_PATH = '/projects/devsecops-pfe'
export const IMG = '/projects/devsecops'

export const ABOUT = [
  'I am a software engineer who moved into DevOps and DevSecOps because I like making delivery fast and secure at the same time. For my final-year project at SFM Technologies, I designed and ran a cloud-native DevSecOps platform on DigitalOcean Kubernetes: a 13-stage GitLab CI/CD pipeline, GitOps delivery with Argo CD, Policy-as-Code with OPA, runtime detection with Falco and an AI remediation agent connected to Slack.',
  'I care about automation that a team can trust: reproducible pipelines, clear policies, observability and humans in the loop for risky changes. I am currently preparing the Certified Kubernetes Administrator (CKA) exam and I am looking for a Junior DevOps, DevSecOps, Cloud or Cloud Security Engineer role.',
]

export const HIGHLIGHTS = [
  { value: '38% → 100%', label: 'Kubernetes policy compliance' },
  { value: '−40%', label: 'pipeline execution time' },
  { value: '~45 min → ~20 s', label: 'time to analyse a runtime alert' },
  { value: '13 / 32', label: 'pipeline stages / jobs' },
]

export const SKILLS: { group: string; items: string[] }[] = [
  { group: 'Cloud & Infrastructure', items: ['DigitalOcean (DOKS)', 'Microsoft Azure', 'AWS', 'Linux', 'Bash', 'Terraform (training)', 'Ansible (training)'] },
  { group: 'Containers & Orchestration', items: ['Docker', 'Kubernetes', 'Helm', 'OPA Gatekeeper', 'Kubernetes RBAC'] },
  { group: 'CI/CD & GitOps', items: ['GitLab CI/CD', 'Jenkins', 'Argo CD', 'Git', 'Maven', 'npm'] },
  { group: 'DevSecOps & Security', items: ['SonarQube', 'Trivy', 'Gitleaks', 'OWASP ZAP', 'OPA / Conftest', 'Cosign', 'CycloneDX SBOM', 'DefectDojo', 'Falco'] },
  { group: 'Monitoring & Observability', items: ['Prometheus', 'Grafana', 'Falcosidekick', 'ServiceMonitors'] },
  { group: 'Programming & Automation', items: ['Python', 'Java / Spring Boot', 'TypeScript / Angular', 'YAML', 'Groq API / Llama 3.3', 'RAG', 'Slack integrations'] },
]

export type Project = {
  name: string
  summary: string
  tech: string[]
  repo: string
  details?: string
  demo?: string
  image?: string
  note?: string
}

export const PROJECTS: Project[] = [
  {
    name: 'Cloud-Native DevSecOps Platform with AI-Assisted Remediation',
    summary:
      'Final-year project at SFM Technologies. A 13-stage GitLab pipeline (SAST, SCA, secrets, Policy-as-Code, image scan, SBOM, signing, DAST) delivers 7 microservice images to a 3-node DOKS cluster through Argo CD. Falco watches the running cluster, and an AI agent (RAG + Llama 3.3 70B via Groq) posts an analysis and a fix to Slack, which an engineer approves before it is applied.',
    tech: ['GitLab CI/CD', 'Kubernetes', 'Argo CD', 'Helm', 'OPA', 'Falco', 'Trivy', 'SonarQube', 'Cosign', 'DefectDojo', 'Python', 'Groq'],
    repo: PFE_REPO,
    details: PFE_PATH,
    demo: PFE_PATH + '#demo',
    image: `${IMG}/global-architecture.webp`,
  },
  {
    name: 'Sports Training Management Platform',
    summary:
      'Full-stack sports training management application: a Spring Boot REST API (JPA, validation, WebSocket notifications, e-mail) and a separate web frontend.',
    tech: ['Java', 'Spring Boot', 'JPA', 'WebSocket', 'REST'],
    repo: 'https://github.com/iyedboubakri12/backendsport',
    note: 'Frontend: github.com/iyedboubakri12/frontSport',
  },
  {
    name: 'Azure AKS Kubernetes Masterclass (lab)',
    summary:
      'Hands-on lab repository forked to practise AKS: deployments, services, ingress, storage and Azure DevOps pipelines.',
    tech: ['Azure', 'AKS', 'Kubernetes', 'Terraform'],
    repo: 'https://github.com/iyedboubakri12/azure-aks-kubernetes-masterclass',
    note: 'Fork used for training',
  },
]

export const EXPERIENCE = [
  {
    role: 'DevSecOps Engineer, Final-Year Internship',
    company: 'SFM Technologies',
    place: 'Tunis, Tunisia',
    dates: 'Jan 2026 – Jun 2026',
    bullets: [
      'Built an end-to-end DevSecOps pipeline for a Spring Boot / Angular microservices application on a 3-node managed Kubernetes cluster, delivered through GitOps with Argo CD (continuous reconciliation, self-healing).',
      'Designed a 13-stage GitLab CI chain (build, tests, SAST, SCA, secret detection, image scanning, DAST) and cut its total runtime by 40% with caching and parallel scans.',
      'Enforced Policy-as-Code in Rego (OPA / Conftest, Gatekeeper) on Kubernetes manifests and raised compliance from 38% to 100%: no privileged containers and no pods without resource limits.',
      'Added image signing with Cosign and CycloneDX SBOMs, runtime detection with Falco, monitoring with Prometheus and Grafana, and centralised vulnerability management in DefectDojo.',
      'Developed a Python AI remediation agent grounded in internal security standards. It posts a diagnosis and a fix to Slack in ~20 s, compared with more than 45 minutes of manual handling.',
    ],
  },
  {
    role: 'DevOps & Web Developer, Summer Internship',
    company: 'STB Bank',
    place: 'Tunis, Tunisia',
    dates: 'Jun 2025 – Aug 2025',
    bullets: [
      'Developed a secure banking microservices application with .NET Core and Angular.',
      'Implemented JWT / OAuth2 authentication and automated build and deployment workflows with Jenkins.',
    ],
  },
]

export const CERTIFICATIONS = [
  { name: 'Certified Kubernetes Administrator (CKA)', issuer: 'CNCF / Linux Foundation', date: 'Preparation in progress', inProgress: true },
  { name: 'DevSecOps for the Absolute Beginners – Hands-On Demos', issuer: 'Udemy', date: 'Jan 2026' },
  { name: 'AWS Academy Graduate – Cloud Foundations', issuer: 'AWS Academy', date: 'Nov 2025' },
  { name: 'Docker Training Course for the Absolute Beginner', issuer: 'KodeKloud', date: 'Apr 2025' },
  { name: 'DevOps Pre-Requisite Course', issuer: 'KodeKloud', date: 'Jan 2025' },
]

export const EDUCATION = {
  degree: 'National Engineering Degree in Computer Science – Software Engineering',
  school: 'ESPRIT, Tunis',
  dates: '2021 – 2026',
}
