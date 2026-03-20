import { connect, procedures } from '$lib/spacetimedb/connection';
import type { RiceLotRef, KojiStrainRef, YeastRef } from '$lib/engine/models/planTypes';

export type Inventory = {
	riceLots: RiceLotRef[];
	kojiStrains: KojiStrainRef[];
	yeasts: YeastRef[];
};

export async function getMyInventory(): Promise<Inventory> {
	await connect();
	const json = await procedures().getMyInventory({} as never);
	return JSON.parse(json);
}

export async function getSeedInventory(): Promise<Inventory> {
	await connect();
	const json = await procedures().getSeedInventory({} as never);
	return JSON.parse(json);
}
