#!/usr/bin/env bash
# Verifies the block-prod-deploy hook allows/blocks the right commands.
cd "$(dirname "$0")/../.." || exit 1
hook=.claude/hooks/block-prod-deploy.sh
fail=0
t() { # expected_exit description command
  local want="$1" desc="$2" cmd="$3" got
  printf '{"tool_input":{"command":%s}}' "$(python3 -c 'import json,sys;print(json.dumps(sys.argv[1]))' "$cmd")" | bash "$hook" >/dev/null 2>&1
  got=$?
  if [ "$got" = "$want" ]; then echo "PASS $desc"; else echo "FAIL $desc (want $want got $got)"; fail=1; fi
}
t 0 "non-deploy command"            "ls -la"
t 0 "validate-only"                 "sf project deploy validate --source-dir force-app --target-org prod"
t 0 "dry-run"                       "sf project deploy start --dry-run --target-org prod"
t 0 "allowlisted sandbox"           "sf project deploy start --source-dir force-app --target-org sandbox"
t 2 "no target org"                 "sf project deploy start --source-dir force-app"
t 2 "prod alias"                    "sf project deploy start --target-org prod"
t 2 "production alias"              "sf project deploy start -o my-production"
t 2 "unknown alias"                 "sf project deploy start --target-org randomorg"
t 2 "legacy sfdx to prod"           "sfdx force:source:deploy -p force-app -u prod"
exit $fail
