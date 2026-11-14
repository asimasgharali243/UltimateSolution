import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';
import { transitionIncident, createIncident } from './workflow.mjs';
import { actionInput, incidentAction } from './actions.mjs';

export function createApp(database = ':memory:') {
  const db = new DatabaseSync(database);
  db.exec('PRAGMA busy_timeout = 5000; CREATE TABLE IF NOT EXISTS incidents (id TEXT PRIMARY KEY, body TEXT NOT NULL)');
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.get('host') ?? '')) {
      return res.status(403).json({ error: 'Use the local address.' });
    }
    res.set({
      'Content-Security-Policy': "default-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'",
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    });
    if (req.method === 'POST' && (req.get('sec-fetch-site') === 'cross-site' ||
        (req.get('origin') && req.get('origin') !== 'http://' + req.get('host')))) {
      return res.status(403).json({ error: 'Cross-origin write rejected.' });
    }
    next();
  });
  app.use(express.json({ limit: '64kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/incidents', (_req, res) => res.json(
    db.prepare('SELECT body FROM incidents ORDER BY rowid DESC').all().map(row => JSON.parse(row.body))
  ));
  app.post('/api/incidents', (req, res) => {
    const incident = createIncident(req.body);
    db.prepare('INSERT INTO incidents VALUES (?, ?)').run(incident.id, JSON.stringify(incident));
    res.status(201).json(incident);
  });
  app.post(['/api/incidents/:id/:action', '/api/agent/incidents/:id/:action'], async (req, res) => {
    if (!req.is('application/json')) return res.status(415).json({ error: 'JSON required.' });
    const { id, action } = req.params;
    const row = db.prepare('SELECT body FROM incidents WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Incident not found.' });
    const actor = req.path.startsWith('/api/agent/') ? 'Agent' : 'Operator';
    const transition = (_id, verb) => transitionIncident(JSON.parse(row.body), verb, actor);
    const isDecision = action === 'approve' || action === 'reject';
    const incident = isDecision
      ? await transition(id, action)
      : await incidentAction(transition).run(actionInput.parse({ id, action }));
    const result = db.prepare('UPDATE incidents SET body = ? WHERE id = ? AND body = ?')
      .run(JSON.stringify(incident), id, row.body);
    if (!result.changes) return res.status(409).json({ error: 'Incident changed. Refresh and retry.' });
    res.json(incident);
  });
  app.get('/', (_req, res) => res.redirect('/guardian'));
  app.get('/guardian', (_req, res) => res.sendFile(fileURLToPath(new URL('./public/index.html', import.meta.url))));
  app.use(express.static(fileURLToPath(new URL('./public', import.meta.url))));
  app.use((err, _req, res, _next) => {
    const status = err instanceof ZodError ? 400 : err.status ?? 500;
    res.status(status).json({ error: status >= 500 ? 'Internal server error.' :
      status === 400 ? 'Invalid request. Check required fields, lengths, and JSON syntax.' : err.message });
  });
  return { app, close: () => db.close() };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const database = fileURLToPath(new URL('./.guardian/incidents.sqlite', import.meta.url));
  mkdirSync(dirname(database), { recursive: true });
  const port = Number(process.env.PORT ?? 3000);
  createApp(database).app.listen(port, '127.0.0.1', () => {
    console.log('AgentOps Guardian AI → http://127.0.0.1:' + port + '/guardian');
  });
}

