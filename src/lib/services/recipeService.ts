import { connect, procedures, reducers } from '$lib/spacetimedb/connection';
import type { RecipeBundle } from '$lib/app/types';

export type RecipeListItem = {
	id: string;
	name: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
};

export async function getMyRecipes(): Promise<RecipeListItem[]> {
	await connect();
	const json = await procedures().getMyRecipes({} as never);
	return JSON.parse(json);
}

export async function getMyRecipeBundle(recipeId: string): Promise<RecipeBundle> {
	await connect();
	const json = await procedures().getMyRecipeBundle({ recipeId });
	return JSON.parse(json);
}

export async function copyRecipeSnapshotToRecipe(
	snapshotId: string
): Promise<{ recipeId: string }> {
	await connect();
	const json = await procedures().copyRecipeSnapshotToRecipe({ snapshotId });
	return JSON.parse(json);
}

export function deleteRecipe(recipeId: string): void {
	reducers().deleteRecipe({ recipeId });
}
