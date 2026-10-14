---
type: llm
weight: 1
---

Regression for an over-escalation seen in live use. Route must be 'implement' and Risk must be 'low' or 'medium': a one-line subject change in an existing flow is reversible and has no sensitive impact. Questions about subject format or truncation must appear under Assumptions, NOT as blocking questions. Fail if Route is escalate or clarify, or if the response says engineer review is required before implementation.
