#!/usr/bin/env bash
# Usage: scripts/setup-branch-protection.sh <owner/repo>
# Requires gh authenticated with admin rights on the repo.
set -euo pipefail
repo="${1:?usage: $0 owner/repo}"
gh api -X PUT "repos/$repo/branches/main/protection" --input - <<JSON
{
  "required_status_checks": { "strict": true, "contexts": ["gate"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": 1, "dismiss_stale_reviews": true },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
echo "Branch protection enabled on $repo:main (PR + 1 approval + 'gate' check)."
