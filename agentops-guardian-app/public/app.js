const form = document.querySelector('#intake');
const queue = document.querySelector('#queue');
const detail = document.querySelector('#detail');
const notice = document.querySelector('#notice');
let incidents = [];
let selected;
let busy = false;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

async function request(path, body) {
  const response = await fetch('/api/' + path, body === undefined ? undefined : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  return result;
}

async function run(task) {
  if (busy) return;
  busy = true;
  notice.textContent = '';
  document.querySelectorAll('button').forEach(button => { button.disabled = true; });
  try {
    await task();
    incidents = await request('incidents');
  } catch (error) {
    notice.textContent = error.message;
    try { incidents = await request('incidents'); } catch { /* Preserve the last loaded view. */ }
  } finally {
    busy = false;
    document.querySelectorAll('button').forEach(button => { button.disabled = false; });
    render();
  }
}

function render() {
  queue.replaceChildren();
  if (!incidents.length) queue.append(element('p', 'No incidents yet.', 'muted'));
  for (const item of incidents) {
    const button = element('button', item.service + ' · ' + item.status, 'queue-item');
    button.setAttribute('aria-current', String(item.id === selected));
    button.onclick = () => { selected = item.id; render(); };
    queue.append(button);
  }
  const item = incidents.find(incident => incident.id === selected);
  detail.replaceChildren();
  if (!item) {
    detail.append(element('h2', 'Ready for triage'), element('p', 'Create an incident or load the sample log to try the workflow.', 'muted'));
    return;
  }
  detail.append(element('span', item.status, 'badge'), element('h2', item.service),
    element('h3', 'Captured logs'), element('pre', item.logs));
  if (item.diagnosis) {
    const { title, severity, evidence, proposal, checks } = item.diagnosis;
    detail.append(element('h3', 'Investigation · ' + severity), element('p', title));
    if (evidence.length) detail.append(element('pre', evidence.join('\n')));
    detail.append(element('h3', 'Proposed response'), element('p', proposal));
    if (checks) detail.append(list(checks, 'Regression checks to run in the affected service'));
  }
  if (item.verification) {
    detail.append(list(item.verification.map(check => (check.passed ? 'PASS · ' : 'FAIL · ') + check.label),
      'Runbook verification'));
  }
  const actions = {
    Open: [['investigate', 'Investigate']],
    Proposed: [['verify', 'Verify plan']],
    Review: [['approve', 'Approve plan'], ['reject', 'Reject plan']]
  };
  const buttons = element('div', '', 'buttons');
  for (const [action, label] of actions[item.status] ?? []) {
    const button = element('button', label);
    button.onclick = () => run(() => request('incidents/' + item.id + '/' + action, {}));
    buttons.append(button);
  }
  detail.append(buttons, list(item.timeline.map(event =>
    new Date(event.at).toLocaleString() + ' · ' + event.actor + ' · ' + event.detail), 'Audit timeline'));
}

function list(items, title) {
  const section = element('section');
  const ul = element('ul');
  ul.append(...items.map(item => element('li', item)));
  section.append(element('h3', title), ul);
  return section;
}

document.querySelector('#sample').onclick = () => {
  form.elements.service.value = 'checkout-api';
  form.elements.logs.value = 'ERROR checkout-api request_id=demo-137 upstream payments ETIMEDOUT after 3000ms';
  form.elements.service.focus();
};
form.onsubmit = event => {
  event.preventDefault();
  run(async () => {
    const incident = await request('incidents', Object.fromEntries(new FormData(form)));
    selected = incident.id;
    form.reset();
  });
};
await run(async () => {});
if (incidents.length) { selected = incidents[0].id; render(); }
