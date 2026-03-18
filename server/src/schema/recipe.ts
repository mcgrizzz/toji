import { table, t } from 'spacetimedb/server';

// ── Future concepts (not yet implemented) ─────────────────────────────────────
//
// Block
//   A reusable authored grouping unit above steps/tasks. This will eventually
//   replace ad hoc sectionKey / sectionLabel grouping with a first-class schema
//   concept for things like "rice prep", "daily fermentation checks", etc.
//
// ObservationSetSpec / ObservationValueSpec
//   Structured measurement/logging definitions for graphable batch data such as
//   temperature, pH, baumé, alcohol, chamber temp, and paired readings.
//
// ToolAttachment / ToolOutputBinding
//   Calculator/tool attachment points plus bindings that map tool outputs back
//   into authored fields or runtime values.

// ── Enums ─────────────────────────────────────────────────────────────────────

const DataType = t.enum('DataType', ['recipe', 'process', 'water_profile']);

const EntityKind = t.enum('EntityKind', ['working', 'snapshot']);

const ProvenanceKind = t.enum('ProvenanceKind', [
  'original',
  'copied_from_public',
  'forked',
]);

const ProcessKind = t.enum('ProcessKind', ['koji', 'moto', 'moromi', 'other']);

export const MaterialClass = t.enum('MaterialClass', [
  'rice',
  'koji',
  'water',
  'yeast',
  'acid',
  'adjunct',
  'other',
]);

const ValueType = t.enum('ValueType', ['number', 'text', 'boolean']);

const QuantityMode = t.enum('QuantityMode', [
  'absolute',
  'ratio_of_total_rice',
  'ratio_of_stage_rice',
  'ratio_of_target',
]);

export const TaskKind = t.enum('TaskKind', [
  'milestone',
  'goal',
  'check',
  'action',
  'measurement',
]);

const TaskTimingKind = t.enum('TaskTimingKind', [
  'absolute',
  'relative_to_stage',
]);

// ── User ──────────────────────────────────────────────────────────────────────

export const User = table(
  { name: 'user', public: true },
  {
    id: t.string().primaryKey(),
    age: t.i32().optional(),
  }
);

// ── Entity metadata ───────────────────────────────────────────────────────────

/**
 * Shared metadata for all versioned entities (recipes, processes, water profiles).
 * Invariants:
 * - version: null for working, required for snapshot
 * - isPublic: always false for working entities
 * - lineageRootId: equals own id for root entities, inherited for snapshots/copies
 */
export const Entity = table(
  {
    name: 'entity',
    public: true,
    indexes: [
      { accessor: 'byOwnerId', algorithm: 'btree' as const, columns: ['ownerId'] },
      { accessor: 'byDataType', algorithm: 'btree' as const, columns: ['dataType'] },
      { accessor: 'byLineageRootId', algorithm: 'btree' as const, columns: ['lineageRootId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    ownerId: t.string(),
    dataType: DataType,
    entityKind: EntityKind,
    name: t.string(),
    description: t.option(t.string()),
    version: t.option(t.string()),
    isPublic: t.bool(),
    isArchived: t.bool(),
    lineageRootId: t.string(),
    parentEntityId: t.option(t.string()),
    provenanceKind: ProvenanceKind,
    provenanceEntityId: t.option(t.string()),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

// ── Typed payload tables (1:1 with Entity via entityId PK) ────────────────────

export const Recipe = table(
  { name: 'recipe', public: true },
  {
    entityId: t.string().primaryKey(),
    defaultWaterProfileEntityId: t.option(t.string()),
    attachedBatchId: t.option(t.string()),
    notes: t.option(t.string()),
  }
);

export const Process = table(
  { name: 'process', public: true },
  {
    entityId: t.string().primaryKey(),
    processKind: ProcessKind,
    notes: t.option(t.string()),
  }
);

export const WaterProfile = table(
  { name: 'water_profile', public: true },
  {
    entityId: t.string().primaryKey(),
    notes: t.option(t.string()),
  }
);

// ── Process spec tables ─────────────────────────────────────────────────────

export const ProcessParamSpec = table(
  {
    name: 'process_param_spec',
    public: true,
    indexes: [
      { accessor: 'byProcessEntityId', algorithm: 'btree' as const, columns: ['processEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    processEntityId: t.string(),
    ordinal: t.i32(),
    key: t.string(),
    label: t.string(),
    valueType: ValueType,
    unit: t.option(t.string()),
    defaultNumberValue: t.option(t.f64()),
    defaultTextValue: t.option(t.string()),
    defaultBoolValue: t.option(t.bool()),
    notes: t.option(t.string()),
  }
);

export const ProcessStageSpec = table(
  {
    name: 'process_stage_spec',
    public: true,
    indexes: [
      { accessor: 'byProcessEntityId', algorithm: 'btree' as const, columns: ['processEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    processEntityId: t.string(),
    ordinal: t.i32(),
    key: t.string(),
    label: t.string(),
    materialOrdinal: t.option(t.i32()),
    notes: t.option(t.string()),
  }
);

export const ProcessMaterialSlotSpec = table(
  {
    name: 'process_material_slot_spec',
    public: true,
    indexes: [
      { accessor: 'byProcessEntityId', algorithm: 'btree' as const, columns: ['processEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    processEntityId: t.string(),
    stageSpecId: t.option(t.string()),
    ordinal: t.i32(),
    key: t.string(),
    label: t.string(),
    materialClass: MaterialClass,
    quantityMode: QuantityMode,
    quantityValue: t.option(t.f64()),
    quantityUnit: t.option(t.string()),
    notes: t.option(t.string()),
  }
);

export const ProcessStepSpec = table(
  {
    name: 'process_step_spec',
    public: true,
    indexes: [
      { accessor: 'byStageSpecId', algorithm: 'btree' as const, columns: ['stageSpecId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    stageSpecId: t.string(),
    ordinal: t.i32(),
    key: t.string(),
    label: t.string(),
    instructionTemplate: t.string(),
    isCheckable: t.bool(),
    sectionKey: t.option(t.string()),
    sectionLabel: t.option(t.string()),
    notes: t.option(t.string()),
  }
);

export const ProcessStepFieldSpec = table(
  {
    name: 'process_step_field_spec',
    public: true,
    indexes: [
      { accessor: 'byStepSpecId', algorithm: 'btree' as const, columns: ['stepSpecId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    stepSpecId: t.string(),
    ordinal: t.i32(),
    key: t.string(),
    label: t.string(),
    valueType: ValueType,
    unit: t.option(t.string()),
    defaultNumberValue: t.option(t.f64()),
    defaultTextValue: t.option(t.string()),
    defaultBoolValue: t.option(t.bool()),
    captureActualOnComplete: t.bool(),
    notes: t.option(t.string()),
  }
);

// ── Task spec tables ──────────────────────────────────────────────────────────

export const TaskSpec = table(
  {
    name: 'task_spec',
    public: true,
    indexes: [
      { accessor: 'byProcessEntityId', algorithm: 'btree' as const, columns: ['processEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    processEntityId: t.string(),
    stageSpecId: t.option(t.string()),
    stepSpecId: t.option(t.string()),
    ordinal: t.i32(),
    key: t.string(),
    label: t.string(),
    taskKind: TaskKind,
    sectionKey: t.option(t.string()),
    sectionLabel: t.option(t.string()),
    timingKind: TaskTimingKind,
    hoursFromStart: t.option(t.f64()),
    anchorStageSpecId: t.option(t.string()),
    offsetHours: t.option(t.f64()),
    durationH: t.option(t.f64()),
    description: t.option(t.string()),
    captureActualOnComplete: t.bool(),
    notes: t.option(t.string()),
  }
);

// ── Recipe composition tables ───────────────────────────────────────────────

export const RecipeProcessUse = table(
  {
    name: 'recipe_process_use',
    public: true,
    indexes: [
      { accessor: 'byRecipeEntityId', algorithm: 'btree' as const, columns: ['recipeEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    recipeEntityId: t.string(),
    ordinal: t.i32(),
    label: t.string(),
    processSnapshotEntityId: t.string(),
    notes: t.option(t.string()),
  }
);

export const RecipeMaterialSpec = table(
  {
    name: 'recipe_material_spec',
    public: true,
    indexes: [
      { accessor: 'byRecipeEntityId', algorithm: 'btree' as const, columns: ['recipeEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    recipeEntityId: t.string(),
    key: t.string(),
    label: t.string(),
    materialClass: MaterialClass,
    defaultUnit: t.string(),
    catalogRefType: t.option(t.string()),
    catalogRefId: t.option(t.string()),
    customName: t.option(t.string()),
    notes: t.option(t.string()),
  }
);

export const RecipeProcessMaterialBinding = table(
  {
    name: 'recipe_process_material_binding',
    public: true,
    indexes: [
      { accessor: 'byRecipeProcessUseId', algorithm: 'btree' as const, columns: ['recipeProcessUseId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    recipeProcessUseId: t.string(),
    processMaterialSlotSpecId: t.string(),
    recipeMaterialSpecId: t.string(),
    quantityOverride: t.option(t.f64()),
    quantityUnitOverride: t.option(t.string()),
    notes: t.option(t.string()),
  }
);

// ── Normalized child tables ───────────────────────────────────────────────────

export const WaterProfileIon = table(
  {
    name: 'water_profile_ion',
    public: true,
    indexes: [
      { accessor: 'byWaterProfileEntityId', algorithm: 'btree' as const, columns: ['waterProfileEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    waterProfileEntityId: t.string(),
    ionSymbol: t.string(),
    targetPpm: t.f64(),
  }
);

