/** Process kind — mirrors server ProcessKind enum. */
export type ProcessKind = 'koji' | 'moto' | 'moromi' | 'other';

/** Client-side mirror of server ProcessStage table. */
export type ProcessStage = {
	id: string;
	processAssetId: string;
	ordinal: number;
	key: string;
	label: string;
	materialOrdinal?: number;
	notes?: string;
};

/** Client-side mirror of server ProcessMaterialSlot table. */
export type ProcessMaterialSlot = {
	id: string;
	processAssetId: string;
	stageId?: string;
	ordinal: number;
	key: string;
	label: string;
	materialClass: string;
	quantityMode: string;
	quantityValue?: number;
	quantityUnit?: string;
	notes?: string;
};

/** Client-side mirror of server ProcessStep table. */
export type ProcessStep = {
	id: string;
	stageId: string;
	ordinal: number;
	key: string;
	label: string;
	instructionTemplate: string;
	sectionKey?: string;
	sectionLabel?: string;
	notes?: string;
};

/** Denormalized snapshot of a process with its full spec tree. */
export type ProcessSnapshot = {
	assetId: string;
	processKind: ProcessKind;
	name: string;
	stages: ProcessStage[];
	materialSlots: ProcessMaterialSlot[];
	steps: ProcessStep[];
	notes?: string;
};

/** Lightweight ref from a recipe to a process snapshot. Mirrors server RecipeProcess. */
export type ProcessSource = {
	id: string;
	recipeAssetId: string;
	ordinal: number;
	label: string;
	processSnapshotAssetId: string;
	notes?: string;
};
