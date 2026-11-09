# AgentOps Guardian AI

Guardian connects incident evidence, a proposed code change, reproducible regression results, and a human decision in one local workspace.

## Run on Windows, macOS, or Linux

Use Node.js 22.22 or newer. From this directory:

```powershell
npm ci
npm run build
npm test
npm start
```

Open http://localhost:3000/guardian. Select **Load checkout demo**, **Create incident**, and **Run triage agent**. Inspect the diff and baseline/candidate transcripts before recording a decision. Set `PORT` to use another local port. No API key or paid service is needed.

See [DEMO.md](DEMO.md) for the competition recording sequence.

## Agent-Native and MCP

The dashboard and MCP transport invoke the same Builder Agent-Native action defined in `actions.mjs`, with the same schema and state transition implementation. The [vendored MIT action runtime](vendor/agent-native/README.md) is pinned to the verified upstream package. An MCP client can launch `node <absolute path to agent.mjs>` over stdio while the server runs. Pass the same `PORT` to the MCP process if you use a custom port. The agent can inspect the queue, triage, investigate, and verify. The agent transport cannot approve or reject proposals.

## Optional local AI

With a locally installed Ollama model already running, set `GUARDIAN_OLLAMA_MODEL` to its local model tag before starting Guardian. **Run triage agent** then requests an advisory summary and one diagnostic suggestion from Ollama on loopback. Use manually reviewed log excerpts. Model output is advisory and cannot control patch selection, regression results, or approval. Without a model, Guardian uses the runbook end to end.

## Verification and operating boundary

- The checkout repair targets the bundled fixture. Each run copies the same regression suite into a fresh temporary directory, runs it against the baseline and candidate, and removes the directory afterward.
- Each subprocess uses a stripped environment, filesystem read permissions limited to the fixture, a four-second timeout, and bounded output. Only bundled code runs. Treat the Node permission model as defense in depth for trusted fixtures.
- The gate requires the baseline to reproduce the named timeout regression and the candidate to pass all four checks. The dashboard shows the diff, result transcripts, and SHA-256 of the tested candidate.
- Other input uses deterministic runbooks for triage. Their verification checks evidence and plan consistency. The generated checklist describes tests to run in the affected service.
- SQLite persists incidents and the review timeline in the ignored `.guardian` directory. Back up the database before clearing local state. Use synthetic or manually redacted log excerpts.
- Guardian is a single-operator loopback application. Arbitrary repository patch execution, multi-user identity and authorization, and deployment are outside the local trust boundary. Approval records a decision and does not apply the patch.
