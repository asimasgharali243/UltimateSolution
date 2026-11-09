import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkout } from './payment.mjs';

function unavailable({ signal }) {
  return new Promise((_resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('ETIMEDOUT')), 160);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

test('slow payments return a controlled 503', async () => {
  assert.deepEqual(await checkout(unavailable), { status: 503 });
});

test('healthy payments still succeed', async () => {
  assert.deepEqual(await checkout(async () => 'paid'), { status: 200, payment: 'paid' });
});

test('caller cancellation propagates to the payment dependency', async () => {
  const controller = new AbortController();
  const pending = checkout(unavailable, controller.signal);
  controller.abort(new Error('Caller cancelled'));
  await assert.rejects(pending, /Caller cancelled/);
});

test('pre-cancelled requests skip the dependency', async () => {
  const controller = new AbortController();
  controller.abort(new Error('Caller cancelled'));
  let calls = 0;
  await assert.rejects(checkout(async () => { calls++; }, controller.signal), /Caller cancelled/);
  assert.equal(calls, 0);
});
