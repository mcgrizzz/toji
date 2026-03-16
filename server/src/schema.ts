import { schema, table, t } from 'spacetimedb/server';

// ── User ──────────────────────────────────────────────────────────────────────

export const User = table(
  { name: 'user', public: true },
  {
    id: t.string().primaryKey(),
    age: t.i32().optional(),
  }
);

// ── Shared type objects ─────────────────────────────────────────────────────

// Schedule types (process definition for methods)

const GoalSpec = t.object('GoalSpec', { description: t.string() });
const CheckSpec = t.object('CheckSpec', { description: t.string() });
const ActionSpec = t.object('ActionSpec', { description: t.string() });

const ScheduleStep = t.object('ScheduleStep', {
  key: t.string(),
  label: t.string(),
  atH: t.f64(),
  durationH: t.option(t.f64()),
  notes: t.array(t.string()),
  goals: t.array(GoalSpec),
  checks: t.array(CheckSpec),
  actions: t.array(ActionSpec),
});

const Schedule = t.object('Schedule', {
  name: t.string(),
  steps: t.array(ScheduleStep),
});

// Method body types (config + optional schedule)

const KojiMethodBody = t.object('KojiMethodBody', {
  kojiGPerKgRice: t.f64(),
  carrier: t.string(),
  carrierRatioGPerG: t.f64(),
  schedule: t.option(Schedule),
});

const MotoMethodBody = t.object('MotoMethodBody', {
  riceFrac: t.f64(),
  kojiFrac: t.f64(),
  waterLPerKg: t.f64(),
  yeastPitchRateMPerMl: t.f64(),
  acidRefMlPerL: t.f64(),
  acidRefStrengthPct: t.f64(),
  schedule: t.option(Schedule),
});

const MoromiStageSpec = t.object('MoromiStageSpec', {
  name: t.string(),
  ordinal: t.i32(),
  riceFrac: t.f64(),
  kojiFrac: t.f64(),
  waterLPerKg: t.f64(),
});

const MoromiMethodBody = t.object('MoromiMethodBody', {
  stages: t.array(MoromiStageSpec),
  schedule: t.option(Schedule),
});

const MethodBody = t.enum('MethodBody', {
  Koji: KojiMethodBody,
  Moto: MotoMethodBody,
  Moromi: MoromiMethodBody,
});

const MethodKind = t.enum('MethodKind', ['koji', 'moto', 'moromi']);

// Amendment types (embedded array on Recipes)

const AmendmentPlacement = t.enum('AmendmentPlacement', {
  Moto: t.unit(),
  Moromi: t.object('MoromiPlacement', { stageOrdinal: t.i32() }),
});

const AmendmentSpec = t.object('AmendmentSpec', {
  kind: t.string(),
  fracOfTotalRice: t.f64(),
  placement: AmendmentPlacement,
  ordinal: t.i32(),
});

// Batch selection body

const TargetKind = t.enum('TargetKind', ['genshu_volume_L', 'total_rice_kg']);

const MoromiStageLot = t.object('MoromiStageLot', {
  stageOrdinal: t.i32(),
  riceLotId: t.string(),
});

const BatchSelections = t.object('BatchSelections', {
  targetKind: TargetKind,
  targetValue: t.f64(),
  usePremadeKoji: t.bool(),
  kojiRiceLotId: t.option(t.string()),
  kojiStrainId: t.option(t.string()),
  motoRiceLotId: t.option(t.string()),
  yeastId: t.option(t.string()),
  acidTypeId: t.option(t.string()),
  moromiStageLots: t.array(MoromiStageLot),
  waterProfileId: t.option(t.string()),
});

// ── Water profile tables ──────────────────────────────────────────────────────

/** Target water ion profile. Derived values (hardness, SO4:Cl, Ca:Mg) are computed on read. */
export const WaterProfiles = table(
  { name: 'water_profiles', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    isBuiltIn: t.bool(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

/** Ion targets for a water profile (one row per ion per profile). */
export const WaterProfileIons = table(
  {
    name: 'water_profile_ions',
    public: true,
    indexes: [{ accessor: 'byProfileId', algorithm: 'btree', columns: ['profileId'] }],
  },
  {
    id: t.string().primaryKey(),
    profileId: t.string(),
    /** Ion symbol, e.g. 'Ca', 'Mg', 'SO4', 'Cl', 'Na', 'K', 'PO4', 'Fe' */
    ionSymbol: t.string(),
    /** Target concentration in mg/L (ppm) */
    targetPpm: t.f64(),
  }
);

export const AcidTypes = table(
  { name: 'acid_types', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    isBuiltIn: t.bool(),
    /** Actual acid concentration of the solution (%) */
    strengthPct: t.f64(),
    /** Relative acidity vs. lactic 88% reference (lactic 88% = 1.0) */
    relativeAcidity: t.f64(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

// ── Mineral salt tables ───────────────────────────────────────────────────────

/** A mineral salt that can be added to water to hit ion targets. */
export const MineralSalts = table(
  { name: 'mineral_salts', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    isBuiltIn: t.bool(),
    /** The ion this salt primarily supplies (used by the greedy solver) */
    primaryIon: t.string(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

/** Ion contributions per gram of a mineral salt (one row per ion per salt). */
export const MineralSaltIons = table(
  {
    name: 'mineral_salt_ions',
    public: true,
    indexes: [{ accessor: 'bySaltId', algorithm: 'btree', columns: ['saltId'] }],
  },
  {
    id: t.string().primaryKey(),
    saltId: t.string(),
    /** Ion symbol, e.g. 'Ca', 'Mg', 'SO4', 'Cl', 'Na', 'K', 'PO4' */
    ionSymbol: t.string(),
    /** Mass of ion contributed per gram of salt (ionMW / saltMW) */
    massGPerGSalt: t.f64(),
  }
);

// ── Inventory tables ──────────────────────────────────────────────────────────

export const RiceLots = table(
  { name: 'rice_lots', public: true },
  {
    id: t.string().primaryKey(),
    variety: t.string(),
    polishPct: t.f64(),
    lotLabel: t.string().optional(),
    massKgAvailable: t.f64().optional(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

export const KojiStrains = table(
  { name: 'koji_strains', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    supplier: t.string().optional(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

export const Yeasts = table(
  { name: 'yeasts', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    /** liquid_pouch | dry | slant */
    format: t.enum('YeastFormat', ['liquid_pouch', 'dry', 'slant']),
    supplier: t.string().optional(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

// ── Methods ───────────────────────────────────────────────────────────────────

/** Reusable process definitions (config + schedule). Replaces KojiPresets + MotoPresets + MoromiPresets. */
export const Methods = table(
  {
    name: 'methods',
    indexes: [{ accessor: 'byOwnerId', algorithm: 'btree', columns: ['ownerId'] }],
  },
  {
    id: t.string().primaryKey(),
    ownerId: t.string(),
    kind: MethodKind,
    name: t.string(),
    isBuiltIn: t.bool(),
    body: MethodBody,
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

/** Immutable frozen method versions. */
export const MethodSnapshots = table(
  {
    name: 'method_snapshots',
    indexes: [{ accessor: 'byMethodId', algorithm: 'btree', columns: ['methodId'] }],
  },
  {
    id: t.string().primaryKey(),
    methodId: t.string(),
    ownerId: t.string(),
    kind: MethodKind,
    version: t.string(),
    name: t.string(),
    isPublic: t.bool(),
    body: MethodBody,
    createdAt: t.timestamp(),
  }
);

// ── Recipes ───────────────────────────────────────────────────────────────────

/** Mutable working copy. References method snapshot IDs, never mutable method IDs. */
export const Recipes = table(
  {
    name: 'recipes',
    indexes: [{ accessor: 'byOwnerId', algorithm: 'btree', columns: ['ownerId'] }],
  },
  {
    id: t.string().primaryKey(),
    ownerId: t.string(),
    name: t.string(),
    description: t.option(t.string()),
    kojiMethodSnapshotId: t.string(),
    motoMethodSnapshotId: t.string(),
    moromiMethodSnapshotId: t.string(),
    waterProfileId: t.option(t.string()),
    amendments: t.array(AmendmentSpec),
    recommendedRiceVariety: t.option(t.string()),
    recommendedPolishPct: t.option(t.f64()),
    recommendedAcidId: t.option(t.string()),
    recommendedYeastProductId: t.option(t.string()),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

/** Immutable frozen recipe versions. Preserves method snapshot IDs (not embedded bodies). */
export const RecipeSnapshots = table(
  {
    name: 'recipe_snapshots',
    indexes: [
      { accessor: 'byRecipeId', algorithm: 'btree', columns: ['recipeId'] },
      { accessor: 'byOwnerId', algorithm: 'btree', columns: ['ownerId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    recipeId: t.string(),
    ownerId: t.string(),
    version: t.string(),
    name: t.string(),
    description: t.option(t.string()),
    isPublic: t.bool(),
    kojiMethodSnapshotId: t.string(),
    motoMethodSnapshotId: t.string(),
    moromiMethodSnapshotId: t.string(),
    waterProfileId: t.option(t.string()),
    amendments: t.array(AmendmentSpec),
    recommendedRiceVariety: t.option(t.string()),
    recommendedPolishPct: t.option(t.f64()),
    recommendedAcidId: t.option(t.string()),
    recommendedYeastProductId: t.option(t.string()),
    createdAt: t.timestamp(),
  }
);

// ── Batches ───────────────────────────────────────────────────────────────────

/** Frozen brew instances tied to a recipe snapshot. */
export const Batches = table(
  {
    name: 'batches',
    indexes: [
      { accessor: 'byRecipeSnapshotId', algorithm: 'btree', columns: ['recipeSnapshotId'] },
      { accessor: 'byOwnerId', algorithm: 'btree', columns: ['ownerId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    recipeSnapshotId: t.string(),
    ownerId: t.string(),
    status: t.enum('BatchStatus', ['planned', 'in_progress', 'complete', 'abandoned']),
    body: BatchSelections,
    startedAt: t.option(t.timestamp()),
    completedAt: t.option(t.timestamp()),
    notes: t.option(t.string()),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

// ── Export ────────────────────────────────────────────────────────────────────

export default schema({
  User,
  // Catalog / reference (unchanged)
  WaterProfiles,
  WaterProfileIons,
  AcidTypes,
  MineralSalts,
  MineralSaltIons,
  // Inventory (unchanged for 7a)
  RiceLots,
  KojiStrains,
  Yeasts,
  // New persistence model
  Methods,
  MethodSnapshots,
  Recipes,
  RecipeSnapshots,
  Batches,
});
