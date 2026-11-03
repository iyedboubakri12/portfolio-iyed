---
title: "Report-only vs blocking: turning DevSecOps scans into real security gates"
description: An honest look at the "|| true" in my own pipeline, and a progressive plan to make SonarQube, Trivy, Gitleaks and Conftest actually stop bad changes.
date: 2026-11-03
tags: [DevSecOps, GitLab CI, Security Gates]
---

My DevSecOps pipeline has 13 stages and runs SonarQube, Trivy, Gitleaks, Conftest, OWASP ZAP and more. When I reread it after the project, I noticed something uncomfortable: **most of those checks could not fail the pipeline.**

```yaml
- gitleaks detect --source . --redact --report-path gl-secret-report.sarif || true
- trivy image --severity HIGH,CRITICAL ... $IMAGE || true
- conftest test k8s/*.yaml -p k8s/kubernetes.rego --output json > opa-report.json || true
```

`|| true` turns any failure into success. On top of that, most security jobs also had `allow_failure: true`. The findings were real and were all sent to DefectDojo, but a commit with a leaked secret or a CRITICAL CVE would still have been deployed.

This is very common, and I think it is worth explaining why it happens and how to get out of it.

## Why pipelines end up report-only

I did not write `|| true` because I did not care. I wrote it because:

- **I was adding tools one at a time.** A new scanner with 200 existing findings would block every commit, including the ones adding the next tool.
- **Some tools needed infrastructure that was sometimes down.** The SonarQube server ran on a VM. If it was off, the pipeline should not block.
- **False positives.** A scanner that cries wolf trains people to ignore it.

All three are good reasons to start in report-only mode. They are not good reasons to stay there.

## A progressive plan: report, warn, block

The idea is to tighten one tool at a time, and to start with the checks that have **no backlog and no false positives**.

### Step 1: secrets, block immediately

A secret in Git is never acceptable, and Gitleaks findings are usually easy to confirm. If old findings exist, put them in a baseline once, then block anything new:

```yaml
secret-detection:
  script:
    - gitleaks detect --source . --redact --baseline-path .gitleaks-baseline.json
      --report-format sarif --report-path gl-secret-report.sarif
```

No `|| true`. A new secret fails the job. The leaked secret must also be rotated, because removing it from Git does not un-leak it.

### Step 2: policies, block on manifests

Conftest returns a non-zero exit code when a `deny` rule matches. Removing `|| true` is enough. Since the manifests were already at 100% compliance, this costs nothing and prevents regressions.

To keep the JSON report for DefectDojo even when the job fails, the artifacts need `when: always`, which the job already had.

### Step 3: images, block on fixable CRITICAL vulnerabilities

Blocking on every HIGH CVE of a base image would stop all work. Blocking on CRITICAL vulnerabilities **that have a fix available** is reasonable, because the team can always act on them:

```bash
trivy image --exit-code 1 --severity CRITICAL --ignore-unfixed "$IMAGE"
```

Accepted risks go in a `.trivyignore` file with a comment and a review date, so exceptions are visible in code review instead of hidden behind `|| true`.

### Step 4: SonarQube, wait for the quality gate

By default the Maven scanner uploads results and exits. Adding `-Dsonar.qualitygate.wait=true` makes the job wait for the quality gate and fail if it is red. Configure the gate on **new code only**, so legacy debt does not block today's changes.

### Step 5: distinguish "tool down" from "finding"

`allow_failure: true` hides both problems. GitLab can allow failure only for specific exit codes:

```yaml
sonarqube-backend:
  script:
    - ./run-sonar.sh   # exits 3 if the server is unreachable, 1 if the gate fails
  allow_failure:
    exit_codes: [3]
```

An unreachable server shows a warning. A failed quality gate blocks the merge request.

### Step 6: DAST, warn in merge requests, block on main

A baseline ZAP scan is useful but noisier. I would report it on merge requests and only block releases on high-risk alerts, after tuning the rules with a ZAP configuration file.

## Measure it

Two numbers tell you whether the gates work:

- **How many pipelines did each gate block?** Zero for months might mean it is too permissive.
- **How long do exceptions live?** An ignore file that only grows is a backlog, not a policy.

## Key takeaways

- Report-only mode is a valid start, but it is not a control.
- Tighten one gate at a time: secrets, then policies, then fixable CRITICAL CVEs, then quality gates.
- Replace `|| true` with explicit, reviewed exceptions: baselines, `.trivyignore`, quality gates on new code.
- Use `allow_failure: exit_codes` to separate infrastructure problems from real findings.

I would rather show this retrospective than pretend my first pipeline was perfect. The full pipeline is on the [project page](/projects/devsecops-pfe).
