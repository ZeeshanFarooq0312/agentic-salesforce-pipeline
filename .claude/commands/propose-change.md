---
description: Propose a change in plain English (for non-technical users)
argument-hint: <describe the change you want>
---
A business user wants this change: $ARGUMENTS

Follow this process exactly:

1. Use the `change-request-triager` subagent to produce a structured request. Show it to the user and ask for confirmation. Stop here if it lists open questions.
2. If Risk is high or Needs engineer review is yes, do NOT implement. Open a GitHub issue using the change-request template and tell the user an engineer will pick it up.
3. Otherwise create a branch `ai/<short-slug>` and implement the change with matching tests, then run the checks for the stack you touched:
   - `force-app/`: Apex tests (`sf apex run test`)
   - `apps/react-web`: `cd apps/react-web && npm install && npm test && npm run build`
   - `apps/dotnet-api`: `dotnet test apps/dotnet-api/tests/Api.Tests`
   - `apps/wordpress-plugin`: `php -l <files>` and `php apps/wordpress-plugin/tests/rating-test.php`
4. Review the result: `apex-reviewer` for `force-app/`, `code-reviewer` for everything else. Fix blockers.
5. If you changed rating thresholds anywhere, change all three stacks together (see CLAUDE.md).
6. Open a pull request using the PR template. Never merge it and never deploy; CI and a human approval gate handle that.
7. Reply in plain language: what changed, how to preview it, and what happens next.
