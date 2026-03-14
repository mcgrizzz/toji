import type { RiceLotItem, KojiStrainItem, YeastStockItem } from '$lib/app/models/inventory';
import type { RiceLotRef, KojiStrainRef, YeastRef } from '$lib/engine/models/planTypes';

export function riceLotToRef(item: RiceLotItem): RiceLotRef {
	return {
		lotId: item.id,
		variety: item.variety,
		polishPct: item.polishPct,
		lotLabel: item.lotLabel
	};
}

export function kojiStrainToRef(item: KojiStrainItem): KojiStrainRef {
	return {
		strainId: item.id,
		name: item.name
	};
}

export function yeastStockToRef(item: YeastStockItem): YeastRef {
	return {
		yeastId: item.id,
		name: item.name,
		format: item.format
	};
}
