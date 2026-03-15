import type { RecipeBundle } from '$lib/app/types';
import type { RecipeSource } from '$lib/app/models/recipes';
import type { MethodSnapshot } from '$lib/app/models/methods';
import type { WaterProfile, AcidType } from '$lib/engine/models/catalogTypes';
import { buildRecipeBundle } from '$lib/app/adapters/buildRecipeBundle';

// ── Method snapshots ────────────────────────────────────────────────────────
import { uedaKojiMethodSnapshot } from './library/methodSnapshots/uedaKojiMethod';
import { sokujoMotoMethodSnapshot } from './library/methodSnapshots/sokujoMotoMethod';
import { sandanMoromiMethodSnapshot } from './library/methodSnapshots/sandanMoromiMethod';

// ── Catalog items ───────────────────────────────────────────────────────────
import { ginjo1 } from '$lib/data/catalog/waterProfiles';
import { lacticAcid88 } from '$lib/data/catalog/acids';
import { availableSalts } from '$lib/data/catalog/salts';

// ── Lookup tables (would come from DB in production) ────────────────────────

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

// ── Public resolvers ────────────────────────────────────────────────────────

export function resolveMethodSnapshot(id: string): MethodSnapshot | null {
	return methodSnapshotById[id] ?? null;
}

export function resolveWaterProfile(id: string): WaterProfile | null {
	return waterProfileById[id] ?? null;
}

export function resolveAcid(id: string): AcidType | null {
	return acidById[id] ?? null;
}

/** Build a RecipeBundle from any RecipeSource (Recipe or RecipeSnapshot). */
export function resolveBundleFromSource(source: RecipeSource): RecipeBundle | null {
	const kojiMethod = methodSnapshotById[source.body.kojiMethodSnapshotId];
	const motoMethod = methodSnapshotById[source.body.motoMethodSnapshotId];
	const moromiMethod = methodSnapshotById[source.body.moromiMethodSnapshotId];
	if (!kojiMethod || !motoMethod || !moromiMethod) return null;

	const waterProfile = source.body.waterProfileId
		? (waterProfileById[source.body.waterProfileId] ?? null)
		: null;

	const defaultAcid = source.body.defaults?.recommendedAcidId
		? (acidById[source.body.defaults.recommendedAcidId] ?? lacticAcid88)
		: lacticAcid88;

	return buildRecipeBundle({
		recipe: source,
		kojiMethod,
		motoMethod,
		moromiMethod,
		waterProfile,
		availableSalts,
		defaultAcid,
		defaults: { targetKind: 'genshu_volume_L', targetValue: 6.7 }
	});
}
