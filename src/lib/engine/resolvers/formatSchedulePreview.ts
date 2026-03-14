import type { ScheduleStepTemplate } from '../models/scheduleTypes';

/** Format hours as a relative offset: 0 → "+0h", 26 → "+1d 2h", 338 → "+14d 2h" */
export function formatRelativeH(hours: number): string {
	const d = Math.floor(hours / 24);
	const h = Math.round(hours % 24);
	if (d === 0) return `+${h}h`;
	if (h === 0) return `+${d}d`;
	return `+${d}d ${h}h`;
}

export type SchedulePreviewStep = {
	key: string;
	label: string;
	offsetLabel: string;
	durationLabel: string | null;
	goals?: string[];
	notes?: string[];
	checks?: string[];
	actions?: string[];
};

/** Map schedule step templates to preview steps with relative offsets (no start time needed). */
export function buildSchedulePreview(steps: ScheduleStepTemplate[]): SchedulePreviewStep[] {
	return steps.map((step) => ({
		key: step.key,
		label: step.label,
		offsetLabel: formatRelativeH(step.atH),
		durationLabel: step.durationH != null ? formatRelativeH(step.durationH) : null,
		goals: step.goals?.map((g) => g.description),
		notes: step.notes,
		checks: step.checks?.map((c) => c.description),
		actions: step.actions?.map((a) => a.description)
	}));
}
