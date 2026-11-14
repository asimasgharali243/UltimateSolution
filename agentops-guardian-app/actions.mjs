import { defineAction } from './vendor/agent-native/action.js';
import { z } from 'zod';

export const actionInput = z.object({ id: z.uuid(), action: z.enum(['investigate', 'verify', 'run-repair', 'triage']) });

export function incidentAction(transition) {
  return defineAction({
    description: 'Investigate an incident, verify its runbook, or test the bundled checkout repair.',
    schema: actionInput,
    run: ({ id, action }) => transition(id, action)
  });
}
