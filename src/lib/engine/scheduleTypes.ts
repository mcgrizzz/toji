// ── Schedule types (future: workflow/process scheduling layer) ────────────────
// These are separate from material-addition presets (MoromiAdditionSpec).
// Odori belongs here as a schedule phase, not in MoromiPreset.stages.

import type { ObservationPromptSpec } from './observationTypes';

export type WorkflowRef =
	| { kind: 'koji' }
	| { kind: 'moto' }
	| { kind: 'moromi' };

export type GoalSpec = { description: string };
export type CheckSpec = { description: string };
export type ActionSpec = { description: string };

export type ScheduleStepTemplate = {
	key: string;
	label: string;
	/** Hours from workflow start */
	atH: number;
	durationH?: number;
	notes?: string[];
	goals?: GoalSpec[];
	checks?: CheckSpec[];
	actions?: ActionSpec[];
	/** Which observation fields to prompt for at this step */
	observationPrompt?: ObservationPromptSpec;
};

export type ScheduleTemplate = {
	name: string;
	workflow: WorkflowRef;
	steps: ScheduleStepTemplate[];
};
