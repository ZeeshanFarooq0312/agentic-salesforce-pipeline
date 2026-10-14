---
description: Propose a Salesforce change in plain English (for non-technical users)
argument-hint: <describe the change you want>
---
A business user wants this change: $ARGUMENTS

Follow this process exactly:

1. Use the `change-request-triager` subagent to produce a structured request. Show it to the user and ask for confirmation. Stop here if it lists open questions.
2. If Risk is high or Needs engineer review is yes, do NOT implement. Open a GitHub issue using the change-request template and tell the user an engineer will pick it up.
3. Otherwise create a branch `ai/<short-slug>`, implement the change with matching tests, and run the Apex tests.
4. Run the `apex-reviewer` subagent on the result and fix blockers.
5. Open a pull request using the PR template. Never merge it and never deploy; CI and a human approval gate handle that.
6. Reply in plain language: what changed, how to preview it, and what happens next.
