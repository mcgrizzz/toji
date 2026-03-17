import { connect, procedures } from '$lib/spacetimedb/connection';
import type { RecipeBundle } from '$lib/app/types';

export type LibraryEntry = {
	snapshotId: string;
	name: string;
	description?: string;
	version: string;
};

export async function getLibraryEntries(): Promise<LibraryEntry[]> {
	await connect();
	const json = await procedures().getPublicLibraryEntries({} as never);
	return JSON.parse(json);
}

export async function getRecipeBundle(snapshotId: string): Promise<RecipeBundle> {
	await connect();
	const json = await procedures().getRecipeBundle({ snapshotId });
	return JSON.parse(json);
}
