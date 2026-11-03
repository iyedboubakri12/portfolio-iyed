---
title: "Policy-as-Code on Kubernetes: OPA Conftest in CI, Gatekeeper in the cluster"
description: How two layers of Rego policies took Kubernetes compliance from 38% to 100% on my DevSecOps project, and the gaps I found when I reviewed them.
date: 2026-11-03
tags: [Kubernetes, OPA, Policy-as-Code, DevSecOps]
---

When I first checked the Kubernetes manifests of my final-year project, only **38%** of them respected our basic security rules. Containers ran as root, several had no memory limits, and nothing stopped a privileged container from reaching the cluster.

By the end of the project the number was **100%**. No tool fixed the manifests for me. What changed was that the rules became code and were checked automatically. This post shows how, using OPA (Open Policy Agent) at two different points.

## Three rules, written in Rego

The rules came from the internal security standard of the company:

1. Every container must declare resource limits (protection against a pod eating the node).
2. Every container must set `runAsNonRoot: true`.
3. No container may run in privileged mode (a privileged container can escape to the host).

In Rego, each rule is a `deny` that produces a message when it matches:

```rego
package main

deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.resources.limits
  msg := sprintf("Container <%v> has no resource limits in %v",
                 [container.name, input.metadata.name])
}

deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  not container.securityContext.runAsNonRoot == true
  msg := sprintf("Container <%v> must set runAsNonRoot: true", [container.name])
}

deny contains msg if {
  input.kind == "Deployment"
  container := input.spec.template.spec.containers[_]
  container.securityContext.privileged == true
  msg := sprintf("Container <%v> is privileged. Rejected.", [container.name])
}
```

The messages in the repository are in French; I translated them here.

## Layer 1: Conftest in the pipeline

Conftest runs the Rego rules against plain YAML files. In GitLab CI it is one job, and it runs **before any image is built**:

```yaml
opa-gatekeeper-check:
  stage: policy-check
  image:
    name: openpolicyagent/conftest:latest
    entrypoint: [""]
  script:
    - conftest test k8s/*.yaml -p k8s/kubernetes.rego --output json > opa-report.json || true
```

The `|| true` means this job reports violations without blocking the pipeline. That was a deliberate choice while the manifests were being fixed, and I explain how to remove it safely in [this post on security gates](/blog/report-only-to-blocking-security-gates).

The JSON report goes to DefectDojo with the other findings, and it is also the input of the AI agent that proposes a corrected manifest.

This layer is about **feedback**. A developer learns that a manifest is wrong in the merge request, minutes after pushing, instead of discovering it in production.

## Layer 2: Gatekeeper at admission

CI only checks what goes through CI. Anyone with cluster access can still run `kubectl apply` by hand, and a Helm chart can create resources the pipeline never saw.

Gatekeeper closes that gap. It runs OPA as a Kubernetes **admission controller**, so the API server asks it before storing any object. The policy is defined in two parts. A `ConstraintTemplate` holds the Rego:

```yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredresources
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredResources
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredresources
        violation[{"msg": msg}] {
          container := input.review.object.spec.template.spec.containers[_]
          not container.resources.limits
          msg := sprintf("Container <%v> has no resource limits. Rejected.", [container.name])
        }
```

A `Constraint` then says where it applies:

```yaml
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredResources
metadata:
  name: enforce-ram-limits
spec:
  match:
    kinds:
      - apiGroups: ["apps"]
        kinds: ["Deployment"]
    excludedNamespaces: [monitoring, gatekeeper-system, kube-system, falco, logging]
```

Note the different input. Conftest reads the file directly (`input.spec...`). Gatekeeper receives an AdmissionReview, so the object is under `input.review.object`. Copying Rego from one to the other without adjusting the path is a classic mistake.

## Why both layers

| | Conftest (CI) | Gatekeeper (admission) |
|---|---|---|
| When | On every push | On every API request |
| Catches | Bad manifests in Git | Anything reaching the cluster, including `kubectl apply` |
| Feedback | In the merge request, early | Rejection at deploy time |
| Role | Developer guardrail | Last line of defence |

The CI layer makes compliance cheap. The admission layer makes it mandatory.

## Gaps I found when reviewing my own policies

Writing this post made me reread the policies critically. They worked for the demo, but they would not pass a serious review:

- **The two layers were not identical.** Conftest had three rules, but the Gatekeeper template only enforced limits and privileged mode. `runAsNonRoot` was only checked in CI, so it could be bypassed with `kubectl apply`. The fix is to keep one source of truth and generate both from it.
- **Only `Deployment` was checked.** A `StatefulSet`, `DaemonSet`, `Job` or bare `Pod` skipped every rule, and so did `initContainers`. Real policies should match on the pod spec wherever it appears.
- **Exclusions grow quietly.** The constraint excluded system namespaces, which is normal, but also an application namespace. Every exclusion should be documented and reviewed.

For the baseline rules, I would also enable Kubernetes **Pod Security Admission** at the `restricted` level on application namespaces. It is built into Kubernetes and covers root users, privilege escalation and host access without any custom Rego. OPA then stays for company-specific rules, such as the 512Mi memory ceiling from our standard.

## Key takeaways

- Write security rules once, in Rego, and check them automatically.
- Use Conftest in CI for fast feedback and Gatekeeper at admission for enforcement.
- Keep both layers in sync, and cover every workload type, not only Deployments.
- Start from Pod Security Admission and add OPA for what it does not cover.

See the policy results and screenshots on the [project page](/projects/devsecops-pfe).
