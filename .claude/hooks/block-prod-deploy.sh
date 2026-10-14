#!/usr/bin/env bash
# PreToolUse hook (matcher: Bash). Blocks Salesforce deploys that are not
# validate-only or not aimed at an allowlisted sandbox alias.
# Exit 2 = block and feed stderr back to Claude. Exit 0 = allow.
set -u

ALLOWED="${SF_ALLOWED_ORG_ALIASES:-sandbox,dev,staging,scratch}"
input="$(cat)"

if command -v jq >/dev/null 2>&1; then
  cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty')"
else
  cmd="$(printf '%s' "$input" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("tool_input",{}).get("command",""))')"
fi

# Only care about deploy-like commands.
if ! printf '%s' "$cmd" | grep -Eq '(sf|sfdx)[[:space:]]+(project[[:space:]]+deploy|force:(source|mdapi):deploy)|sf[[:space:]]+project[[:space:]]+deploy[[:space:]]+start'; then
  exit 0
fi

block() { echo "BLOCKED by block-prod-deploy hook: $1" >&2; exit 2; }

# Validate-only / dry-run is always safe.
if printf '%s' "$cmd" | grep -Eq 'deploy[[:space:]]+validate|--dry-run|--checkonly|-c[[:space:]]'; then
  exit 0
fi

org="$(printf '%s' "$cmd" | sed -nE 's/.*(--target-org|-o|--targetusername|-u)[ =]+([^ ]+).*/\2/p' | head -n1)"
[ -n "$org" ] || block "deploy has no explicit --target-org; default org may be production. Use --dry-run or specify an allowlisted sandbox alias ($ALLOWED)."

lower="$(printf '%s' "$org" | tr '[:upper:]' '[:lower:]')"
case "$lower" in *prod*|*production*|*live*) block "target org '$org' looks like production.";; esac

IFS=',' read -ra ok <<<"$ALLOWED"
for a in "${ok[@]}"; do [ "$lower" = "$a" ] && exit 0; done
block "target org '$org' is not in the sandbox allowlist ($ALLOWED)."
