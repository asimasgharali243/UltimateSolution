# AgentOps Guardian AI

A local incident response console with a persistent queue, evidence-based diagnosis, remediation plans, and human review.

## Run

Requires Node.js 22.22 or newer. From this directory run:

```powershell
npm ci
npm test
npm run build
npm start
```

Open http://127.0.0.1:3000/guardian. Load the sample, create an incident, investigate, verify the plan, and record a review decision. Data is stored in the ignored .guardian directory. Set PORT to use a different local port.

## Agent access

An MCP client can launch `node <absolute path to agent.mjs>` over stdio while the dashboard is running. Pass the same PORT to both processes if using a custom port. The agent can list incidents, investigate, and verify through the same workflow as the dashboard. Approval and rejection are available in the operator surface.

## Scope

This local demo uses deterministic runbooks for timeout, rate limit, and dependency failures. Verification checks the evidence and plan against the runbook. The proposed regression tests are instructions for the affected service. Guardian does not execute those tests, edit repositories, or deploy changes. Use synthetic or manually redacted logs. Automatic redaction covers common patterns and is not a substitute for reviewing the input. The loopback server assumes a trusted local machine and does not provide multi-user authentication.
