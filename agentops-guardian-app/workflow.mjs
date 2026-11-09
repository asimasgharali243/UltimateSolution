import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { checkoutRepair, verifyCheckoutRepair } from './repair.mjs';
import { requestAdvisory } from './advisory.mjs';

export const intake = z.object({
  service: z.string().trim().min(1).max(80),
  logs: z.string().trim().min(1).max(12000),
  demo: z.boolean().optional()
}).strict();
export const operation = z.enum(['investigate', 'verify', 'run-repair', 'approve', 'reject']);
const rules = [
  {
    id: 'upstream-timeout', pattern: /ETIMEDOUT|upstream.{0,40}timeout|gateway timeout/i,
    title: 'Upstream request timed out', severity: 'High',
    proposal: 'Add a bounded request deadline and return a controlled 503 when the upstream exceeds it. Review retry safety before enabling retries.',
    checks: ['Delayed upstream returns a controlled 503', 'Healthy upstream still succeeds', 'Caller cancellation releases the pending request']
  },
  {
    id: 'rate-limit', pattern: /\b429\b|rate.limit/i,
    title: 'Upstream rate limit reached', severity: 'Medium',
    proposal: 'Honor Retry-After and cap retries for idempotent calls. Surface quota exhaustion to operators.',
    checks: ['Retry-After is respected', 'Retry count is bounded', 'Non-idempotent calls are not retried']
  },
  {
    id: 'database-unavailable', pattern: /ECONNREFUSED|connection pool exhausted/i,
    title: 'Dependency connection failed', severity: 'High',
    proposal: 'Check dependency readiness and connection limits. Return a controlled error while the dependency recovers.',
    checks: ['Unavailable dependency yields a controlled error', 'Health recovers after reconnect', 'Connection pool size remains bounded']
  }
];

function record(incident, status, actor, detail) {
  return { ...incident, status, timeline: [...incident.timeline, {
    status, actor, detail, at: new Date().toISOString()
  }] };
}

export function createIncident(input) {
  const { service, logs, demo } = intake.parse(input);
  const safeLogs = logs
    .replace(/\b(?:Bearer|Basic)\s+[^\s,;]+/gi, '[REDACTED AUTHORIZATION]')
    .replace(/\b(token|password|secret|api[_-]?key)\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi, '$1=[REDACTED]')
    .replace(/([a-z][a-z0-9+.-]*:\/\/)[^\s/@]+@/gi, '$1[REDACTED]@');
  return record({ id: randomUUID(), service, logs: safeLogs, demo: demo === true, timeline: [] },
    'Open', 'Operator', 'Incident captured');
}

export function advance(incident, action, actor = 'Operator') {
  operation.parse(action);
  if (action === 'investigate' && incident.status === 'Open') {
    const matches = rules.map(rule => ({
      rule, evidence: incident.logs.split(/\r?\n/).find(line => rule.pattern.test(line))
    })).filter(match => match.evidence);
    if (matches.length !== 1) {
      return record({ ...incident, diagnosis: {
        title: 'More evidence needed', severity: 'Unknown',
        evidence: matches.map(match => match.evidence),
        proposal: 'Collect a correlated trace, dependency health, and recent deployment changes.'
      } }, 'Needs evidence', actor, 'Investigation stopped without a supported diagnosis');
    }
    const { rule, evidence } = matches[0];
    return record({ ...incident, diagnosis: {
      id: rule.id, title: rule.title, severity: rule.severity,
      repair: incident.demo && rule.id === 'upstream-timeout' ? checkoutRepair : undefined,
      evidence: [evidence], proposal: rule.proposal, checks: rule.checks
    } }, 'Proposed', actor, 'Rule matched and a remediation plan was drafted');
  }
  if (action === 'verify' && incident.status === 'Proposed' && !incident.diagnosis.repair) {
    const { diagnosis } = incident;
    const rule = rules.find(candidate => candidate.id === diagnosis.id);
    const checks = [
      { label: 'Evidence matches the diagnosed failure', passed: !!rule && diagnosis.evidence.every(line =>
        incident.logs.split(/\r?\n/).includes(line) && rule.pattern.test(line)) && diagnosis.evidence.length > 0 },
      { label: 'Proposal includes the expected regression checks', passed: !!rule &&
        JSON.stringify(rule.checks) === JSON.stringify(diagnosis.checks) && rule.proposal === diagnosis.proposal }
    ];
    return record({ ...incident, verification: checks },
      checks.every(check => check.passed) ? 'Review' : 'Verification failed', actor,
      'Checked evidence and plan integrity against the runbook');
  }
  if (['approve', 'reject'].includes(action) && actor === 'Operator' && incident.status === 'Review') {
    return record(incident, action === 'approve' ? 'Approved' : 'Rejected', actor,
      'Recorded human decision on the plan');
  }
  throw Object.assign(new Error('This action is unavailable in the current incident state.'), { status: 409 });
}

export async function transitionIncident(incident, action, actor) {
  if (action === 'triage') {
    const proposed = advance(incident, 'investigate', 'Agent');
    const advisory = await requestAdvisory(proposed.diagnosis);
    const triaged = advisory ? { ...proposed, advisory } : proposed;
    return triaged.diagnosis.repair
      ? transitionIncident(triaged, 'run-repair', 'Agent')
      : triaged;
  }
  if (action !== 'run-repair') return advance(incident, action, actor);
  if (incident.status !== 'Proposed' || !incident.demo ||
      incident.diagnosis?.id !== 'upstream-timeout' ||
      incident.diagnosis.repair?.candidateHash !== checkoutRepair.candidateHash) {
    throw Object.assign(new Error('A matching checkout repair proposal is required.'), { status: 409 });
  }
  const execution = await verifyCheckoutRepair();
  return record({ ...incident, execution }, execution.passed ? 'Review' : 'Verification failed',
    actor, execution.passed ? 'Baseline reproduced the failure and the candidate passed all four tests' :
      'Repair verification did not meet the evidence gate');
}