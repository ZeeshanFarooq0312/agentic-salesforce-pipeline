#!/usr/bin/env bash
# Create a scratch org from the Dev Hub and push source. Needs the sf CLI and a Dev Hub.
set -euo pipefail
alias="${1:-scratch}"
command -v sf >/dev/null || { echo "sf CLI not installed: npm install -g @salesforce/cli" >&2; exit 1; }
sf org create scratch --definition-file config/project-scratch-def.json --alias "$alias" --set-default --duration-days 7
sf project deploy start --source-dir force-app --target-org "$alias"
sf apex run test --test-level RunLocalTests --target-org "$alias" --wait 10
