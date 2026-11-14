import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createApp } from '../server.mjs';
import { advance, createIncident } from '../workflow.mjs';

const sample = { service: 'checkout', logs: 'ERROR upstream ETIMEDOUT api_key=sample-secret' };

test('unknown or conflicting signals request more evidence', () => {
  for (const logs of ['unknown event', 'ETIMEDOUT and HTTP 429']) {
    const item = advance(createIncident({ service: 'test', logs }), 'investigate');
    assert.equal(item.status, 'Needs evidence');
  }
});

test('modified proposals fail verification', () => {
  const item = advance(createIncident(sample), 'investigate');
  item.diagnosis.proposal = 'unexpected change';
  assert.equal(advance(item, 'verify').status, 'Verification failed');
});

test('HTTP workflow enforces transitions, validates input, and persists the audit trail', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'guardian-'));
  const database = join(dir, 'test.sqlite');
  const { app, close } = createApp(database);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = 'http://127.0.0.1:' + server.address().port;
  const post = (path, body, headers) => fetch(base + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body)
  });
  try {
    assert.match(await (await fetch(base + '/guardian')).text(), /Incident command center/);
    assert.equal((await post('/api/incidents', {})).status, 400);
    assert.equal((await post('/api/incidents', sample, { Origin: 'https://example.org' })).status, 403);
    const created = await post('/api/incidents', sample);
    assert.equal(created.status, 201);
    const item = await created.json();
    assert.doesNotMatch(item.logs, /sample-secret/);
    const path = '/api/incidents/' + item.id + '/';
    const agentPath = '/api/agent/incidents/' + item.id + '/';
    assert.equal((await post(path + 'approve', {})).status, 409);
    assert.equal((await (await post(agentPath + 'investigate', {})).json()).status, 'Proposed');
    assert.equal((await (await post(agentPath + 'verify', {})).json()).status, 'Review');
    assert.equal((await post(agentPath + 'approve', {})).status, 409);
    const decisions = await Promise.all([post(path + 'approve', {}), post(path + 'reject', {})]);
    assert.deepEqual(decisions.map(result => result.status).sort(), [200, 409]);
    const final = await (await fetch(base + '/api/incidents')).json();
    assert.deepEqual(final[0].timeline.map(event => event.actor), ['Operator', 'Agent', 'Agent', 'Operator']);
    const replica = createApp(database);
    const reader = replica.app.listen(0, '127.0.0.1');
    await once(reader, 'listening');
    try {
      const reopened = await fetch('http://127.0.0.1:' + reader.address().port + '/api/incidents');
      assert.deepEqual(await reopened.json(), final);
    } finally {
      await new Promise(resolve => reader.close(resolve));
      replica.close();
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
    close();
    await rm(dir, { recursive: true });
  }
});
