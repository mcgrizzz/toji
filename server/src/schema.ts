import { schema, table, t } from 'spacetimedb/server';

// ── User ──────────────────────────────────────────────────────────────────────

export const User = table(
  { name: 'user', public: true },
  {
    id: t.string().primaryKey(),
    age: t.i32().optional(),
  }
);

// ── Preset tables ─────────────────────────────────────────────────────────────

export const KojiPresets = table(
  { name: 'koji_presets', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    isBuiltIn: t.bool(),
    /** Grams of tane-koji per kg of koji rice */
    kojiGPerKgRice: t.f64(),
    /** Carrier material name (e.g. "Toasted Rice Flour") */
    carrier: t.string(),
    /** Carrier : tane-koji mass ratio (g carrier per g tane-koji) */
    carrierRatioGPerG: t.f64(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

export const MotoPresets = table(
  { name: 'moto_presets', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    isBuiltIn: t.bool(),
    /** Fraction of total batch rice in moto */
    riceFrac: t.f64(),
    /** Fraction of moto rice that becomes koji */
    kojiFrac: t.f64(),
    /** Litres of water per kg of moto rice */
    waterLPerKg: t.f64(),
    /** Yeast pitch rate: million cells per mL of moromi volume */
    yeastPitchRateMPerMl: t.f64(),
    /** Reference acid dose in mL per L of moto water */
    acidRefMlPerL: t.f64(),
    /** Strength of the reference acid (%) */
    acidRefStrengthPct: t.f64(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

export const MoromiPresets = table(
  { name: 'moromi_presets', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    isBuiltIn: t.bool(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

export const MoromiStages = table(
  {
    name: 'moromi_stages',
    public: true,
    indexes: [{ accessor: 'byMoromiPresetId', algorithm: 'btree', columns: ['moromiPresetId'] }],
  },
  {
    id: t.string().primaryKey(),
    moromiPresetId: t.string(),
    name: t.string(),
    /** Ordinal position for material additions: 1=soe, 2=naka, 3=tome.
     *  Odori is a schedule phase, not a material addition, and must NOT appear here. */
    ordinal: t.i32(),
    /** Fraction of total batch rice in this stage */
    riceFrac: t.f64(),
    /** Fraction of this stage's rice that becomes koji */
    kojiFrac: t.f64(),
    /** Litres of water per kg of this stage's rice */
    waterLPerKg: t.f64(),
  }
);

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

// ── Recipe tables ─────────────────────────────────────────────────────────────

export const Recipes = table(
  { name: 'recipes', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    kojiPresetId: t.string(),
    motoPresetId: t.string(),
    moromiPresetId: t.string(),
    waterProfileId: t.string(),
    recommendedRiceVariety: t.string().optional(),
    recommendedPolishPct: t.f64().optional(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

export const RecipeAmendments = table(
  {
    name: 'recipe_amendments',
    public: true,
    indexes: [{ accessor: 'byRecipeId', algorithm: 'btree', columns: ['recipeId'] }],
  },
  {
    id: t.string().primaryKey(),
    recipeId: t.string(),
    kind: t.string(),
    /** Fraction of total batch rice mass */
    fracOfTotalRice: t.f64(),
    /** Stage at which this amendment is added */
    addedAtStage: t.string(),
    /** Display order */
    ordinal: t.i32(),
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

// ── Plan table ────────────────────────────────────────────────────────────────

export const RecipePlans = table(
  {
    name: 'recipe_plans',
    public: true,
    indexes: [{ accessor: 'byRecipeId', algorithm: 'btree', columns: ['recipeId'] }],
  },
  {
    id: t.string().primaryKey(),
    recipeId: t.string(),
    /** genshu_volume_L | total_rice_kg */
    targetKind: t.enum('TargetKind', ['genshu_volume_L', 'total_rice_kg']),
    targetValue: t.f64(),
    /** Koji block */
    kojiRiceLotId: t.string().optional(),
    kojiStrainId: t.string().optional(),
    usePremadeKoji: t.bool(),
    /** Moto block */
    motoRiceLotId: t.string().optional(),
    yeastId: t.string().optional(),
    acidTypeId: t.string().optional(),
    /** Moromi stage → rice lot mapping */
    moromiStageLots: t.array(t.object('MoromiStageLot', { stageOrdinal: t.i32(), riceLotId: t.string() })),
    /** Water profile override (null = use recipe default) */
    waterProfileId: t.string().optional(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

// ── Session tables ────────────────────────────────────────────────────────────

export const BrewSessions = table(
  {
    name: 'brew_sessions',
    public: true,
    indexes: [{ accessor: 'byPlanId', algorithm: 'btree', columns: ['planId'] }],
  },
  {
    id: t.string().primaryKey(),
    planId: t.string(),
    /** planned | in_progress | complete | abandoned */
    status: t.enum('BrewSessionStatus', ['planned', 'in_progress', 'complete', 'abandoned']),
    startedAt: t.timestamp().optional(),
    completedAt: t.timestamp().optional(),
    notes: t.string().optional(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

export const BrewCheckpoints = table(
  {
    name: 'brew_checkpoints',
    public: true,
    indexes: [{ accessor: 'bySessionId', algorithm: 'btree', columns: ['sessionId'] }],
  },
  {
    id: t.string().primaryKey(),
    sessionId: t.string(),
    stage: t.string(),
    stepIndex: t.i32(),
    stepLabel: t.string(),
    completed: t.bool(),
    measuredValue: t.f64().optional(),
    unit: t.string().optional(),
  }
);

// ── Export ────────────────────────────────────────────────────────────────────

export default schema({
  User,
  KojiPresets,
  MotoPresets,
  MoromiPresets,
  MoromiStages,
  WaterProfiles,
  WaterProfileIons,
  AcidTypes,
  MineralSalts,
  MineralSaltIons,
  Recipes,
  RecipeAmendments,
  RiceLots,
  KojiStrains,
  Yeasts,
  RecipePlans,
  BrewSessions,
  BrewCheckpoints,
});
