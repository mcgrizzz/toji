/** Process kind — mirrors server ProcessKind enum. */
export type ProcessKind = 'koji' | 'moto' | 'moromi' | 'other';

/** Client-side mirror of server ProcessStageSpec table. */
export type ProcessStageSpec = {
	id: string;
	processEntityId: string;
	ordinal: number;
	key: string;
	label: string;
	materialOrdinal?: number;
	notes?: string;
};

/** Client-side mirror of server ProcessMaterialSlotSpec table. */
export type ProcessMaterialSlotSpec = {
	id: string;
	processEntityId: string;
	stageSpecId?: string;
	ordinal: number;
	key: string;
	label: string;
	materialClass: string;
	quantityMode: string;
	quantityValue?: number;
	quantityUnit?: string;
	notes?: string;
};

/** Client-side mirror of server ProcessStepSpec table. */
export type ProcessStepSpec = {
	id: string;
	stageSpecId: string;
	ordinal: number;
	key: string;
	label: string;
	instructionTemplate: string;
	isCheckable: boolean;
	sectionKey?: string;
	sectionLabel?: string;
	scheduledOffsetH?: number;
	durationH?: number;
	notes?: string;
};

/** Client-side mirror of server ProcessStepFieldSpec table. */
export type ProcessStepFieldSpec = {
	id: string;
	stepSpecId: string;
	ordinal: number;
	key: string;
	label: string;
	valueType: 'number' | 'text' | 'boolean';
	unit?: string;
	defaultNumberValue?: number;
	defaultTextValue?: string;
	defaultBoolValue?: boolean;
	captureActualOnComplete: boolean;
	notes?: string;
};

/** Denormalized snapshot of a process with its full spec tree. */
export type ProcessSnapshot = {
	entityId: string;
	processKind: ProcessKind;
	name: string;
	stages: ProcessStageSpec[];
	materialSlots: ProcessMaterialSlotSpec[];
	steps: ProcessStepSpec[];
	stepFields: ProcessStepFieldSpec[];
	notes?: string;
};

/** Lightweight ref from a recipe to a process snapshot. Mirrors server RecipeProcessUse. */
export type ProcessSource = {
	id: string;
	recipeEntityId: string;
	ordinal: number;
	label: string;
	processSnapshotEntityId: string;
	notes?: string;
};
