#!/usr/bin/env bash
# PostToolUse hook (matcher: Edit|Write|MultiEdit). After an Apex file changes,
# run the local test suite. Exit 2 on failure so Claude sees and fixes it.
set -u
input="$(cat)"
if command -v jq >/dev/null 2>&1; then
  f="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')"
else
  f="$(printf '%s' "$input" | python3 -c 'import sys,json;print(json.load(sys.stdin).get("tool_input",{}).get("file_path",""))')"
fi
case "$f" in *.cls|*.trigger) ;; *) exit 0;; esac

if ! command -v sf >/dev/null 2>&1; then
  echo "apex-test-gate: 'sf' CLI not installed; skipping Apex tests." >&2
  exit 0
fi
org="${SF_SANDBOX_ALIAS:-scratch}"
out="$(sf apex run test --test-level RunLocalTests --result-format human --wait 10 --target-org "$org" 2>&1)" || {
  echo "Apex tests failed after editing $f:" >&2
  echo "$out" | tail -n 40 >&2
  exit 2
}
exit 0
