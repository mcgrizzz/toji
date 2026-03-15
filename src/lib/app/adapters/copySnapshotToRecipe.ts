import type { Recipe, RecipeSnapshot } from '$lib/app/models/recipes';
import { getRecipeSnapshotById } from '$lib/data/library';

/** Convert a library snapshot into a mutable working recipe. */
export function copySnapshotToRecipe(snapshot: RecipeSnapshot): Recipe {
	return {
		id: crypto.randomUUID(),
		name: snapshot.name,
		body: structuredClone(snapshot.body),
		createdAt: new Date().toISOString()
	};
}

/** Resolve a snapshot by ID and copy it into a new working recipe. */
export function createRecipeFromSnapshot(snapshotId: string): Recipe | null {
	const snapshot = getRecipeSnapshotById(snapshotId);
	if (!snapshot) return null;
	return copySnapshotToRecipe(snapshot);
}
