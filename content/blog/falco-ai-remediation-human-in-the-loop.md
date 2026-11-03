---
title: "From Falco alert to Slack fix in 20 seconds: AI remediation with a human in the loop"
description: Runtime detection with Falco, an AI agent grounded in internal security standards, and why the fix still waits for an engineer to click Approve.
date: 2026-11-03
tags: [Falco, Kubernetes, AI, Runtime Security]
---

Shift-left security catches problems before deployment. It cannot catch what happens **inside a running container**: a shell spawned in a pod, a process reading `/etc/shadow`, an unexpected outbound connection.

That is the job of runtime security. In my final-year project I connected Falco to an AI agent that explains each alert and proposes a fix in Slack. Analysing an alert used to take about 45 minutes of manual work. With the agent it takes around 20 seconds. The fix itself is never applied without a human, and this post explains why.

## The flow

1. **Falco** runs on every node and watches system calls through eBPF.
2. **Falcosidekick** receives Falco events and forwards them by webhook.
3. The **AI agent** (Python, Flask and Slack Bolt, running in the cluster) receives the alert.
4. It retrieves the relevant rules from the company's **security standards** (a RAG step).
5. It asks **Llama 3.3 70B through the Groq API** for an analysis and a corrected Kubernetes manifest.
6. **Slack** shows the result with two buttons: *Apply fix* and *View in DefectDojo*.
7. Only after an engineer approves does the agent patch the deployment and restart the pods.

## Installing Falco with an AI webhook

The deploy stage of the pipeline installs Falco with Helm and points Falcosidekick at the agent:

```bash
helm upgrade --install falco falcosecurity/falco -n falco --create-namespace \
  --set falcosidekick.enabled=true \
  --set falcosidekick.config.webhook.address="${FALCO_WEBHOOK_URL}" \
  --set falcosidekick.config.webhook.minimumpriority="notice" \
  --set falcosidekick.config.defectdojo.url="${DEFECTDOJO_URL}" \
  --set falcosidekick.config.defectdojo.token="${DEFECTDOJO_TOKEN}"
```

The same event goes to two places: the agent, for fast triage, and DefectDojo, so runtime findings sit next to the SAST, SCA and DAST findings from the pipeline.

## Testing it with a simulated attack

You cannot trust a detection you have never seen fire. The pipeline has a manual job that plays the attacker:

```yaml
test-falco-ai-alert:
  stage: ai-remediation
  image: dtzar/helm-kubectl:latest
  script:
    - POD_NAME=$(kubectl get pods -l app=frontend -o jsonpath='{.items[0].metadata.name}')
    - kubectl exec $POD_NAME -- cat /etc/shadow || true
  when: manual
```

Reading `/etc/shadow` is a classic credential-access behaviour, and Falco's default rules flag reads of sensitive files. A few seconds later, Slack shows a CRITICAL alert: the `cat` process ran as root in the frontend container, the internal rule it violates, and a corrected manifest.

## Why the AI is grounded in internal standards

A general-purpose model gives general-purpose advice. Our security standard is more specific. It says, for example, that containers must set `runAsNonRoot: true`, `readOnlyRootFilesystem: true` and `allowPrivilegeEscalation: false`, and that microservices are limited to 512Mi of memory.

Retrieving those rules and putting them in the prompt does two things. The fix follows **our** rules instead of a generic best practice, and the Slack message can name the exact rule that was violated, which makes the alert easier to trust and to audit.

## Why a human still clicks Approve

Applying the fix automatically would have looked more impressive in a demo. I chose not to, for three reasons:

- **Models make mistakes.** A wrong patch applied automatically to production is a new incident.
- **Some fixes break things.** Forcing a read-only filesystem on an app that writes to disk fixes the alert and takes the service down.
- **Accountability.** The Slack confirmation records who approved each change.

The AI removes the slow part, which is understanding the alert and writing the patch. The decision stays with an engineer.

## What I would harden next

The agent is a privileged component that reads attacker-influenced data, so it deserves its own threat model:

- **Treat alert content as untrusted input.** Fields like the command line come from the attacker. They could contain text written to manipulate the model (prompt injection). The agent should pass them as clearly delimited data and validate the model's output against a schema.
- **Least privilege.** The agent's service account should only be allowed to patch the specific resources it manages, never to create arbitrary objects.
- **Validate before applying.** Every proposed manifest should go through the same Conftest policies as the pipeline before the Approve button is even shown.
- **Deduplicate alerts.** One noisy pod should not produce a hundred Slack messages and a hundred API calls.
- **Prefer GitOps for fixes.** Instead of patching the cluster directly, the agent could open a merge request. Argo CD would then apply it, and Git would stay the source of truth.

## Key takeaways

- Runtime detection covers what shift-left cannot see. Test it with a real simulated attack.
- Grounding the model in your own standards makes its fixes specific and auditable.
- Use AI to speed up triage, and keep a human approval before anything changes in production.
- An AI agent with cluster access is an attack surface: restrict it and validate its output.

The full walkthrough, with screenshots of each step, is on the [project page](/projects/devsecops-pfe#demo).
