# Developer guide

## Working with the agent
- `/propose-change <text>`: triage -> branch -> implement -> review -> PR.
- `/deploy-sandbox`: validate then deploy the current branch to the sandbox.
- Subagents: `apex-reviewer` (read-only review), `change-request-triager`.

## Guardrails you will notice
- `block-prod-deploy.sh` rejects deploys that are not validate-only or not to an
  allowlisted alias (`SF_ALLOWED_ORG_ALIASES`, default `sandbox,dev,staging,scratch`).
- `apex-test-gate.sh` runs Apex tests after you edit `.cls`/`.trigger` files.

## Adding a guardrail
Add a script in `.claude/hooks/`, register it in `.claude/settings.json`, and add a case
in `tests/hooks/`. Exit code 2 blocks and returns stderr to the agent.

## Reviewing agent PRs
Check: tests assert behavior, bulk case present, no SOQL/DML in loops, sharing keywords,
no unrelated file changes.
