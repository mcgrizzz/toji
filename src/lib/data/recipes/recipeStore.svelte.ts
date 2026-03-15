import type { Recipe } from '$lib/app/models/recipes';

const recipes = $state<Map<string, Recipe>>(new Map());

export function getAllRecipes(): Recipe[] {
	return Array.from(recipes.values());
}

export function getRecipeById(id: string): Recipe | undefined {
	return recipes.get(id);
}

export function addRecipe(recipe: Recipe): void {
	recipes.set(recipe.id, recipe);
}

export function deleteRecipe(id: string): boolean {
	return recipes.delete(id);
}
