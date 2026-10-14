---
max_turns: 12
allowed_tools: [Read, Glob, Grep, Agent]
---

A business user submitted this change request. Use the change-request-triager agent to triage it
and reply with the triager's structured result only.

Repository context (the triage runs in an isolated folder, so this is stated rather than read):
the Salesforce source is in `force-app/`. It contains
`force-app/main/default/flows/Hot_Account_Follow_Up.flow-meta.xml`, an active record-triggered
flow on Account. When an Account's Rating becomes Hot it creates a Task whose Subject is the fixed
text "Follow up with new Hot account", with Priority High, assigned to the Account owner. A test
class `HotAccountFlowTest` already covers it.

Request: "In the Hot Account Follow Up flow, put the account name in the follow-up task subject."
