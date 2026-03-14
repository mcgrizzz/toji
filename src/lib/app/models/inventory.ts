export type RiceLotItem = {
	id: string;
	variety: string;
	polishPct: number;
	lotLabel?: string;
	massKgAvailable?: number;
};

export type KojiStrainItem = {
	id: string;
	name: string;
	supplier?: string;
};

/** Temporary flattened stock fixture — will later reference a catalog product plus package metadata */
export type YeastStockItem = {
	id: string;
	productId: string;
	name: string;
	format: 'liquid_pouch' | 'dry' | 'slant';
	manufacturer?: string;
	packageDate?: string;
};
