import type { WorkingCopy, Snapshot } from './versioning';
import type { AmendmentSpec } from '$lib/engine/models/templateTypes';

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
