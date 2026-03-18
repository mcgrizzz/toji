import type {
	ProcessKind,
	ProcessStageSpec,
	ProcessMaterialSlotSpec,
	ProcessStepSpec,
	ProcessStepFieldSpec,
	ProcessSnapshot,
	ProcessSource
} from '$lib/app/models/processes';

// ---------------------------------------------------------------------------
// Skeletal fixture: exercises the full process tree shape.
// Values are placeholders — not canonical brewing data.
// ---------------------------------------------------------------------------

// --- Koji process ---

const kojiStages: ProcessStageSpec[] = [
	{
		id: 'ks-1',
		processEntityId: 'koji-1',
		ordinal: 0,
		key: 'seikiku',
		label: 'Seikiku'
	}
];

const kojiMaterials: ProcessMaterialSlotSpec[] = [
	{
		id: 'km-1',
		processEntityId: 'koji-1',
		stageSpecId: 'ks-1',
		ordinal: 0,
		key: 'rice',
		label: 'Rice',
		materialClass: 'grain',
		quantityMode: 'weight',
		quantityValue: 100,
		quantityUnit: 'kg'
	},
	{
		id: 'km-2',
		processEntityId: 'koji-1',
		stageSpecId: 'ks-1',
		ordinal: 1,
		key: 'tane-koji',
		label: 'Tane-koji',
		materialClass: 'culture',
		quantityMode: 'weight',
		quantityValue: 0.1,
		quantityUnit: 'kg'
	}
];

const kojiSteps: ProcessStepSpec[] = [
	{
		id: 'kst-1',
		stageSpecId: 'ks-1',
		ordinal: 0,
		key: 'sprinkle',
		label: 'Sprinkle spores',
		instructionTemplate: 'Sprinkle {tane-koji} onto steamed rice.',
		isCheckable: true,
		sectionKey: 'inoculation',
		sectionLabel: 'Inoculation'
	},
	{
		id: 'kst-2',
		stageSpecId: 'ks-1',
		ordinal: 1,
		key: 'check-temp',
		label: 'Check temperature',
		instructionTemplate: 'Measure bed temperature.',
		isCheckable: true,
		sectionKey: 'incubation',
		sectionLabel: 'Incubation'
	}
];

const kojiStepFields: ProcessStepFieldSpec[] = [
	{
		id: 'ksf-1',
		stepSpecId: 'kst-2',
		ordinal: 0,
		key: 'bed-temp',
		label: 'Bed temp',
		valueType: 'number',
		unit: '°C',
		defaultNumberValue: 32,
		captureActualOnComplete: true
	}
];

const kojiSnapshot: ProcessSnapshot = {
	entityId: 'koji-1',
	processKind: 'koji',
	name: 'Koji (fixture)',
	stages: kojiStages,
	materialSlots: kojiMaterials,
	steps: kojiSteps,
	stepFields: kojiStepFields
};

// --- Moto process ---

const motoStages: ProcessStageSpec[] = [
	{
		id: 'ms-1',
		processEntityId: 'moto-1',
		ordinal: 0,
		key: 'buildup',
		label: 'Buildup'
	}
];

const motoMaterials: ProcessMaterialSlotSpec[] = [
	{
		id: 'mm-1',
		processEntityId: 'moto-1',
		stageSpecId: 'ms-1',
		ordinal: 0,
		key: 'water',
		label: 'Water',
		materialClass: 'liquid',
		quantityMode: 'volume',
		quantityValue: 50,
		quantityUnit: 'L'
	}
];

const motoSteps: ProcessStepSpec[] = [
	{
		id: 'mst-1',
		stageSpecId: 'ms-1',
		ordinal: 0,
		key: 'combine',
		label: 'Combine ingredients',
		instructionTemplate: 'Add water, koji, and yeast.',
		isCheckable: true,
		sectionKey: 'mix',
		sectionLabel: 'Mixing'
	}
];

const motoStepFields: ProcessStepFieldSpec[] = [
	{
		id: 'msf-1',
		stepSpecId: 'mst-1',
		ordinal: 0,
		key: 'notes',
		label: 'Notes',
		valueType: 'text',
		captureActualOnComplete: false
	}
];

const motoSnapshot: ProcessSnapshot = {
	entityId: 'moto-1',
	processKind: 'moto',
	name: 'Moto (fixture)',
	stages: motoStages,
	materialSlots: motoMaterials,
	steps: motoSteps,
	stepFields: motoStepFields
};

// --- Moromi process ---

const moromiStages: ProcessStageSpec[] = [
	{
		id: 'rs-1',
		processEntityId: 'moromi-1',
		ordinal: 0,
		key: 'hatsuzoe',
		label: 'Hatsuzoe'
	},
	{
		id: 'rs-2',
		processEntityId: 'moromi-1',
		ordinal: 1,
		key: 'nakazoe',
		label: 'Nakazoe'
	}
];

const moromiMaterials: ProcessMaterialSlotSpec[] = [
	{
		id: 'rm-1',
		processEntityId: 'moromi-1',
		stageSpecId: 'rs-1',
		ordinal: 0,
		key: 'rice',
		label: 'Rice',
		materialClass: 'grain',
		quantityMode: 'weight',
		quantityValue: 200,
		quantityUnit: 'kg'
	}
];

const moromiSteps: ProcessStepSpec[] = [
	{
		id: 'rst-1',
		stageSpecId: 'rs-1',
		ordinal: 0,
		key: 'add-rice',
		label: 'Add steamed rice',
		instructionTemplate: 'Add steamed rice to the mash.',
		isCheckable: true,
		sectionKey: 'addition',
		sectionLabel: 'Addition'
	},
	{
		id: 'rst-2',
		stageSpecId: 'rs-2',
		ordinal: 0,
		key: 'add-rice',
		label: 'Add steamed rice',
		instructionTemplate: 'Add steamed rice to the mash.',
		isCheckable: false,
		sectionKey: 'addition',
		sectionLabel: 'Addition'
	}
];

const moromiStepFields: ProcessStepFieldSpec[] = [
	{
		id: 'rsf-1',
		stepSpecId: 'rst-1',
		ordinal: 0,
		key: 'mash-temp',
		label: 'Mash temp',
		valueType: 'number',
		unit: '°C',
		defaultNumberValue: 12,
		captureActualOnComplete: true
	},
	{
		id: 'rsf-2',
		stepSpecId: 'rst-1',
		ordinal: 1,
		key: 'mixed',
		label: 'Mixed thoroughly',
		valueType: 'boolean',
		defaultBoolValue: false,
		captureActualOnComplete: false
	}
];

const moromiSnapshot: ProcessSnapshot = {
	entityId: 'moromi-1',
	processKind: 'moromi',
	name: 'Moromi (fixture)',
	stages: moromiStages,
	materialSlots: moromiMaterials,
	steps: moromiSteps,
	stepFields: moromiStepFields
};

// --- Recipe-level wiring ---

const processSources: ProcessSource[] = [
	{
		id: 'ps-1',
		recipeEntityId: 'recipe-1',
		ordinal: 0,
		label: 'Koji',
		processSnapshotEntityId: 'koji-1'
	},
	{
		id: 'ps-2',
		recipeEntityId: 'recipe-1',
		ordinal: 1,
		label: 'Moto',
		processSnapshotEntityId: 'moto-1'
	},
	{
		id: 'ps-3',
		recipeEntityId: 'recipe-1',
		ordinal: 2,
		label: 'Moromi',
		processSnapshotEntityId: 'moromi-1'
	}
];

const snapshots: Record<string, ProcessSnapshot> = {
	'koji-1': kojiSnapshot,
	'moto-1': motoSnapshot,
	'moromi-1': moromiSnapshot
};

export const testProcessFixture = {
	recipeName: 'Test Recipe',
	recipeDescription: 'Skeletal fixture for the process model sandbox.',
	processSources,
	snapshots
};
