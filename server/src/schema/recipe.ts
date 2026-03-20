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

const AssetType = t.enum('AssetType', ['recipe', 'process', 'water_profile']);

const AssetKind = t.enum('AssetKind', ['working', 'snapshot']);

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
  {
    name: 'user',
    public: true,
  },
  {
    id: t.string().primaryKey(),
    displayName: t.string(),
    email: t.string().optional(),
    avatarUrl: t.string().optional(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

/**
 * Maps a SpacetimeDB Identity (derived from issuer + subject) back to a User.
 * Each auth provider login produces a unique Identity; this table unifies them.
 */
export const AuthIdentity = table(
  {
    name: 'auth_identity',
    public: true,
    indexes: [
      { accessor: 'byUserId', algorithm: 'btree' as const, columns: ['userId'] },
    ],
  },
  {
    identityHex: t.string().primaryKey(),
    userId: t.string(),
    issuer: t.string(),
    subject: t.string(),
    createdAt: t.timestamp(),
  }
);

// ── Asset metadata ───────────────────────────────────────────────────────────

/**
 * Shared metadata for all versioned assets (recipes, processes, water profiles).
 * Invariants:
 * - version: null for working, required for snapshot
 * - isPublic: always false for working assets
 * - lineageRootId: equals own id for root assets, inherited for snapshots/copies
 */
export const Asset = table(
  {
    name: 'asset',
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
    dataType: AssetType,
    assetKind: AssetKind,
    name: t.string(),
    description: t.option(t.string()),
    version: t.option(t.string()),
    isPublic: t.bool(),
    isArchived: t.bool(),
    lineageRootId: t.string(),
    parentAssetId: t.option(t.string()),
    provenanceKind: ProvenanceKind,
    provenanceAssetId: t.option(t.string()),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

// ── Typed payload tables (1:1 with Asset via assetId PK) ────────────────────

export const Recipe = table(
  { name: 'recipe', public: true },
  {
    assetId: t.string().primaryKey(),
    defaultWaterProfileAssetId: t.option(t.string()),
    attachedBatchId: t.option(t.string()),
    notes: t.option(t.string()),
  }
);

export const Process = table(
  { name: 'process', public: true },
  {
    assetId: t.string().primaryKey(),
    processKind: ProcessKind,
    notes: t.option(t.string()),
  }
);

export const WaterProfile = table(
  { name: 'water_profile', public: true },
  {
    assetId: t.string().primaryKey(),
    notes: t.option(t.string()),
  }
);

// ── Process tables ────────────────────────────────────────────────────────────

export const ProcessParameter = table(
  {
    name: 'process_parameter',
    public: true,
    indexes: [
      { accessor: 'byProcessAssetId', algorithm: 'btree' as const, columns: ['processAssetId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    processAssetId: t.string(),
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

export const ProcessStage = table(
  {
    name: 'process_stage',
    public: true,
    indexes: [
      { accessor: 'byProcessAssetId', algorithm: 'btree' as const, columns: ['processAssetId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    processAssetId: t.string(),
    ordinal: t.i32(),
    key: t.string(),
    label: t.string(),
    materialOrdinal: t.option(t.i32()),
    notes: t.option(t.string()),
  }
);

export const ProcessMaterialSlot = table(
  {
    name: 'process_material_slot',
    public: true,
    indexes: [
      { accessor: 'byProcessAssetId', algorithm: 'btree' as const, columns: ['processAssetId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    processAssetId: t.string(),
    stageId: t.option(t.string()),
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

export const ProcessStep = table(
  {
    name: 'process_step',
    public: true,
    indexes: [
      { accessor: 'byStageId', algorithm: 'btree' as const, columns: ['stageId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    stageId: t.string(),
    ordinal: t.i32(),
    key: t.string(),
    label: t.string(),
    instructionTemplate: t.string(),
    sectionKey: t.option(t.string()),
    sectionLabel: t.option(t.string()),
    notes: t.option(t.string()),
  }
);

// ── Task tables ──────────────────────────────────────────────────────────────

export const ProcessTask = table(
  {
    name: 'process_task',
    public: true,
    indexes: [
      { accessor: 'byProcessAssetId', algorithm: 'btree' as const, columns: ['processAssetId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    processAssetId: t.string(),
    stageId: t.option(t.string()),
    stepId: t.option(t.string()),
    ordinal: t.i32(),
    key: t.string(),
    label: t.string(),
    taskKind: TaskKind,
    sectionKey: t.option(t.string()),
    sectionLabel: t.option(t.string()),
    timingKind: TaskTimingKind,
    hoursFromStart: t.option(t.f64()),
    anchorStageId: t.option(t.string()),
    offsetHours: t.option(t.f64()),
    durationH: t.option(t.f64()),
    description: t.option(t.string()),
    captureActualOnComplete: t.bool(),
    notes: t.option(t.string()),
  }
);

// ── Recipe composition tables ───────────────────────────────────────────────

export const RecipeProcess = table(
  {
    name: 'recipe_process',
    public: true,
    indexes: [
      { accessor: 'byRecipeAssetId', algorithm: 'btree' as const, columns: ['recipeAssetId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    recipeAssetId: t.string(),
    ordinal: t.i32(),
    label: t.string(),
    processSnapshotAssetId: t.string(),
    notes: t.option(t.string()),
  }
);

export const RecipeMaterial = table(
  {
    name: 'recipe_material',
    public: true,
    indexes: [
      { accessor: 'byRecipeAssetId', algorithm: 'btree' as const, columns: ['recipeAssetId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    recipeAssetId: t.string(),
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

export const RecipeMaterialBinding = table(
  {
    name: 'recipe_material_binding',
    public: true,
    indexes: [
      { accessor: 'byRecipeProcessId', algorithm: 'btree' as const, columns: ['recipeProcessId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    recipeProcessId: t.string(),
    processMaterialSlotId: t.string(),
    recipeMaterialId: t.string(),
    quantityOverride: t.option(t.f64()),
    quantityUnitOverride: t.option(t.string()),
    notes: t.option(t.string()),
  }
);

// ── Normalized child tables ───────────────────────────────────────────────────

export const WaterProfileIonTarget = table(
  {
    name: 'water_profile_ion_target',
    public: true,
    indexes: [
      { accessor: 'byWaterProfileAssetId', algorithm: 'btree' as const, columns: ['waterProfileAssetId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    waterProfileAssetId: t.string(),
    ionSymbol: t.string(),
    targetPpm: t.f64(),
  }
);
