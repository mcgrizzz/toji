import type { ScheduleTemplate } from '../models/scheduleTypes';
import type { ObservationPromptSpec } from '../models/observationTypes';
import type { MaterialsBill } from '../models/planTypes';

export type ResolvedStep = {
	key: string;
	label: string;
	/** Absolute start time (ISO 8601) */
	startAt: string;
	/** Absolute end time, if step has duration */
	endAt?: string;
	notes?: string[];
	goals?: string[];
	checks?: string[];
	actions?: string[];
	/** Which observation fields to prompt for at this step */
	observationPrompt?: ObservationPromptSpec;
};

export type ResolvedSchedule = {
	name: string;
	workflow: 'koji' | 'moto' | 'moromi';
	steps: ResolvedStep[];
};

/** Resolve a schedule template into concrete steps with timestamps */
export function resolveSchedule(
	template: ScheduleTemplate,
	workflowStartTime: string,
	_bill: MaterialsBill
): ResolvedSchedule {
	const startMs = new Date(workflowStartTime).getTime();
	const msPerHour = 3_600_000;

	const steps: ResolvedStep[] = template.steps.map((step) => {
		const resolved: ResolvedStep = {
			key: step.key,
			label: step.label,
			startAt: new Date(startMs + step.atH * msPerHour).toISOString()
		};

		if (step.durationH != null) {
			resolved.endAt = new Date(startMs + step.atH * msPerHour + step.durationH * msPerHour).toISOString();
		}

		if (step.notes) resolved.notes = step.notes;
		if (step.goals) resolved.goals = step.goals.map((g) => g.description);
		if (step.checks) resolved.checks = step.checks.map((c) => c.description);
		if (step.actions) resolved.actions = step.actions.map((a) => a.description);
		if (step.observationPrompt) resolved.observationPrompt = step.observationPrompt;

		return resolved;
	});

	return {
		name: template.name,
		workflow: template.workflow.kind,
		steps
	};
}
