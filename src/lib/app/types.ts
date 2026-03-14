import type { LoadedPresets, MaterialsBill, RecipePlan } from '$lib/engine/models/planTypes';
import type { StoredRecipeTemplate } from '$lib/engine/models/templateTypes';
import type { WorkflowKind } from '$lib/engine/models/scheduleTypes';
import type { ScheduleTemplate } from '$lib/engine/models/scheduleTypes';
import type { ResolvedSchedule } from '$lib/engine/resolvers/resolveSchedules';
import type { PitchingResult } from '$lib/engine/resolvers/resolvePitching';
import type { YeastSelection } from '$lib/engine/models/yeastTypes';
import type { AcidType } from '$lib/engine/models/catalogTypes';

// ── Recipe bundle ───────────────────────────────────────────────────────────

export type RecipeBundle = {
	id: string;
	name: string;
	description?: string;
	template: StoredRecipeTemplate;
	presets: LoadedPresets;
	schedules: Partial<Record<WorkflowKind, ScheduleTemplate>>;
	defaultAcid: AcidType;
	defaults: {
		targetKind: 'genshu_volume_L' | 'total_rice_kg';
		targetValue: number;
	};
};

// ── Brew run orchestrator ───────────────────────────────────────────────────

export type BrewRunInput = {
	plan: RecipePlan;
	presets: LoadedPresets;
	schedules?: Partial<Record<WorkflowKind, ScheduleTemplate>>;
	workflowStartTimes?: Partial<Record<WorkflowKind, string>>;
	pitching?: {
		yeast: YeastSelection;
		pitchDate: string;
	};
};

export type BrewRunResult = {
	plan: RecipePlan;
	materials: MaterialsBill;
	pitching?: PitchingResult;
	schedules?: Partial<Record<WorkflowKind, ResolvedSchedule>>;
};
