// ── Schedule types (future: workflow/process scheduling layer) ────────────────
// These are separate from material-addition presets (MoromiAdditionSpec).
// Odori belongs here as a schedule phase, not in MoromiPreset.stages.

export type WorkflowKind = 'koji' | 'moto' | 'moromi';

export type WorkflowRef = { kind: WorkflowKind };

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
};

export type ScheduleTemplate = {
	name: string;
	workflow: WorkflowRef;
	steps: ScheduleStepTemplate[];
};
