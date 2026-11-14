import test from 'node:test';
import assert from 'node:assert/strict';
import {triage,redactSecrets,staticPatchChecks} from '../lib/diagnosis.ts';
test('null reference rule',()=>{const r=triage("TypeError: Cannot read properties of undefined (reading 'name')");assert.equal(r.category,'Null reference');assert.equal(r.severity,'high')});
test('unknown evidence low confidence',()=>assert.equal(triage('unknown application state').confidence,'low'));
test('redacts credentials',()=>{assert.match(redactSecrets('Authorization: Bearer abcdefghijklmnop'),/REDACTED/);assert.doesNotMatch(redactSecrets('password=supersecret123'),/supersecret123/)});
test('static check is not code execution',()=>{const r=staticPatchChecks("console.log('ok')");assert.equal(r.testsExecuted,0);assert.equal(r.level,'static_text_review_only');assert.equal(staticPatchChecks('eval(userInput)').passed,false)});