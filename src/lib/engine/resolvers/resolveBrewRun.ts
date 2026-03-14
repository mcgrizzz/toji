// Future: BrewRun / Session layer
// Real timestamps, active workflow tracking, and schedule drift belong in a
// separate BrewRun/Session concept that wraps a resolved plan. The plan layer
// is timeless — it defines materials and previews workflow structure. When a
// user starts an actual brew, a session is created from the plan, and only then
// are schedules resolved with concrete start times via resolveSchedule().

import type { BrewRunInput, BrewRunResult } from '$lib/app/types';
import type { WorkflowKind } from '$lib/engine/models/scheduleTypes';
import type { ResolvedSchedule } from './resolveSchedules';
import { resolvePlan } from './resolvePlan';
import { resolvePitching } from './resolvePitching';
import { resolveSchedule } from './resolveSchedules';

export function resolveBrewRun(input: BrewRunInput): BrewRunResult {
	const materials = resolvePlan(input.plan, input.presets);

	// Pitching (optional)
	let pitching: BrewRunResult['pitching'];
	if (input.pitching) {
		const motoWaterL = materials.moto.waterL;
		const moromiWaterL = materials.moromi.reduce((sum, s) => sum + s.waterL, 0);
		const totalMoromiVolumeL = motoWaterL + moromiWaterL;

		pitching = resolvePitching({
			totalMoromiVolumeL,
			targetPitchRateMPerMl: input.presets.motoPreset.yeastPitchRateMPerMl,
			yeast: input.pitching.yeast,
			pitchDate: input.pitching.pitchDate
		});
	}

	// Schedules (optional — resolve each template that has a matching start time)
	let schedules: Partial<Record<WorkflowKind, ResolvedSchedule>> | undefined;
	if (input.schedules && input.workflowStartTimes) {
		const resolved: Partial<Record<WorkflowKind, ResolvedSchedule>> = {};
		for (const [kind, template] of Object.entries(input.schedules)) {
			const startTime = input.workflowStartTimes[kind as WorkflowKind];
			if (template && startTime) {
				resolved[kind as WorkflowKind] = resolveSchedule(template, startTime);
			}
		}
		if (Object.keys(resolved).length > 0) {
			schedules = resolved;
		}
	}

	return {
		plan: input.plan,
		materials,
		pitching,
		schedules
	};
}
