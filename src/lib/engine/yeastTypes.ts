/** A yeast product in the catalog */
export type YeastProduct = {
	id: string;
	name: string;
	isBuiltIn: boolean;
	format: 'liquid_pouch' | 'dry' | 'slant';
	manufacturer?: string;
	/** Billions of cells per package at manufacture date */
	cellsPerPackageBn: number;
	/** Viability model for this format */
	viability: YeastViabilityModel;
};

/** Linear decay: viability = initialViabilityFrac - dailyLossFrac * ageDays */
export type LinearViabilityModel = {
	kind: 'linear';
	initialViabilityFrac: number;
	dailyLossFrac: number;
	maxAgeDays: number;
};

/** Exponential decay: viability = initialViabilityFrac * exp(decayRatePerDay * ageDays) */
export type ExponentialViabilityModel = {
	kind: 'exponential';
	initialViabilityFrac: number;
	decayRatePerDay: number;
	maxAgeDays: number;
};

export type YeastViabilityModel = LinearViabilityModel | ExponentialViabilityModel;

/** Specific yeast packages selected for a batch */
export type YeastSelection = {
	product: YeastProduct;
	/** Manufacture or packaging date (ISO 8601) */
	packageDate: string;
	/** Number of packages */
	packageCount: number;
};
