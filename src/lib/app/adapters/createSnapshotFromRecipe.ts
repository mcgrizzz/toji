import type { Recipe, RecipeSnapshot } from '$lib/app/models/recipes';

/** Freeze a working recipe into an immutable snapshot (for batch creation). */
export function createSnapshotFromRecipe(recipe: Recipe, version: string): RecipeSnapshot {
	return {
		id: crypto.randomUUID(),
		sourceId: recipe.id,
		version,
		name: recipe.name,
		body: structuredClone(recipe.body),
		isPublic: false,
		createdAt: new Date().toISOString()
	};
}
