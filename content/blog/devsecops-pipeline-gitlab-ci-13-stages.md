---
title: Anatomy of a 13-stage DevSecOps pipeline in GitLab CI
description: How I ordered build, SAST, SCA, secrets, Policy-as-Code, image scanning, signing, deployment and DAST in one GitLab pipeline, and why the order matters.
date: 2026-11-03
tags: [GitLab CI, DevSecOps, CI/CD]
---

For my final-year project at SFM Technologies I had to secure the delivery of a microservices application: six Spring Boot services (API gateway, Eureka, users, courses, exams, answers), an Angular frontend, and a 3-node DigitalOcean Kubernetes cluster at the end of the line.

The result was a GitLab pipeline with 13 stages and 32 jobs. This post walks through it stage by stage. The goal is not to list tools. It is to explain **where each check sits and why**, because the order of a security pipeline matters as much as the tools in it.

## The rule I used to order the stages

Every check needs some input, and those inputs only exist at certain points:

1. **Source code** exists from the first second. Scan it early: it is cheap and fast.
2. **Container images** only exist after `docker build`. Image scanning, SBOMs and signing go after that.
3. **A running application** only exists after deployment. Dynamic testing (DAST) has to go last.

Inside each group, cheap checks run before expensive ones, so a bad commit fails fast.

```yaml
stages:
  - build-shared        # shared Maven modules
  - build-all           # 6 services + Angular
  - test-unitaires      # JUnit / Jest + coverage
  - security-scan       # SAST, SCA, secrets
  - policy-check        # OPA / Conftest on k8s manifests
  - docker-build        # 7 hardened images
  - docker-scan         # Trivy, SBOM, Cosign
  - security-audit      # audit of the CI config itself
  - test-security       # extra code analysis
  - deploy-cloud        # kubectl / Helm / Argo CD
  - dast-scan           # OWASP ZAP
  - upload-defectdojo   # centralise every finding
  - ai-remediation      # AI agent for policy violations
```

## Stages 1 to 3: build and test

The backend depends on three shared Maven modules, so they are installed first in three parallel jobs. The six services are then built with a `parallel: matrix`, which creates one job per service from a single definition:

```yaml
build-all-backend:
  stage: build-all
  needs: [install-common-service, install-common-student, install-common-exam]
  parallel:
    matrix:
      - SERVICE: [answer-service, api-gateway-service, course-service,
                  exam-service, user-service, eureka-service]
  script:
    - cd backend/$SERVICE
    - mvn package -DskipTests $MAVEN_CLI_OPTS
```

Unit tests export JaCoCo (backend) and lcov (frontend) coverage reports as artifacts. The next stage needs them, because SonarQube cannot report coverage without them.

## Stage 4: SAST, SCA and secret detection

Three different questions, three tools:

- **SonarQube** (SAST): is my own code unsafe? One project per microservice, again through a matrix.
- **Trivy `fs` and `npm audit`** (SCA): do my dependencies have known CVEs? Only HIGH and CRITICAL are reported.
- **Gitleaks**: did anyone ever commit a secret?

One detail is easy to miss. The pipeline uses `GIT_DEPTH: "1"` globally for speed, but the Gitleaks job overrides it with `GIT_DEPTH: "0"`. A secret deleted three commits ago is still in the history, so a shallow clone would miss it. On this repository Gitleaks went through 420 commits.

## Stage 5: Policy-as-Code before anything is built

Kubernetes manifests are code too. Before building a single image, Conftest checks every YAML file in `k8s/` against Rego rules: resource limits are required, `runAsNonRoot` is required, privileged containers are forbidden. I wrote a separate post about this part, because it is the one that moved compliance from 38% to 100%.

## Stages 6 and 7: images, SBOMs and signatures

Each service has a `Dockerfile.secure`: a multi-stage build so Maven never reaches the final image, and a non-root user (UID 1001). The images are pushed to the GitLab Container Registry with two tags, `latest` and the commit SHA.

Then three jobs run in parallel on the built images:

- `container_scan`: Trivy scans every image for HIGH and CRITICAL CVEs.
- `generate-sbom`: Trivy produces a CycloneDX SBOM for each image.
- `sign-images`: Cosign signs each image after the scan.

## Stages 8 and 9: checking the pipeline itself

A pipeline that deploys to production is itself an attack surface. The `security-audit` stage uses the Plumber component to audit the `.gitlab-ci.yml` against CI security best practices and comment on merge requests. Stage 9 adds Qwiet AI preZero for a second code analysis on `main` and merge requests.

## Stages 10 to 13: deploy, attack, centralise, fix

- **deploy-cloud** applies the manifests and installs or upgrades Falco and kube-prometheus-stack with Helm. Argo CD keeps the cluster in sync with Git afterwards.
- **dast-scan** runs an OWASP ZAP baseline scan on the API gateway and the frontend, now that they are actually running.
- **upload-defectdojo** imports Gitleaks, Trivy, ZAP, SonarQube and Conftest results into DefectDojo through its API, so findings live in one place instead of fifteen job logs.
- **ai-remediation** sends policy violations to an AI agent, and a manual job simulates an attack to test the runtime detection loop.

## What I would change today

Many of these jobs end with `|| true` or `allow_failure: true`. During the project that kept the pipeline green while I added tools one by one, but it also means most checks **report** problems without **blocking** them. A pipeline is only a security control if it can say no. I explain how I would move from report-only to real gates in [a dedicated post](/blog/report-only-to-blocking-security-gates).

## Key takeaways

- Order stages by the input each check needs: source, then image, then running app.
- Use `needs:` and `parallel: matrix` so a 32-job pipeline stays readable and fast.
- Scan secrets on the full Git history, not a shallow clone.
- Treat Kubernetes manifests and the CI file itself as code to be checked.

The full pipeline, screenshots and architecture are on the [project page](/projects/devsecops-pfe).
