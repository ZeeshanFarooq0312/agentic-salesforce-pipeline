# Governance and approvals

## Roles
| Role | Can do |
|---|---|
| Business user | File a change request issue; review the preview |
| Engineer | Review/approve PRs, handle high-risk requests |
| Release approver | Approve the `production` environment deployment |

## Controls
1. **Branch protection on `main`**: PR required, 1+ approving review, status checks
   (`validate`, `hook-tests`) required, no force-push.
2. **Environments**: `ai-change` (reviewer gate before Claude runs), `staging`,
   `production` (required reviewers, secrets scoped here only).
3. **Agent guardrails**: deploy hook (Salesforce and Azure CLI), deny rules in `.claude/settings.json`,
   least-privilege `--allowedTools` in workflows.
4. **Risk routing**: requests touching permissions, sharing, deletion, integrations or
   production data are never auto-implemented; they go to an engineer.
5. **Auditability**: every change is an issue -> PR -> deployment with a reviewer name.

## Rollback
Revert the merge commit and redeploy through the same pipeline; for urgent cases,
deploy the previous tagged release to production via the approval gate.
