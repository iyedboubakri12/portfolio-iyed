---
title: "Software supply chain security in practice: Cosign signatures and CycloneDX SBOMs"
description: How I signed seven container images with Cosign and generated CycloneDX SBOMs with Trivy in GitLab CI, and what I would do differently to make it enforceable.
date: 2026-11-03
tags: [Supply Chain, Cosign, SBOM, Docker]
---

Scanning an image tells you what is wrong with it today. It does not tell you two other things:

1. **Is the image running in my cluster the one my pipeline built?**
2. **What exactly is inside it,** so that when the next Log4Shell appears I can answer "are we affected?" in minutes?

Signatures answer the first question and SBOMs answer the second. In my DevSecOps project I added both for the seven images of the application. Here is how it works and where my first version fell short.

## Where it sits in the pipeline

After the `docker-build` stage pushes the images to the GitLab Container Registry, three jobs run in the `docker-scan` stage:

- `container_scan`: Trivy scans each image for HIGH and CRITICAL CVEs.
- `generate-sbom`: Trivy writes a CycloneDX SBOM for each image.
- `sign-images`: Cosign signs each image. It declares `needs: [container_scan]`, so an image is only signed after it was scanned.

## Generating SBOMs with Trivy

Trivy can do more than scan. With `--format cyclonedx`, it lists every OS package and every library it finds in the image, with versions, in a standard format:

```bash
for service in eureka-service course-service api-gateway-service \
               user-service exam-service answer-service frontend; do
  trivy image \
    --username gitlab-ci-token --password "$CI_JOB_TOKEN" \
    --format cyclonedx \
    --output "reports/${service}-sbom.json" \
    "$REGISTRY/$service:latest"
done
```

CycloneDX is an OWASP standard, so the files can be loaded into tools such as Dependency-Track, or simply searched with `jq` when a new CVE is published.

The job also shares the Trivy vulnerability database cache with the scan job (`key: trivy-db-cache`), so the database is downloaded once per pipeline instead of once per job.

## Signing with Cosign

Cosign is part of the Sigstore project. A signature is stored in the registry next to the image, so no extra infrastructure is needed:

```yaml
sign-images:
  stage: docker-scan
  image:
    name: sigstore/cosign:v2.2.4
    entrypoint: [""]
  needs: [docker-build-backend, docker-build-frontend, container_scan]
  script:
    - echo "$CI_JOB_TOKEN" | cosign login registry.gitlab.com -u gitlab-ci-token --password-stdin
    - |
      for service in user-service exam-service answer-service course-service \
                     api-gateway-service eureka-service frontend; do
        cosign sign --key env://COSIGN_PRIVATE_KEY --tlog-upload=false --yes \
          "registry.gitlab.com/devsecopsi-group/devsecops-project/$service:latest"
      done
```

Two choices are worth explaining:

- **`--key env://COSIGN_PRIVATE_KEY`**: key-based signing. The private key is a masked CI/CD variable and the public key is used to verify. The alternative, keyless signing, uses the CI job's OIDC identity and avoids managing a key at all.
- **`--tlog-upload=false`**: the signature is not recorded in Rekor, Sigstore's public transparency log. This avoids publishing metadata about a private project, but you lose the public, tamper-evident record of when each signature was made.

Anyone with the public key can then check an image:

```bash
cosign verify --key cosign.pub --insecure-ignore-tlog=true \
  registry.gitlab.com/devsecopsi-group/devsecops-project/frontend:latest
```

## What was missing

The images were signed and the SBOMs were generated. Looking back, the setup produced evidence but did not enforce anything yet. These are the changes I would make:

**1. Sign the digest, not the tag.** Tags are mutable: `latest` can point to a different image tomorrow. Cosign itself warns when you sign by tag. The pipeline already pushes a `$CI_COMMIT_SHA` tag; the right move is to resolve the digest after the push and sign `image@sha256:...`.

**2. Verify at admission.** A signature nobody checks is decoration. The cluster should refuse unsigned images, using Sigstore's policy-controller or a Kyverno `verifyImages` rule. That is the step that actually answers question 1.

**3. Attach the SBOM to the image.** The SBOMs were job artifacts that expired after one week. With `cosign attest --type cyclonedx`, the SBOM becomes a signed attestation stored with the image in the registry, available as long as the image exists.

**4. Sign only what passed.** The scan job uses `|| true`, so a vulnerable image is still scanned "successfully" and then signed. A signature should mean "this image passed our checks". That requires the scan to fail on CRITICAL findings first.

## Key takeaways

- An SBOM is cheap to produce with Trivy and saves hours during the next big CVE.
- Sign images in CI, sign by digest, and verify signatures at admission.
- Store SBOMs as signed attestations next to the image, not as temporary artifacts.
- A signature is only meaningful if it is produced after checks that can fail.

The Cosign verification screenshot and the rest of the pipeline are on the [project page](/projects/devsecops-pfe).
