---
title: "Cutting GitLab CI time by 40%: caching, parallel matrices and the needs DAG"
description: The concrete GitLab CI techniques that made a 32-job DevSecOps pipeline 40% faster, with real snippets and the cache mistakes to avoid.
date: 2026-11-03
tags: [GitLab CI, CI/CD, Performance]
---

A security pipeline that takes too long gets skipped. If developers wait half an hour for feedback, they batch changes, merge without waiting, or ask for the scans to be removed.

My DevSecOps pipeline grew to 13 stages and 32 jobs: six Spring Boot services, an Angular frontend, seven Docker images, and around ten security tools. Caching and parallel scans reduced its total duration by about 40%. Here are the techniques, using the real configuration.

## 1. One job definition, six parallel jobs

Six microservices built one after the other is six times the wait. `parallel: matrix` creates one job per value from a single definition:

```yaml
build-all-backend:
  stage: build-all
  parallel:
    matrix:
      - SERVICE: [answer-service, api-gateway-service, course-service,
                  exam-service, user-service, eureka-service]
  script:
    - cd backend/$SERVICE
    - mvn package -DskipTests $MAVEN_CLI_OPTS
```

The same pattern is used for unit tests, SonarQube analysis, Trivy SCA and Docker builds. The stage takes as long as the slowest service instead of the sum of all six.

## 2. Use `needs:` to stop waiting for whole stages

By default, a job waits for **every** job of the previous stage. With `needs:`, it starts as soon as the jobs it actually depends on are done. The pipeline becomes a graph (a DAG) instead of a staircase:

```yaml
sca-scan-frontend:
  stage: security-scan
  needs: [install-frontend-deps]   # does not wait for backend builds or tests
```

The frontend dependency scan only needs `node_modules`, so it runs while the backend is still compiling.

## 3. Cache the Maven repository inside the project

Maven downloads hundreds of dependencies. GitLab can only cache paths inside the project directory, so the local repository is moved there:

```yaml
variables:
  MAVEN_CLI_OPTS: "-Dmaven.repo.local=$CI_PROJECT_DIR/.m2/repository --batch-mode"

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .m2/repository/
```

`--batch-mode` also removes the download progress logs, which makes the job output much shorter.

## 4. Install npm dependencies once: push and pull

Three frontend jobs need `node_modules`: build, tests and the npm audit. Instead of running `npm install` three times, one job installs and **pushes** the cache, and the others only **pull** it:

```yaml
install-frontend-deps:
  script:
    - cd frontend && npm install --legacy-peer-deps
  cache:
    key: npm-${CI_COMMIT_REF_SLUG}
    paths: [frontend/node_modules/]
    policy: push

build-frontend-app:
  needs: [install-frontend-deps]
  cache:
    key: npm-${CI_COMMIT_REF_SLUG}
    paths: [frontend/node_modules/]
    policy: pull
```

`policy: pull` also skips the cache upload at the end of each consumer job, which saves time on every run.

## 5. Share the Trivy database across jobs

Trivy downloads its vulnerability database before each scan. Three jobs use Trivy (filesystem SCA, image scan and SBOM generation), so they share one cache key:

```yaml
variables:
  TRIVY_CACHE_DIR: ".trivycache/"
cache:
  key: trivy-db-cache
  paths: [.trivycache/]
```

## 6. Shallow clones, except where history matters

`GIT_DEPTH: "1"` clones only the last commit, which is much faster on a repository with hundreds of commits. The secret detection job is the exception: it sets `GIT_DEPTH: "0"`, because a secret deleted in an old commit is still a leaked secret.

## Mistakes I would fix

- **Branch-based cache keys start cold.** `key: ${CI_COMMIT_REF_SLUG}` gives every new branch an empty cache. A key based on the lock file, such as `key: { files: [frontend/package-lock.json] }`, plus `fallback_keys` pointing to the default branch, reuses dependencies across branches and only rebuilds when they change.
- **`npm ci` instead of `npm install`.** It installs exactly what the lock file says, which is faster and reproducible. Caching npm's download cache (`~/.npm`) is also safer than caching `node_modules`.
- **Measure before optimising.** GitLab's pipeline view shows the duration of each job. The 40% came from attacking the longest jobs first, not from optimising everything.

## Key takeaways

- `parallel: matrix` and `needs:` give the biggest wins on multi-service repositories.
- Cache dependencies inside the project directory, and split producers (`push`) from consumers (`pull`).
- Share heavy caches, like the Trivy database, between jobs that need them.
- Key caches on lock files so new branches do not start from zero.

The full pipeline and its screenshots are on the [project page](/projects/devsecops-pfe).
