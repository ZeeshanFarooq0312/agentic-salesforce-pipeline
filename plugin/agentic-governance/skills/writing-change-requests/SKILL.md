---
name: writing-change-requests
description: How to turn a business idea into a request engineering can act on. Use when a non-technical user is proposing a change, or when triaging one.
---
# Writing a good change request

A request is ready when someone who has never met you could implement and test it.

1. **Outcome, not solution.** "Sales reps should see which accounts are high value at a glance"
   beats "add a column".
2. **One change per request.** Split "and also" into a second request.
3. **A concrete example.** "An account with revenue $12M should show as Hot."
4. **Who is affected** (team, role, object) and **where** (page, report, process).
5. **What must not change.** Existing behavior that people rely on.
6. **Why now.** The business value or deadline.

## What happens to your request
Every change gets an engineer's review in the pull request. That is normal and not a delay.
Separately, the assistant sorts requests into three routes:

| Route | When | What happens |
|---|---|---|
| **Implement** | Reversible, small, no sensitive impact (wording, a threshold, a flow tweak, a new field) | Drafted automatically; any choices it made are listed as assumptions in the PR |
| **Clarify** | The outcome is unclear, or two readings would give different work | It asks only the questions it truly cannot guess |
| **Escalate** | Permissions, sharing, deletion, integrations, production data, security settings | Not automated; goes to an engineer |

## Anti-patterns
- "Make it better / faster / nicer" with no measurable target.
- Several unrelated changes in one request.
- Pasting credentials or customer data into the request. Never do this.
