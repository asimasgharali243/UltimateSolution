import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { createApp } from '../server.mjs';

test('shared Agent-Native action produces a tested patch and requires operator review', async () => {
  const { app, close } = createApp();
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = 'http://127.0.0.1:' + server.address().port;
  const post = (path, body = {}) => fetch(url + '/api/' + path, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  try {
    const created = await (await post('incidents', {
      service: 'checkout-api', logs: 'payment upstream ETIMEDOUT', demo: true
    })).json();
    const operator = 'incidents/' + created.id + '/';
    const agent = 'agent/' + operator;
    const proposal = await (await post(agent + 'investigate')).json();
    assert.match(proposal.diagnosis.repair.patch, /AbortSignal.timeout/);
    assert.equal((await post(operator + 'approve')).status, 409);
    assert.equal((await post(agent + 'verify')).status, 409);
    const response = await post(agent + 'run-repair');
    assert.equal(response.status, 200);
    const tested = await response.json();
    assert.equal(tested.status, 'Review', JSON.stringify(tested.execution));
    assert.equal(tested.execution.baseline.exitCode, 1);
    assert.equal(tested.execution.patched.exitCode, 0);
    assert.match(tested.execution.patched.output, /# pass 4/);
    assert.equal(tested.execution.repair.candidateHash, proposal.diagnosis.repair.candidateHash);
    assert.equal((await post(agent + 'approve')).status, 409);
    const approved = await (await post(operator + 'approve')).json();
    assert.equal(approved.status, 'Approved');
    assert.deepEqual(approved.timeline.map(event => event.actor), ['Operator', 'Agent', 'Agent', 'Operator']);
  } finally {
    await new Promise(resolve => server.close(resolve));
    close();
  }
});
