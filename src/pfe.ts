import { IMG } from './data'

export type Stage = {
  n: number
  id: string
  label: string
  group: 'build' | 'security' | 'supply' | 'deploy' | 'runtime'
  tools: string
  what: string
  evidence?: string
}

// Mirrors the stages of .gitlab-ci.yml in the PFE repository.
export const STAGES: Stage[] = [
  { n: 1, id: 'build-shared', label: 'Build shared', group: 'build', tools: 'Maven', what: 'Builds the three shared Maven modules used by every microservice.' },
  { n: 2, id: 'build-all', label: 'Build all', group: 'build', tools: 'Maven, npm', what: 'Compiles the Spring Boot services and the Angular frontend.', evidence: '01-gitlab-pipeline-part1' },
  { n: 3, id: 'test-unitaires', label: 'Unit tests', group: 'build', tools: 'JUnit, Jest, JaCoCo', what: 'Runs backend and frontend tests and exports coverage for SonarQube.' },
  { n: 4, id: 'security-scan', label: 'SAST · SCA · Secrets', group: 'security', tools: 'SonarQube, Trivy fs, npm audit, Gitleaks', what: 'Static analysis per microservice (parallel matrix), dependency scanning and secret detection over the whole Git history.', evidence: '04-sonarqube-sast' },
  { n: 5, id: 'policy-check', label: 'Policy-as-Code', group: 'security', tools: 'OPA / Conftest (Rego)', what: 'Every Kubernetes manifest is checked: resource limits required, runAsNonRoot required, privileged containers forbidden.', evidence: '07-opa-conftest-results' },
  { n: 6, id: 'docker-build', label: 'Docker build', group: 'supply', tools: 'Docker', what: 'Builds 7 hardened images (non-root UID 1001) and pushes them to the GitLab Container Registry.', evidence: '02-gitlab-pipeline-part2' },
  { n: 7, id: 'docker-scan', label: 'Scan · SBOM · Sign', group: 'supply', tools: 'Trivy, CycloneDX, Cosign', what: 'Scans every image for HIGH/CRITICAL CVEs, generates a CycloneDX SBOM and signs the image with Cosign.', evidence: '08-cosign-signature-verify' },
  { n: 8, id: 'security-audit', label: 'Pipeline audit', group: 'security', tools: 'Plumber', what: 'Audits the CI configuration itself against pipeline-security best practices.' },
  { n: 9, id: 'test-security', label: 'Extra code analysis', group: 'security', tools: 'Qwiet AI preZero', what: 'Additional code-property-graph analysis on main and merge requests.' },
  { n: 10, id: 'deploy-cloud', label: 'Deploy to DOKS', group: 'deploy', tools: 'kubectl, Helm, Argo CD', what: 'Applies the manifests, installs or updates Falco and kube-prometheus-stack. Argo CD keeps the cluster in sync with Git.', evidence: '11-argocd-synced-healthy' },
  { n: 11, id: 'dast-scan', label: 'DAST', group: 'security', tools: 'OWASP ZAP', what: 'Baseline scan of the API Gateway and the frontend once they are deployed.', evidence: '20-owasp-zap-dast' },
  { n: 12, id: 'upload-defectdojo', label: 'DefectDojo import', group: 'security', tools: 'DefectDojo API v2', what: 'Imports Gitleaks, Trivy, ZAP, SonarQube and OPA results into a single place.', evidence: '19-defectdojo-dashboard' },
  { n: 13, id: 'ai-remediation', label: 'AI remediation', group: 'runtime', tools: 'Python, Groq (Llama 3.3 70B), Slack', what: 'Sends policy violations to the AI agent. A manual job simulates an attack to test the runtime loop.', evidence: '17-slack-ai-proposed-fix' },
]

export type DemoStep = {
  title: string
  actor: string
  text: string
  img: string
  log?: string[]
}

// Each step is a real screenshot from the PFE environment.
export const DEMO: DemoStep[] = [
  {
    title: 'An attacker reads /etc/shadow inside the frontend pod',
    actor: 'Attack simulation',
    text: 'The manual CI job test-falco-ai-alert (or an engineer) runs cat /etc/shadow inside a running frontend container. This is a classic credential-access behaviour.',
    img: `${IMG}/14-attack-simulation-etc-shadow.webp`,
    log: ['$ kubectl exec -it $(kubectl get pods -l app=frontend ...) -- cat /etc/shadow', 'root:*:0:::::', 'bin:!::0:::::', '...'],
  },
  {
    title: 'Falco detects the syscall and Falcosidekick routes it',
    actor: 'Falco (eBPF) → Falcosidekick',
    text: 'Falco matches the read of a sensitive file and emits an event. Falcosidekick forwards it by webhook to the AI agent and to DefectDojo.',
    img: `${IMG}/13-falcosidekick-dashboard.webp`,
  },
  {
    title: 'The AI agent receives the alert',
    actor: 'AI agent (Python, Flask + Slack Bolt)',
    text: 'The agent receives the Falco payload, retrieves the matching rules from the internal security standards (RAG) and calls Llama 3.3 70B through the Groq API.',
    img: `${IMG}/15-ai-agent-receives-falco-alert.webp`,
    log: ['[INFO] Agent IA SFM prêt (Mode Serveur).', '[INFO] Bolt app is running!', '[INFO] Alerte Falco reçue !', '[INFO] Analyse en cours via Groq (Llama-3.3-70B)...'],
  },
  {
    title: 'Slack: severity, analysis and violated rule',
    actor: 'Slack · #alerts-devsecops',
    text: 'The engineer gets a structured message: CRITICAL severity, what happened (process cat launched as root in the frontend container), and the internal rule that was violated.',
    img: `${IMG}/16-slack-ai-analysis.webp`,
  },
  {
    title: 'Slack: a proposed fix, waiting for a human',
    actor: 'Slack · human in the loop',
    text: 'The agent proposes corrected Kubernetes YAML with two buttons: "Apply fix" and "View in DefectDojo". Nothing changes in the cluster until an engineer decides.',
    img: `${IMG}/17-slack-ai-proposed-fix.webp`,
  },
  {
    title: 'Approved: the patch is applied and the pods restart',
    actor: 'AI agent → Kubernetes',
    text: 'After approval, the bot confirms who validated the fix, updates the deployment and restarts the non-compliant pods.',
    img: `${IMG}/18-slack-remediation-applied.webp`,
  },
]

export const GALLERY = [
  { file: '01-gitlab-pipeline-part1', caption: 'GitLab pipeline: 32 jobs, passed (part 1)' },
  { file: '02-gitlab-pipeline-part2', caption: 'Policy check, Docker build, scan/SBOM/sign, audit' },
  { file: '03-gitlab-pipeline-part3', caption: 'Pipeline audit, Qwiet, deploy to DOKS, DAST' },
  { file: '04-sonarqube-sast', caption: 'SonarQube: quality gate per microservice' },
  { file: '05-trivy-sca-report', caption: 'Trivy: vulnerable dependencies (HIGH)' },
  { file: '06-gitleaks-secret-detection', caption: 'Gitleaks: 420 commits scanned' },
  { file: '07-opa-conftest-results', caption: 'Conftest: OPA violation on the frontend' },
  { file: '08-cosign-signature-verify', caption: 'Cosign: image signature verified' },
  { file: '09-kubectl-pods-doks', caption: 'All pods running on DOKS, including the AI agent' },
  { file: '10-eduboard-app-on-doks', caption: 'EduBoard application served from the cluster' },
  { file: '11-argocd-synced-healthy', caption: 'Argo CD: Synced and Healthy, auto-sync enabled' },
  { file: '21-grafana-cluster-resources', caption: 'Grafana: cluster CPU and memory per namespace' },
  { file: '22-prometheus-targets', caption: 'Prometheus: ServiceMonitor targets up' },
  { file: '19-defectdojo-dashboard', caption: 'DefectDojo: centralised findings' },
  { file: '20-owasp-zap-dast', caption: 'OWASP ZAP baseline report' },
]
