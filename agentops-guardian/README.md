# AgentOps Guardian — Agent-Native Hackathon 2026

**Project:** Human-controlled software incident triage, patch proposal and approval.

This isolated hackathon branch is a staging branch. The complete source overlay and bootstrap scripts are provided in the attached `agentops-guardian-starter.zip` file in the ChatGPT conversation. A separate dedicated GitHub repository should be created after checking the generated framework template.

## Framework
Based on the official Agent-Native Chat template:
```bash
npx --yes @agent-native/core@latest create agentops-guardian-app --standalone --template chat
```
Node.js 22.22+ and pnpm required. Overlay the code from the ZIP onto the generated application, then run `pnpm install && pnpm dev`. Visit `/guardian`.

## Actions
- `create-incident`: persist owner-scoped sanitized logs and evidence-based diagnosis
- `list-incidents`: owner-scoped listing
- `get-incident`: owner-scoped detail
- `propose-fix`: optional OpenAI model-generated proposal; no code execution
- `review-incident`: human approve/reject records; never deploys automatically

## Deployment
Use the official Agent-Native guide: https://www.agent-native.com/docs/vercel/
Requires persistent PostgreSQL (e.g. Neon), `BETTER_AUTH_SECRET`, migration and Nitro Vercel build. Hosted deployment is **not yet completed or verified**.

## Entry
Official rules: https://www.builder.io/hackathon/rules
Deadline: Nov 9, 2026, 11:59 PM PT = Nov 10, 2026, 12:59 PM Pakistan time.
No registration required; actual entry needs public Clips demo plus official submission.

## Engineering honesty
Deterministic triage tests passed locally (4 tests). Framework integration, hosted deployment, complete security audit and real-world patch execution have not yet been tested. Never claim any proposed patch is automatically validated or deployed.

This branch does not modify your repository's default branch.