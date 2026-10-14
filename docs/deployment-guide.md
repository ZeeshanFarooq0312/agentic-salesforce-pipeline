# Deployment guide

## One-time setup
1. Create a Dev Hub (or use a sandbox) and authenticate: `sf org login web --alias sandbox`.
2. Get its auth URL: `sf org display --target-org sandbox --verbose` and store as
   GitHub secret `SF_SANDBOX_AUTH_URL`. Repeat for `SF_STAGING_AUTH_URL`, `SF_PROD_AUTH_URL`.
3. Add secret `ANTHROPIC_API_KEY` and `SF_STAGING_URL` (for Playwright).
4. Create GitHub Environments `ai-change`, `staging`, `production`; add required reviewers.
5. Enable branch protection on `main`.

## Day to day
| Event | What runs |
|---|---|
| Issue labeled `ai-change` | Claude implements on a branch and opens a PR |
| PR opened/updated | Claude review + validate-only deploy to sandbox |
| Merge to `main` | Deploy to staging, then E2E, then production after approval |

## Local development
```bash
bash scripts/setup-scratch-org.sh
sf apex run test --test-level RunLocalTests --target-org scratch
npm install && npx playwright test
bash tests/hooks/test-block-prod-deploy.sh
```
