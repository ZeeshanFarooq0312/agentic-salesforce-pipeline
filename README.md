# agentic-salesforce-pipeline

An AI-assisted, governed development pipeline for Salesforce (pattern extends to
.NET, React, WordPress and Azure). Business users propose changes in plain English;
Claude Code drafts them; engineers and CI gate what ships.

## What is here
| Piece | Where |
|---|---|
| Project rules for the agent | [CLAUDE.md](CLAUDE.md) |
| Hooks (guardrails) | [.claude/hooks/](.claude/hooks/) |
| Subagents | [.claude/agents/](.claude/agents/) |
| Slash commands | [.claude/commands/](.claude/commands/) |
| MCP servers | [.mcp.json](.mcp.json) |
| Headless CI workflows | [.github/workflows/](.github/workflows/) |
| E2E tests | [tests/e2e/](tests/e2e/) |
| Docs | [docs/](docs/) |

See [docs/architecture.md](docs/architecture.md) for the flow diagram.

## Try it
```bash
bash tests/hooks/test-block-prod-deploy.sh   # prove the deploy guardrail works
```
