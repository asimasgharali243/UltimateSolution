import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { createTwoFilesPatch } from 'diff';

const exec = promisify(execFile);
const fixture = new URL('./fixtures/checkout/', import.meta.url);
const original = readFileSync(new URL('payment.mjs', fixture), 'utf8').replace(/\r\n/g, '\n');
const regression = readFileSync(new URL('regression.mjs', fixture), 'utf8');
const candidate = `export async function checkout(fetchPayment, signal) {
  signal?.throwIfAborted();
  const deadline = AbortSignal.timeout(40);
  const upstreamSignal = signal ? AbortSignal.any([signal, deadline]) : deadline;
  try {
    const payment = await fetchPayment({ signal: upstreamSignal });
    return { status: 200, payment };
  } catch (error) {
    if (signal?.aborted) throw signal.reason;
    if (deadline.aborted && error === deadline.reason) return { status: 503 };
    throw error;
  }
}
`;
const digest = value => createHash('sha256').update(value).digest('hex');
export const checkoutRepair = Object.freeze({
  id: 'checkout-timeout-v1',
  path: 'payment.mjs',
  baselineHash: digest(original),
  candidateHash: digest(candidate),
  patch: createTwoFilesPatch('a/payment.mjs', 'b/payment.mjs', original, candidate)
});

async function runTests(directory, source) {
  await writeFile(join(directory, 'payment.mjs'), source);
  const args = ['--permission', '--allow-fs-read=' + directory, join(directory, 'regression.mjs')];
  const scrub = output => output
    .replaceAll(pathToFileURL(directory).href, '[fixture]')
    .replaceAll(directory, '[fixture]')
    .replaceAll(JSON.stringify(directory).slice(1, -1), '[fixture]');
  try {
    const result = await exec(process.execPath, args, {
      cwd: directory, env: {}, timeout: 4000, maxBuffer: 32768, windowsHide: true
    });
    return { exitCode: 0, output: scrub(result.stdout) };
  } catch (error) {
    return { exitCode: Number.isInteger(error.code) ? error.code : null, output: scrub(error.stdout ?? '') };
  }
}

let activeRuns = 0;

export async function verifyCheckoutRepair() {
  if (activeRuns >= 2) throw Object.assign(new Error('Verification workers are busy. Retry shortly.'), { status: 429 });
  activeRuns++;
  let directory;
  try {
    directory = await mkdtemp(join(tmpdir(), 'guardian-repair-'));
    await writeFile(join(directory, 'regression.mjs'), regression);
    const baseline = await runTests(directory, original);
    const patched = await runTests(directory, candidate);
    const passed = baseline.exitCode === 1 &&
      /^not ok \d+ - slow payments return a controlled 503\r?$/m.test(baseline.output) &&
      patched.exitCode === 0 && /^# pass 4\r?$/m.test(patched.output);
    return { passed, repair: checkoutRepair, baseline, patched };
  } finally {
    activeRuns--;
    if (directory) await rm(directory, { recursive: true, force: true });
  }
}
