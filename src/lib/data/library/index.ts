import type { RecipeBundle } from '$lib/app/types';
import type { RecipeSnapshot } from '$lib/app/models/recipes';
import type { MethodSnapshot } from '$lib/app/models/methods';
import { buildRecipeBundle } from '$lib/app/adapters/buildRecipeBundle';

// ── Snapshots ───────────────────────────────────────────────────────────────
import { sakuraGinjoSnapshot } from './recipeSnapshots/sakuraGinjoSnapshot';
import { uedaKojiMethodSnapshot } from './methodSnapshots/uedaKojiMethod';
import { sokujoMotoMethodSnapshot } from './methodSnapshots/sokujoMotoMethod';
import { sandanMoromiMethodSnapshot } from './methodSnapshots/sandanMoromiMethod';

// ── Catalog lookups ─────────────────────────────────────────────────────────
import { ginjo1 } from '$lib/data/catalog/waterProfiles';
import { lacticAcid88 } from '$lib/data/catalog/acids';
import { availableSalts } from '$lib/data/catalog/salts';
import type { WaterProfile, AcidType } from '$lib/engine/models/catalogTypes';

// ── Lookup tables (would come from DB in production) ────────────────────────

const recipeSnapshots: RecipeSnapshot[] = [sakuraGinjoSnapshot];

const methodSnapshotById: Record<string, MethodSnapshot> = {
	[uedaKojiMethodSnapshot.id]: uedaKojiMethodSnapshot,
	[sokujoMotoMethodSnapshot.id]: sokujoMotoMethodSnapshot,
	[sandanMoromiMethodSnapshot.id]: sandanMoromiMethodSnapshot
};

const waterProfileById: Record<string, WaterProfile> = {
	[ginjo1.id]: ginjo1
};

const acidById: Record<string, AcidType> = {
	[lacticAcid88.id]: lacticAcid88
};

// ── Public API ──────────────────────────────────────────────────────────────

/** All recipe snapshots available in the library. */
export function getRecipeSnapshots(): RecipeSnapshot[] {
	return recipeSnapshots;
}

/** Resolve a recipe snapshot (by id) into a fully-loaded RecipeBundle. */
export function resolveRecipeBundle(recipeSnapshotId: string): RecipeBundle | null {
	const recipe = recipeSnapshots.find((r) => r.id === recipeSnapshotId);
	if (!recipe) return null;

	const kojiMethod = methodSnapshotById[recipe.body.kojiMethodSnapshotId];
	const motoMethod = methodSnapshotById[recipe.body.motoMethodSnapshotId];
	const moromiMethod = methodSnapshotById[recipe.body.moromiMethodSnapshotId];
	if (!kojiMethod || !motoMethod || !moromiMethod) return null;

	const waterProfile = recipe.body.waterProfileId
		? (waterProfileById[recipe.body.waterProfileId] ?? null)
		: null;

	const defaultAcid = recipe.body.defaults?.recommendedAcidId
		? (acidById[recipe.body.defaults.recommendedAcidId] ?? lacticAcid88)
		: lacticAcid88;

	return buildRecipeBundle({
		recipe,
		kojiMethod,
		motoMethod,
		moromiMethod,
		waterProfile,
		availableSalts,
		defaultAcid,
		defaults: { targetKind: 'genshu_volume_L', targetValue: 6.7 }
	});
}
