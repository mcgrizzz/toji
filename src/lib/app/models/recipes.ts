import type { WorkingCopy, Snapshot } from './versioning';
import type { AmendmentSpec } from '$lib/engine/models/templateTypes';

/**
 * @deprecated Compatibility DTO for the current bundle/fixture layer.
 * The server schema no longer stores three method snapshot IDs on a recipe.
 * Instead, recipes compose processes via RecipeProcessUse rows (see processes.ts).
 * Retained until the engine is migrated to process-native types.
 */
export type RecipeBody = {
	description?: string;
	kojiMethodSnapshotId: string;
	motoMethodSnapshotId: string;
	moromiMethodSnapshotId: string;
	waterProfileId?: string | null;
	amendments: AmendmentSpec[];
	defaults?: {
		recommendedRiceVariety?: string;
		recommendedPolishPct?: number;
		recommendedAcidId?: string;
		recommendedYeastProductId?: string;
	};
};

export type Recipe = WorkingCopy<RecipeBody>;
export type RecipeSnapshot = Snapshot<RecipeBody>;

/** Structural type satisfied by both Recipe and RecipeSnapshot. */
export type RecipeSource = {
	id: string;
	name: string;
	body: RecipeBody;
};
