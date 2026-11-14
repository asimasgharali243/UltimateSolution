# AgentOps Guardian AI demo

**Pitch:** An incident response agent that shows why its fix should work before anyone approves it.

## Recording sequence

1. Open the running dashboard at http://localhost:3000/guardian. Click **Load checkout demo** and **Create incident**. Explain that the scenario is an upstream checkout failure in a bundled service fixture.
2. Click **Investigate**. Point to the timeout evidence and the proposed diff. The patch adds a request deadline while preserving caller cancellation and the healthy path.
3. Click **Run regression tests**. Expand the baseline transcript and point out the reproduced failure. Expand the candidate transcript and show the four passing tests and candidate hash.
4. Click **Approve proposal**. Show the audit trail and explain that this records the human decision. No deployment is performed.
5. Create a second demo incident and click **Run triage agent** to show the combined investigation and verification action. An MCP client can run the same action. The operator retains approval.

## Submission description

AgentOps Guardian turns an incident log into an evidence-linked repair proposal. In the checkout scenario, it tests the original and proposed code against the same suite, shows the diff and test transcripts, and keeps the approval decision with the operator. Builder's Agent-Native action definition is shared by the dashboard and the MCP agent surface. The local demo runs without paid services or an API key.

## Submission checklist

- Record a public Clips demo and verify its sharing link in a signed-out session.
- Use the tested GitHub branch as the source link.
- Submit the project details and public Clips link through the official Builder.io hackathon page.
