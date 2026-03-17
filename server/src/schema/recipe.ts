import { table, t } from 'spacetimedb/server';

// ── Enums ─────────────────────────────────────────────────────────────────────

const DataType = t.enum('DataType', [
  'recipe',
  'koji_method',
  'moto_method',
  'moromi_method',
  'water_profile',
]);

const EntityKind = t.enum('EntityKind', ['working', 'snapshot']);

const ProvenanceKind = t.enum('ProvenanceKind', [
  'original',
  'copied_from_public',
  'forked',
]);

const PlacementKind = t.enum('PlacementKind', ['moto', 'moromi_stage']);

const WorkflowKind = t.enum('WorkflowKind', ['koji', 'moto', 'moromi']);

const ScheduleEventKind = t.enum('ScheduleEventKind', [
  'goal',
  'check',
  'action',
  'milestone',
  'measurement',
]);

const TimingKind = t.enum('TimingKind', ['absolute', 'relative_to_stage']);

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
 * Shared metadata for all versioned entities (recipes, methods, water profiles).
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

/** Recipe data. Method entity IDs must point to snapshot entities, never working. */
export const Recipe = table(
  { name: 'recipe', public: true },
  {
    entityId: t.string().primaryKey(),
    kojiMethodEntityId: t.string(),
    motoMethodEntityId: t.string(),
    moromiMethodEntityId: t.string(),
    waterProfileEntityId: t.option(t.string()),
    recommendedCatalogRiceVarietyId: t.option(t.string()),
    recommendedPolishPct: t.option(t.f64()),
    recommendedAcidTypeId: t.option(t.string()),
    recommendedYeastProductId: t.option(t.string()),
  }
);

export const KojiMethod = table(
  { name: 'koji_method', public: true },
  {
    entityId: t.string().primaryKey(),
    kojiGPerKgRice: t.f64(),
    carrierName: t.string(),
    carrierRatioGPerG: t.f64(),
  }
);

export const MotoMethod = table(
  { name: 'moto_method', public: true },
  {
    entityId: t.string().primaryKey(),
    riceFrac: t.f64(),
    kojiFrac: t.f64(),
    waterLPerKg: t.f64(),
    yeastPitchRateMPerMl: t.f64(),
    acidRefMlPerL: t.f64(),
    acidRefStrengthPct: t.f64(),
  }
);

export const MoromiMethod = table(
  { name: 'moromi_method', public: true },
  {
    entityId: t.string().primaryKey(),
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

// ── Normalized child tables ───────────────────────────────────────────────────

/** Amendment on a recipe. stageOrdinal null for moto, required for moromi_stage. */
export const RecipeAmendment = table(
  {
    name: 'recipe_amendment',
    public: true,
    indexes: [
      { accessor: 'byRecipeEntityId', algorithm: 'btree' as const, columns: ['recipeEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    recipeEntityId: t.string(),
    ordinal: t.i32(),
    kind: t.string(),
    fracOfTotalRice: t.f64(),
    placementKind: PlacementKind,
    stageOrdinal: t.option(t.i32()),
  }
);

export const MoromiStage = table(
  {
    name: 'moromi_stage',
    public: true,
    indexes: [
      { accessor: 'byMoromiMethodEntityId', algorithm: 'btree' as const, columns: ['moromiMethodEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    moromiMethodEntityId: t.string(),
    ordinal: t.i32(),
    name: t.string(),
    riceFrac: t.f64(),
    kojiFrac: t.f64(),
    waterLPerKg: t.f64(),
  }
);

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

// ── Schedule tables ───────────────────────────────────────────────────────────

export const ScheduleTable = table(
  {
    name: 'schedule',
    public: true,
    indexes: [
      { accessor: 'byMethodEntityId', algorithm: 'btree' as const, columns: ['methodEntityId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    methodEntityId: t.string(),
    workflowKind: WorkflowKind,
    name: t.string(),
  }
);

/**
 * For absolute: use hoursFromStart; stageOrdinal/offsetHours null.
 * For relative_to_stage: use stageOrdinal+offsetHours; hoursFromStart null.
 */
export const ScheduleEvent = table(
  {
    name: 'schedule_event',
    public: true,
    indexes: [
      { accessor: 'byScheduleId', algorithm: 'btree' as const, columns: ['scheduleId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    scheduleId: t.string(),
    ordinal: t.i32(),
    kind: ScheduleEventKind,
    timingKind: TimingKind,
    hoursFromStart: t.option(t.f64()),
    stageOrdinal: t.option(t.i32()),
    offsetHours: t.option(t.f64()),
    label: t.string(),
    description: t.option(t.string()),
    durationH: t.option(t.f64()),
    note: t.option(t.string()),
  }
);
