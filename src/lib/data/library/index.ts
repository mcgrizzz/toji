import type { RecipeBundle } from '$lib/app/types';
import type { RecipeSnapshot } from '$lib/app/models/recipes';
import type { LibraryRecipeEntry } from '$lib/app/models/library';
import { resolveBundleFromSource } from '$lib/data/lookups';

// ── Snapshots ───────────────────────────────────────────────────────────────
import { sakuraGinjoSnapshot } from './recipeSnapshots/sakuraGinjoSnapshot';

// ── Lookup tables (would come from DB in production) ────────────────────────

const recipeSnapshots: RecipeSnapshot[] = [sakuraGinjoSnapshot];

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

/** Find a recipe snapshot by its ID. */
export function getRecipeSnapshotById(id: string): RecipeSnapshot | null {
	return recipeSnapshots.find((r) => r.id === id) ?? null;
}

/** Resolve a recipe snapshot (by id) into a fully-loaded RecipeBundle. */
export function resolveRecipeBundle(recipeSnapshotId: string): RecipeBundle | null {
	const recipe = recipeSnapshots.find((r) => r.id === recipeSnapshotId);
	if (!recipe) return null;
	return resolveBundleFromSource(recipe);
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
