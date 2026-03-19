/* eslint-disable @typescript-eslint/no-explicit-any */

export type SeedStep = {
  label: string;
  atH: number;
  durationH: number | undefined;
  goals: string[];
  checks: string[];
  actions: string[];
  sectionKey?: string;
  sectionLabel?: string;
};

export function insertTaskSpecSteps(ctx: any, processEntityId: string, steps: SeedStep[]): void {
  let ord = 0;
  for (const step of steps) {
    const sectionKey = step.sectionKey ?? step.label.toLowerCase().replace(/[\s/]+/g, '_');
    const sectionLabel = step.sectionLabel ?? step.label;

    // Milestone row
    ctx.db.TaskSpec.insert({
      id: ctx.newUuidV4().toString(),
      processEntityId,
      stageSpecId: undefined,
      stepSpecId: undefined,
      ordinal: ord++,
      key: `${sectionKey}_milestone`,
      label: step.label,
      taskKind: { tag: 'milestone' },
      sectionKey,
      sectionLabel,
      timingKind: { tag: 'absolute' },
      hoursFromStart: step.atH,
      anchorStageSpecId: undefined,
      offsetHours: undefined,
      durationH: step.durationH,
      description: undefined,
      captureActualOnComplete: false,
      notes: undefined,
    });

    // Goal rows
    for (const g of step.goals) {
      ctx.db.TaskSpec.insert({
        id: ctx.newUuidV4().toString(),
        processEntityId,
        stageSpecId: undefined,
        stepSpecId: undefined,
        ordinal: ord++,
        key: `${sectionKey}_goal_${ord}`,
        label: g,
        taskKind: { tag: 'goal' },
        sectionKey,
        sectionLabel,
        timingKind: { tag: 'absolute' },
        hoursFromStart: step.atH,
        anchorStageSpecId: undefined,
        offsetHours: undefined,
        durationH: undefined,
        description: g,
        captureActualOnComplete: false,
        notes: undefined,
      });
    }

    // Check rows
    for (const c of step.checks) {
      ctx.db.TaskSpec.insert({
        id: ctx.newUuidV4().toString(),
        processEntityId,
        stageSpecId: undefined,
        stepSpecId: undefined,
        ordinal: ord++,
        key: `${sectionKey}_check_${ord}`,
        label: c,
        taskKind: { tag: 'check' },
        sectionKey,
        sectionLabel,
        timingKind: { tag: 'absolute' },
        hoursFromStart: step.atH,
        anchorStageSpecId: undefined,
        offsetHours: undefined,
        durationH: undefined,
        description: c,
        captureActualOnComplete: false,
        notes: undefined,
      });
    }

    // Action rows
    for (const a of step.actions) {
      ctx.db.TaskSpec.insert({
        id: ctx.newUuidV4().toString(),
        processEntityId,
        stageSpecId: undefined,
        stepSpecId: undefined,
        ordinal: ord++,
        key: `${sectionKey}_action_${ord}`,
        label: a,
        taskKind: { tag: 'action' },
        sectionKey,
        sectionLabel,
        timingKind: { tag: 'absolute' },
        hoursFromStart: step.atH,
        anchorStageSpecId: undefined,
        offsetHours: undefined,
        durationH: undefined,
        description: a,
        captureActualOnComplete: false,
        notes: undefined,
      });
    }
  }
}
