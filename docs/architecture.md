# Architecture

## Goal
Let non-technical teams propose Salesforce changes in plain English while engineering
quality, security and approvals stay intact.

## Flow
```mermaid
flowchart TD
  U[Business user] -->|plain-English issue form| I[GitHub Issue: ai-change]
  I --> T[change-request-triager subagent]
  T -->|low risk| C[Claude Code headless: branch + code + tests]
  T -->|high risk| E[Engineer review queue]
  C --> R[apex-reviewer subagent + Apex tests]
  R --> PR[Pull Request]
  PR --> V[CI: validate-only deploy to sandbox]
  V --> H1{Human review + approval}
  H1 --> S[Deploy to staging]
  S --> P[Playwright E2E]
  P --> H2{Production approval}
  H2 --> PROD[Production]
```

## Components
| Layer | Implementation |
|---|---|
| Agent environment | `.claude/` (agents, commands, hooks, settings), `CLAUDE.md`, `.mcp.json` |
| Guardrails | PreToolUse hook blocks non-sandbox deploys; scoped `--allowedTools` in CI |
| CI/CD | `.github/workflows/` (GitHub Actions); `azure-devops/` equivalent |
| Testing | Apex unit tests (local), Playwright E2E (staging) |
| Governance | Branch protection, GitHub Environments with required reviewers |

## Trust boundaries
- The agent only ever sees sandbox credentials. Production auth lives in a CI secret
  scoped to the `production` environment.
- The agent can open PRs but cannot merge or deploy.

## Extending to other stacks
The same pattern (issue form -> triage -> branch/PR -> review -> gated deploy) applies to
.NET/C# (`dotnet test`, Azure App Service), React (`npm test`, Static Web Apps) and
WordPress (WP-CLI, staging site). Swap the validate/deploy/test commands in the
workflows and `CLAUDE.md`.
