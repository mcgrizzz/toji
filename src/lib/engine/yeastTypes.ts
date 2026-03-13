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

/** How cell count decays over time */
export type YeastViabilityModel = {
	/** Daily viability loss as a fraction (e.g. 0.005 = 0.5%/day) */
	dailyLossFrac: number;
	/** Max age in days before viability is considered zero */
	maxAgeDays: number;
};

/** Specific yeast packages selected for a batch */
export type YeastSelection = {
	product: YeastProduct;
	/** Manufacture or packaging date (ISO 8601) */
	packageDate: string;
	/** Number of packages */
	packageCount: number;
};
