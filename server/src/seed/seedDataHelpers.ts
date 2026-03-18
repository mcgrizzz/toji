/* eslint-disable @typescript-eslint/no-explicit-any */

export type SeedStep = {
  label: string;
  atH: number;
  durationH: number | undefined;
  goals: string[];
  checks: string[];
  actions: string[];
};

export function insertScheduleSteps(ctx: any, scheduleId: string, steps: SeedStep[]): void {
  let ord = 0;
  for (const step of steps) {
    ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId, ordinal: ord++, kind: { tag: 'milestone' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: step.label, description: undefined, durationH: step.durationH, note: undefined });
    for (const g of step.goals) {
      ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId, ordinal: ord++, kind: { tag: 'goal' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: g, description: g, durationH: undefined, note: undefined });
    }
    for (const c of step.checks) {
      ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId, ordinal: ord++, kind: { tag: 'check' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: c, description: c, durationH: undefined, note: undefined });
    }
    for (const a of step.actions) {
      ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId, ordinal: ord++, kind: { tag: 'action' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: a, description: a, durationH: undefined, note: undefined });
    }
  }
}
