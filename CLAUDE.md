# agentic-salesforce-pipeline

Salesforce DX project with an AI-assisted, governed change pipeline. Claude proposes
changes; humans and CI approve and ship them.

## Hard rules
- NEVER deploy to production or any org not in the sandbox allowlist. A PreToolUse hook
  enforces this; do not try to work around it. Production deploys happen only in CI
  behind a GitHub Environment approval.
- Never commit secrets, auth URLs, or `.sfdx/` / `.sf/` contents.
- Work on a branch named `ai/<short-slug>`; never push to `main`.
- Every Apex class change needs a test class change in the same PR; target >= 85% coverage.

## Apex conventions
- `with sharing` by default; justify `without sharing` in a comment.
- Bulkify: no SOQL/DML inside loops; handle 200-record batches.
- One trigger per object, logic in a handler/service class.
- Tests use `@TestSetup` and assert behavior (no assertion-free tests).

## LWC conventions
- Prefer base Lightning components; no inline styles; follow SLDS.

## Workflow
1. Plan first for anything touching more than one component.
2. Implement, then run Apex tests locally.
3. Invoke the `apex-reviewer` subagent before opening a PR.
4. Open a PR using `.github/PULL_REQUEST_TEMPLATE.md`; CI validates and reviews it.

## Commands
- Validate (no deploy): `sf project deploy validate --source-dir force-app --target-org $SF_SANDBOX_ALIAS --test-level RunLocalTests`
- Run tests: `sf apex run test --test-level RunLocalTests --code-coverage --result-format human --target-org $SF_SANDBOX_ALIAS`
- E2E: `npx playwright test`
- Hook tests: `bash tests/hooks/test-block-prod-deploy.sh`

## Layout
- `force-app/` source, `.claude/` agents/commands/hooks, `.github/workflows/` CI,
  `docs/` governance and training material.
