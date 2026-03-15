import type { RecipeBundle } from '$lib/app/types';
import type { RecipeSnapshot } from '$lib/app/models/recipes';
import type { MethodSnapshot } from '$lib/app/models/methods';
import type { LibraryRecipeEntry } from '$lib/app/models/library';
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

// ── Helpers ─────────────────────────────────────────────────────────────────

function compareSnapshotVersions(a: string, b: string): number {
	const pa = a.split('.').map(Number);
	const pb = b.split('.').map(Number);
	for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
		const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
		if (diff !== 0) return diff;
	}
	return 0;
}

/** All public snapshots for a given sourceId, sorted newest-first by version. */
export function getPublicRecipeSnapshotsBySourceId(sourceId: string): RecipeSnapshot[] {
	return recipeSnapshots
		.filter((s) => s.sourceId === sourceId && s.isPublic)
		.sort((a, b) => compareSnapshotVersions(b.version, a.version));
}

/** The latest public snapshot for a given sourceId, or null if none exist. */
export function getLatestPublicRecipeSnapshot(sourceId: string): RecipeSnapshot | null {
	const snapshots = getPublicRecipeSnapshotsBySourceId(sourceId);
	return snapshots.length > 0 ? snapshots[0] : null;
}

// ── Internal ────────────────────────────────────────────────────────────────

/** All recipe snapshots available in the library. */
export function getRecipeSnapshots(): RecipeSnapshot[] {
	return recipeSnapshots;
}

/** Resolve a recipe snapshot (by id) into a fully-loaded RecipeBundle. */
export function resolveRecipeBundle(recipeSnapshotId: string): RecipeBundle | null {
	const recipe = recipeSnapshots.find((r) => r.id === recipeSnapshotId);
	if (!recipe) return null;
	return buildBundleFromSnapshot(recipe);
}

// ── Public API ──────────────────────────────────────────────────────────────

/** Stable library entries grouped by sourceId (public snapshots only). */
export function getLibraryRecipeEntries(): LibraryRecipeEntry[] {
	const bySourceId = new Map<string, RecipeSnapshot>();
	for (const snap of recipeSnapshots) {
		if (!snap.isPublic) continue;
		const existing = bySourceId.get(snap.sourceId);
		if (!existing || compareSnapshotVersions(snap.version, existing.version) > 0) {
			bySourceId.set(snap.sourceId, snap);
		}
	}
	return Array.from(bySourceId.values()).map((snap) => ({
		id: snap.sourceId,
		name: snap.name,
		description: snap.body.description,
		latestSnapshotId: snap.id,
		version: snap.version
	}));
}

/** Resolve the latest public snapshot for a sourceId into a RecipeBundle. */
export function resolveRecipeBundleBySourceId(sourceId: string): RecipeBundle | null {
	const snapshot = getLatestPublicRecipeSnapshot(sourceId);
	if (!snapshot) return null;
	return buildBundleFromSnapshot(snapshot);
}

// ── Bundle builder ──────────────────────────────────────────────────────────

function buildBundleFromSnapshot(recipe: RecipeSnapshot): RecipeBundle | null {
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
