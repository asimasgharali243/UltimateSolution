import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requestAdvisory } from '../advisory.mjs';

const diagnosis = { title: 'Upstream timed out', evidence: ['ETIMEDOUT'] };

test('optional local model receives bounded evidence and returns structured advisory text', async () => {
  const advisory = await requestAdvisory(diagnosis, {
    model: 'local-model:1b',
    fetchImpl: async (url, options) => {
      assert.equal(url, 'http://127.0.0.1:11434/api/generate');
      assert.equal(options.redirect, 'error');
      const payload = JSON.parse(options.body);
      assert.deepEqual(JSON.parse(payload.prompt).evidence, ['ETIMEDOUT']);
      assert.equal(payload.stream, false);
      return Response.json({ response: JSON.stringify({ summary: 'Upstream timed out.', nextCheck: 'Inspect dependency latency.' }) });
    }
  });
  assert.equal(advisory.status, 'ready');
  assert.equal(advisory.nextCheck, 'Inspect dependency latency.');
});

test('malformed model output is discarded and missing configuration skips network', async () => {
  const unavailable = await requestAdvisory(diagnosis, {
    model: 'local-model', fetchImpl: async () => Response.json({ response: '{"approve":true}' })
  });
  assert.deepEqual(unavailable, { status: 'unavailable' });
  const skipped = await requestAdvisory(diagnosis, {
    model: '', fetchImpl: () => { throw new Error('Unexpected fetch'); }
  });
  assert.equal(skipped, undefined);
});
