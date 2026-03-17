import { t } from 'spacetimedb/server';
import spacetimedb from './schema';

export default spacetimedb;

export const onConnect = spacetimedb.clientConnected(_ctx => {});
export const onDisconnect = spacetimedb.clientDisconnected(_ctx => {});

// ── DTO conversion helpers ──────────────────────────────────────────────────

function tsToIso(ts: { toISOString(): string }): string {
  return ts.toISOString();
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function isSystemOwner(ownerId: string): boolean {
  return ownerId === '__system__';
}

function loadKojiMethod(tx: any, entityId: string) {
  const entity = tx.db.Entity.id.find(entityId);
  if (!entity) throw new Error(`Koji method entity ${entityId} not found`);
  const payload = tx.db.KojiMethod.entityId.find(entityId);
  if (!payload) throw new Error(`Koji method payload ${entityId} not found`);
  return {
    id: entity.id,
    name: entity.name,
    isBuiltIn: isSystemOwner(entity.ownerId),
    kojiGPerKgRice: payload.kojiGPerKgRice,
    carrier: payload.carrierName,
    carrierRatioGPerG: payload.carrierRatioGPerG,
  };
}

function loadMotoMethod(tx: any, entityId: string) {
  const entity = tx.db.Entity.id.find(entityId);
  if (!entity) throw new Error(`Moto method entity ${entityId} not found`);
  const payload = tx.db.MotoMethod.entityId.find(entityId);
  if (!payload) throw new Error(`Moto method payload ${entityId} not found`);
  return {
    id: entity.id,
    name: entity.name,
    isBuiltIn: isSystemOwner(entity.ownerId),
    riceFrac: payload.riceFrac,
    kojiFrac: payload.kojiFrac,
    waterLPerKg: payload.waterLPerKg,
    yeastPitchRateMPerMl: payload.yeastPitchRateMPerMl,
    acidRefMlPerL: payload.acidRefMlPerL,
    acidRefStrengthPct: payload.acidRefStrengthPct,
  };
}

function loadMoromiMethod(tx: any, entityId: string) {
  const entity = tx.db.Entity.id.find(entityId);
  if (!entity) throw new Error(`Moromi method entity ${entityId} not found`);
  const _payload = tx.db.MoromiMethod.entityId.find(entityId);
  if (!_payload) throw new Error(`Moromi method payload ${entityId} not found`);
  const stages = [...tx.db.MoromiStage.byMoromiMethodEntityId.filter(entityId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
  return {
    id: entity.id,
    name: entity.name,
    isBuiltIn: isSystemOwner(entity.ownerId),
    stages: stages.map((s: any) => ({
      name: s.name,
      ordinal: s.ordinal,
      riceFrac: s.riceFrac,
      kojiFrac: s.kojiFrac,
      waterLPerKg: s.waterLPerKg,
    })),
  };
}

function loadWaterProfile(tx: any, entityId: string | undefined) {
  if (!entityId) return null;
  const entity = tx.db.Entity.id.find(entityId);
  if (!entity) return null;
  const ions = [...tx.db.WaterProfileIon.byWaterProfileEntityId.filter(entityId)];
  return {
    id: entity.id,
    name: entity.name,
    isBuiltIn: isSystemOwner(entity.ownerId),
    ions: ions.map((i: any) => ({ symbol: i.ionSymbol, targetPpm: i.targetPpm })),
  };
}

function loadSchedule(tx: any, methodEntityId: string) {
  const schedules = [...tx.db.ScheduleTable.byMethodEntityId.filter(methodEntityId)];
  if (schedules.length === 0) return null;
  const schedule = schedules[0];
  const events = [...tx.db.ScheduleEvent.byScheduleId.filter(schedule.id)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);

  // Reassemble events into the old step-based structure.
  // Milestones become steps; goal/check/action events attach to the preceding milestone.
  const steps: any[] = [];
  let currentStep: any = null;

  for (const evt of events) {
    const atH = evt.hoursFromStart ?? 0;
    switch (evt.kind.tag) {
      case 'milestone':
        currentStep = {
          key: evt.label.toLowerCase().replace(/[\s/]+/g, '_'),
          label: evt.label,
          atH,
          durationH: evt.durationH,
          notes: evt.note ? [evt.note] : [],
          goals: [],
          checks: [],
          actions: [],
        };
        steps.push(currentStep);
        break;
      case 'goal':
        if (currentStep) currentStep.goals.push({ description: evt.description ?? evt.label });
        break;
      case 'check':
        if (currentStep) currentStep.checks.push({ description: evt.description ?? evt.label });
        break;
      case 'action':
        if (currentStep) currentStep.actions.push({ description: evt.description ?? evt.label });
        break;
    }
  }

  return {
    name: schedule.name,
    workflow: { kind: schedule.workflowKind.tag },
    steps,
  };
}

function loadAllSalts(tx: any) {
  const salts = [...tx.db.MineralSalt.iter()];
  return salts.map((s: any) => ({
    id: s.id,
    name: s.name,
    isBuiltIn: true,
    primaryIon: s.primaryIon,
    contributions: [...tx.db.MineralSaltIon.bySaltId.filter(s.id)].map((i: any) => ({
      ionSymbol: i.ionSymbol,
      massGPerGSalt: i.massGPerGSalt,
    })),
  }));
}

function loadAcid(tx: any, acidId: string | undefined) {
  if (acidId) {
    const row = tx.db.AcidType.id.find(acidId);
    if (row) return { id: row.id, name: row.name, isBuiltIn: true, strengthPct: row.strengthPct, relativeAcidity: row.relativeAcidity };
  }
  const all = [...tx.db.AcidType.iter()];
  if (all.length === 0) throw new Error('No acid types available');
  return { id: all[0].id, name: all[0].name, isBuiltIn: true, strengthPct: all[0].strengthPct, relativeAcidity: all[0].relativeAcidity };
}

function loadAmendments(tx: any, recipeEntityId: string) {
  const rows = [...tx.db.RecipeAmendment.byRecipeEntityId.filter(recipeEntityId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
  return rows.map((a: any) => ({
    kind: a.kind,
    fracOfTotalRice: a.fracOfTotalRice,
    placement: a.placementKind.tag === 'moto'
      ? { where: 'moto' as const }
      : { where: 'moromi' as const, stageOrdinal: a.stageOrdinal },
  }));
}

function resolveRiceVarietyName(tx: any, catalogId: string | undefined): string | undefined {
  if (!catalogId) return undefined;
  const row = tx.db.CatalogRiceVariety.id.find(catalogId);
  return row?.name;
}

function buildBundle(tx: any, entity: any, recipePayload: any) {
  const koji = loadKojiMethod(tx, recipePayload.kojiMethodEntityId);
  const moto = loadMotoMethod(tx, recipePayload.motoMethodEntityId);
  const moromi = loadMoromiMethod(tx, recipePayload.moromiMethodEntityId);
  const waterProfile = loadWaterProfile(tx, recipePayload.waterProfileEntityId);
  const salts = loadAllSalts(tx);
  const acid = loadAcid(tx, recipePayload.recommendedAcidTypeId);
  const amendments = loadAmendments(tx, entity.id);

  const riceVarietyName = resolveRiceVarietyName(tx, recipePayload.recommendedCatalogRiceVarietyId);

  const template = {
    id: entity.id,
    name: entity.name,
    kojiPresetRef: recipePayload.kojiMethodEntityId,
    motoPresetRef: recipePayload.motoMethodEntityId,
    moromiPresetRef: recipePayload.moromiMethodEntityId,
    waterProfileRef: recipePayload.waterProfileEntityId ?? '',
    amendments,
    recommendedRiceVariety: riceVarietyName,
    recommendedPolishPct: recipePayload.recommendedPolishPct,
  };

  const presets = {
    kojiPreset: koji,
    motoPreset: moto,
    moromiPreset: moromi,
    waterProfile,
    availableSalts: salts,
    spec: template,
  };

  const schedules: Record<string, any> = {};
  const kojiSch = loadSchedule(tx, recipePayload.kojiMethodEntityId);
  const motoSch = loadSchedule(tx, recipePayload.motoMethodEntityId);
  const moromiSch = loadSchedule(tx, recipePayload.moromiMethodEntityId);
  if (kojiSch) schedules.koji = kojiSch;
  if (motoSch) schedules.moto = motoSch;
  if (moromiSch) schedules.moromi = moromiSch;

  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    template,
    presets,
    schedules,
    defaultAcid: acid,
    defaults: { targetKind: 'total_rice_kg', targetValue: 5.5 },
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Read procedures ─────────────────────────────────────────────────────────

export const getPublicLibraryEntries = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const all = [...tx.db.Entity.iter()];
    const publicSnapshots = all.filter(
      (e: any) => e.isPublic && e.entityKind.tag === 'snapshot' && e.dataType.tag === 'recipe'
    );

    // Group by lineageRootId, keep first per root
    const byRoot = new Map<string, any>();
    for (const snap of publicSnapshots) {
      if (!byRoot.has(snap.lineageRootId)) {
        byRoot.set(snap.lineageRootId, snap);
      }
    }

    const entries = [...byRoot.values()].map((s: any) => ({
      snapshotId: s.id,
      name: s.name,
      description: s.description,
      version: s.version,
    }));
    return JSON.stringify(entries);
  })
);

export const getRecipeBundle = spacetimedb.procedure(
  { snapshotId: t.string() },
  t.string(),
  (ctx, { snapshotId }) => ctx.withTx(tx => {
    const entity = tx.db.Entity.id.find(snapshotId);
    if (!entity) throw new Error(`Entity ${snapshotId} not found`);
    if (!entity.isPublic) throw new Error('Cannot view a non-public snapshot');
    if (entity.entityKind.tag !== 'snapshot') throw new Error('Not a snapshot');
    if (entity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const payload = tx.db.Recipe.entityId.find(snapshotId);
    if (!payload) throw new Error(`Recipe payload ${snapshotId} not found`);

    return JSON.stringify(buildBundle(tx, entity, payload));
  })
);

export const getMyRecipes = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const senderId = ctx.sender.toHexString();
    const all = [...tx.db.Entity.byOwnerId.filter(senderId)];
    const recipes = all.filter(
      (e: any) => e.entityKind.tag === 'working' && e.dataType.tag === 'recipe'
    );
    return JSON.stringify(recipes.map((r: any) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: tsToIso(r.createdAt),
      updatedAt: tsToIso(r.updatedAt),
    })));
  })
);

export const getMyRecipeBundle = spacetimedb.procedure(
  { recipeId: t.string() },
  t.string(),
  (ctx, { recipeId }) => ctx.withTx(tx => {
    const senderId = ctx.sender.toHexString();
    const entity = tx.db.Entity.id.find(recipeId);
    if (!entity) throw new Error(`Recipe ${recipeId} not found`);
    if (entity.ownerId !== senderId) throw new Error('Not the owner');
    if (entity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const payload = tx.db.Recipe.entityId.find(recipeId);
    if (!payload) throw new Error(`Recipe payload ${recipeId} not found`);

    return JSON.stringify(buildBundle(tx, entity, payload));
  })
);

export const getMyInventory = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const senderId = ctx.sender.toHexString();

    const riceLots = [...tx.db.InventoryRiceLot.byOwnerId.filter(senderId)].map((r: any) => {
      let variety = r.customVarietyName;
      if (r.catalogRiceVarietyId) {
        const cat = tx.db.CatalogRiceVariety.id.find(r.catalogRiceVarietyId);
        if (cat) variety = cat.name;
      }
      return { lotId: r.id, variety: variety ?? 'Unknown', polishPct: r.polishPct, lotLabel: r.lotLabel };
    });

    const kojiStrains = [...tx.db.InventoryKojiSporeLot.byOwnerId.filter(senderId)].map((k: any) => {
      let name = k.customName;
      if (k.catalogKojiSporeProductId) {
        const cat = tx.db.CatalogKojiSporeProduct.id.find(k.catalogKojiSporeProductId);
        if (cat) name = cat.name;
      }
      return { strainId: k.id, name: name ?? 'Unknown' };
    });

    const yeasts = [...tx.db.InventoryYeastStock.byOwnerId.filter(senderId)].map((y: any) => {
      let name = y.customName;
      let format = y.format?.tag;
      if (y.catalogYeastProductId) {
        const cat = tx.db.CatalogYeastProduct.id.find(y.catalogYeastProductId);
        if (cat) {
          name = cat.name;
          if (cat.format) format = cat.format.tag;
        }
      }
      return { yeastId: y.id, name: name ?? 'Unknown', format: format ?? 'liquid_pouch' };
    });

    return JSON.stringify({ riceLots, kojiStrains, yeasts });
  })
);

export const getMyBatches = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const senderId = ctx.sender.toHexString();
    const batches = [...tx.db.Batch.byOwnerId.filter(senderId)];
    return JSON.stringify(batches.map((b: any) => {
      const entity = tx.db.Entity.id.find(b.recipeSnapshotEntityId);
      return {
        id: b.id,
        recipeSnapshotId: b.recipeSnapshotEntityId,
        recipeName: entity?.name ?? 'Unknown',
        status: b.status.tag,
        createdAt: tsToIso(b.createdAt),
        startedAt: b.startedAt ? tsToIso(b.startedAt) : undefined,
        completedAt: b.completedAt ? tsToIso(b.completedAt) : undefined,
        notes: b.notes,
      };
    }));
  })
);

// ── Write procedures ────────────────────────────────────────────────────────

export const copyRecipeSnapshotToRecipe = spacetimedb.procedure(
  { snapshotId: t.string() },
  t.string(),
  (ctx, { snapshotId }) => ctx.withTx(tx => {
    const sourceEntity = tx.db.Entity.id.find(snapshotId);
    if (!sourceEntity) throw new Error(`Snapshot ${snapshotId} not found`);
    if (!sourceEntity.isPublic) throw new Error('Cannot copy a non-public snapshot');
    if (sourceEntity.entityKind.tag !== 'snapshot') throw new Error('Not a snapshot');
    if (sourceEntity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const sourcePayload = tx.db.Recipe.entityId.find(snapshotId);
    if (!sourcePayload) throw new Error(`Recipe payload ${snapshotId} not found`);

    const newEntityId = tx.newUuidV4().toString();
    const now = tx.timestamp;
    const senderId = tx.sender.toHexString();

    tx.db.Entity.insert({
      id: newEntityId,
      ownerId: senderId,
      dataType: { tag: 'recipe' },
      entityKind: { tag: 'working' },
      name: sourceEntity.name,
      description: sourceEntity.description,
      version: undefined,
      isPublic: false,
      isArchived: false,
      lineageRootId: newEntityId,
      parentEntityId: snapshotId,
      provenanceKind: { tag: 'copied_from_public' },
      provenanceEntityId: snapshotId,
      createdAt: now,
      updatedAt: now,
    });

    tx.db.Recipe.insert({
      entityId: newEntityId,
      kojiMethodEntityId: sourcePayload.kojiMethodEntityId,
      motoMethodEntityId: sourcePayload.motoMethodEntityId,
      moromiMethodEntityId: sourcePayload.moromiMethodEntityId,
      waterProfileEntityId: sourcePayload.waterProfileEntityId,
      recommendedCatalogRiceVarietyId: sourcePayload.recommendedCatalogRiceVarietyId,
      recommendedPolishPct: sourcePayload.recommendedPolishPct,
      recommendedAcidTypeId: sourcePayload.recommendedAcidTypeId,
      recommendedYeastProductId: sourcePayload.recommendedYeastProductId,
    });

    // Copy amendments
    const amendments = [...tx.db.RecipeAmendment.byRecipeEntityId.filter(snapshotId)];
    for (const a of amendments) {
      tx.db.RecipeAmendment.insert({
        id: tx.newUuidV4().toString(),
        recipeEntityId: newEntityId,
        ordinal: a.ordinal,
        kind: a.kind,
        fracOfTotalRice: a.fracOfTotalRice,
        placementKind: a.placementKind,
        stageOrdinal: a.stageOrdinal,
      });
    }

    return JSON.stringify({ recipeId: newEntityId });
  })
);

export const createBatch = spacetimedb.procedure(
  { recipeId: t.string(), selections: t.string(), version: t.option(t.string()) },
  t.string(),
  (ctx, { recipeId, selections: selectionsJson, version }) => ctx.withTx(tx => {
    const senderId = tx.sender.toHexString();
    const recipeEntity = tx.db.Entity.id.find(recipeId);
    if (!recipeEntity) throw new Error(`Recipe ${recipeId} not found`);
    if (recipeEntity.ownerId !== senderId) throw new Error('Not the owner');
    if (recipeEntity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const recipePayload = tx.db.Recipe.entityId.find(recipeId);
    if (!recipePayload) throw new Error(`Recipe payload ${recipeId} not found`);

    // TODO: parse and apply selections when batch selection fields are implemented
    // const parsedSelections = JSON.parse(selectionsJson);
    const now = tx.timestamp;
    const snapshotId = tx.newUuidV4().toString();
    const batchId = tx.newUuidV4().toString();
    const snapshotVersion = version ?? '1.0.0';

    // Create snapshot entity (copy of working recipe)
    tx.db.Entity.insert({
      id: snapshotId,
      ownerId: senderId,
      dataType: { tag: 'recipe' },
      entityKind: { tag: 'snapshot' },
      name: recipeEntity.name,
      description: recipeEntity.description,
      version: snapshotVersion,
      isPublic: false,
      isArchived: false,
      lineageRootId: recipeEntity.lineageRootId,
      parentEntityId: recipeId,
      provenanceKind: recipeEntity.provenanceKind,
      provenanceEntityId: recipeEntity.provenanceEntityId,
      createdAt: now,
      updatedAt: now,
    });

    // Copy recipe payload
    tx.db.Recipe.insert({
      entityId: snapshotId,
      kojiMethodEntityId: recipePayload.kojiMethodEntityId,
      motoMethodEntityId: recipePayload.motoMethodEntityId,
      moromiMethodEntityId: recipePayload.moromiMethodEntityId,
      waterProfileEntityId: recipePayload.waterProfileEntityId,
      recommendedCatalogRiceVarietyId: recipePayload.recommendedCatalogRiceVarietyId,
      recommendedPolishPct: recipePayload.recommendedPolishPct,
      recommendedAcidTypeId: recipePayload.recommendedAcidTypeId,
      recommendedYeastProductId: recipePayload.recommendedYeastProductId,
    });

    // Copy amendments
    const amendments = [...tx.db.RecipeAmendment.byRecipeEntityId.filter(recipeId)];
    for (const a of amendments) {
      tx.db.RecipeAmendment.insert({
        id: tx.newUuidV4().toString(),
        recipeEntityId: snapshotId,
        ordinal: a.ordinal,
        kind: a.kind,
        fracOfTotalRice: a.fracOfTotalRice,
        placementKind: a.placementKind,
        stageOrdinal: a.stageOrdinal,
      });
    }

    // Create batch (selection/override fields TBD)
    tx.db.Batch.insert({
      id: batchId,
      ownerId: senderId,
      recipeSnapshotEntityId: snapshotId,
      name: recipeEntity.name,
      status: { tag: 'planned' },
      startedAt: undefined,
      completedAt: undefined,
      notes: undefined,
      createdAt: now,
      updatedAt: now,
    });

    return JSON.stringify({ batchId, snapshotId });
  })
);

// ── Reducers ────────────────────────────────────────────────────────────────

export const deleteRecipe = spacetimedb.reducer(
  { recipeId: t.string() },
  (ctx, { recipeId }) => {
    const entity = ctx.db.Entity.id.find(recipeId);
    if (!entity) throw new Error(`Recipe ${recipeId} not found`);
    if (entity.ownerId !== ctx.sender.toHexString()) throw new Error('Not the owner');
    if (entity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    // Delete children
    const amendments = [...ctx.db.RecipeAmendment.byRecipeEntityId.filter(recipeId)];
    for (const a of amendments) {
      ctx.db.RecipeAmendment.id.delete(a.id);
    }

    // Delete payload
    ctx.db.Recipe.entityId.delete(recipeId);

    // Delete entity
    ctx.db.Entity.id.delete(recipeId);
  }
);

// ── Seed demo data ──────────────────────────────────────────────────────────

export const seedDemoData = spacetimedb.reducer(
  (ctx) => {
    const now = ctx.timestamp;
    const systemOwner = '__system__';

    // ── 1. Catalog entries ──────────────────────────────────────────────────

    // Rice varieties
    const riceYamada = 'cat-rice-yamadanishiki';
    if (!ctx.db.CatalogRiceVariety.id.find(riceYamada)) {
      ctx.db.CatalogRiceVariety.insert({ id: riceYamada, name: 'Yamadanishiki', region: 'Hyogo', description: undefined });
    }
    const riceGohyaku = 'cat-rice-gohyakumangoku';
    if (!ctx.db.CatalogRiceVariety.id.find(riceGohyaku)) {
      ctx.db.CatalogRiceVariety.insert({ id: riceGohyaku, name: 'Gohyakumangoku', region: 'Niigata', description: undefined });
    }

    // Yeast products
    const yeastWl707 = 'cat-yeast-wl707';
    if (!ctx.db.CatalogYeastProduct.id.find(yeastWl707)) {
      ctx.db.CatalogYeastProduct.insert({ id: yeastWl707, name: 'WL707', format: { tag: 'liquid_pouch' }, supplier: 'White Labs', description: undefined });
    }
    const yeastK7 = 'cat-yeast-k7-dry';
    if (!ctx.db.CatalogYeastProduct.id.find(yeastK7)) {
      ctx.db.CatalogYeastProduct.insert({ id: yeastK7, name: 'K7 Dry', format: { tag: 'dry' }, supplier: undefined, description: undefined });
    }

    // Koji spore products
    const sporeA1 = 'cat-koji-konno-a1';
    if (!ctx.db.CatalogKojiSporeProduct.id.find(sporeA1)) {
      ctx.db.CatalogKojiSporeProduct.insert({ id: sporeA1, name: 'Akita Konno A-1', supplier: undefined, description: undefined });
    }
    const sporeHishi = 'cat-koji-hishiroku';
    if (!ctx.db.CatalogKojiSporeProduct.id.find(sporeHishi)) {
      ctx.db.CatalogKojiSporeProduct.insert({ id: sporeHishi, name: 'Hishiroku Moyashi', supplier: undefined, description: undefined });
    }

    // Acid types
    const acidId = 'acid-lactic-88';
    if (!ctx.db.AcidType.id.find(acidId)) {
      ctx.db.AcidType.insert({ id: acidId, name: 'Lactic 88%', strengthPct: 88, relativeAcidity: 1.0 });
    }

    // Mineral salts
    const salts = [
      { id: 'salt-mgso4', name: 'MgSO4·7H2O (Epsom Salt)', primaryIon: 'Mg', ions: [{ ionSymbol: 'Mg', massGPerGSalt: 24.31 / 246.47 }, { ionSymbol: 'SO4', massGPerGSalt: 96.06 / 246.47 }] },
      { id: 'salt-nacl', name: 'NaCl (Table Salt)', primaryIon: 'Na', ions: [{ ionSymbol: 'Na', massGPerGSalt: 22.99 / 58.44 }, { ionSymbol: 'Cl', massGPerGSalt: 35.45 / 58.44 }] },
      { id: 'salt-kh2po4', name: 'KH2PO4 (Monopotassium Phosphate)', primaryIon: 'PO4', ions: [{ ionSymbol: 'K', massGPerGSalt: 39.10 / 136.09 }, { ionSymbol: 'PO4', massGPerGSalt: 94.97 / 136.09 }] },
      { id: 'salt-caso4', name: 'CaSO4 (Gypsum)', primaryIon: 'Ca', ions: [{ ionSymbol: 'Ca', massGPerGSalt: 40.08 / 136.14 }, { ionSymbol: 'SO4', massGPerGSalt: 96.06 / 136.14 }] },
      { id: 'salt-cacl2', name: 'CaCl2 (Calcium Chloride)', primaryIon: 'Ca', ions: [{ ionSymbol: 'Ca', massGPerGSalt: 40.08 / 110.98 }, { ionSymbol: 'Cl', massGPerGSalt: 70.90 / 110.98 }] },
      { id: 'salt-kcl', name: 'KCl (Potassium Chloride)', primaryIon: 'K', ions: [{ ionSymbol: 'K', massGPerGSalt: 39.10 / 74.55 }, { ionSymbol: 'Cl', massGPerGSalt: 35.45 / 74.55 }] },
      { id: 'salt-k2so4', name: 'K2SO4 (Potassium Sulfate)', primaryIon: 'K', ions: [{ ionSymbol: 'K', massGPerGSalt: 78.20 / 174.26 }, { ionSymbol: 'SO4', massGPerGSalt: 96.06 / 174.26 }] },
    ];

    for (const salt of salts) {
      if (!ctx.db.MineralSalt.id.find(salt.id)) {
        ctx.db.MineralSalt.insert({ id: salt.id, name: salt.name, primaryIon: salt.primaryIon });
        for (const ion of salt.ions) {
          ctx.db.MineralSaltIon.insert({
            id: ctx.newUuidV4().toString(),
            saltId: salt.id,
            ionSymbol: ion.ionSymbol,
            massGPerGSalt: ion.massGPerGSalt,
          });
        }
      }
    }

    // ── 2. Water profile entity ─────────────────────────────────────────────

    const waterEntityId = 'ent-water-ginjo-1';
    if (!ctx.db.Entity.id.find(waterEntityId)) {
      ctx.db.Entity.insert({
        id: waterEntityId, ownerId: systemOwner,
        dataType: { tag: 'water_profile' }, entityKind: { tag: 'snapshot' },
        name: 'Ginjo 1', description: undefined, version: '1.0.0',
        isPublic: true, isArchived: false,
        lineageRootId: waterEntityId, parentEntityId: undefined,
        provenanceKind: { tag: 'original' }, provenanceEntityId: undefined,
        createdAt: now, updatedAt: now,
      });
      ctx.db.WaterProfile.insert({ entityId: waterEntityId, notes: undefined });
      ctx.db.WaterProfileIon.insert({ id: ctx.newUuidV4().toString(), waterProfileEntityId: waterEntityId, ionSymbol: 'Ca', targetPpm: 10 });
      ctx.db.WaterProfileIon.insert({ id: ctx.newUuidV4().toString(), waterProfileEntityId: waterEntityId, ionSymbol: 'Mg', targetPpm: 3 });
    }

    // ── 3. Method entities ──────────────────────────────────────────────────

    // Koji method
    const kojiEntityId = 'ent-method-koji-ueda';
    if (!ctx.db.Entity.id.find(kojiEntityId)) {
      ctx.db.Entity.insert({
        id: kojiEntityId, ownerId: systemOwner,
        dataType: { tag: 'koji_method' }, entityKind: { tag: 'snapshot' },
        name: 'Ueda Koji Method', description: undefined, version: '1.0.0',
        isPublic: true, isArchived: false,
        lineageRootId: kojiEntityId, parentEntityId: undefined,
        provenanceKind: { tag: 'original' }, provenanceEntityId: undefined,
        createdAt: now, updatedAt: now,
      });
      ctx.db.KojiMethod.insert({
        entityId: kojiEntityId, kojiGPerKgRice: 0.08,
        carrierName: 'Toasted Rice Flour', carrierRatioGPerG: 5,
      });

      // Koji schedule
      const kojiSchedId = ctx.newUuidV4().toString();
      ctx.db.ScheduleTable.insert({ id: kojiSchedId, methodEntityId: kojiEntityId, workflowKind: { tag: 'koji' }, name: 'Ueda Koji Schedule' });

      const kojiSteps = [
        { label: 'Soak + Drain Rest', atH: 0, durationH: 4, goals: ['Target 29–32% weight gain by end of soak/drain period'], checks: [] as string[], actions: ['Soak rice to target absorption, drain, then rest to allow moisture to distribute evenly'] },
        { label: 'Steam Rice', atH: 4, durationH: 1, goals: ['Target 42–43% post-steam weight gain (40–44% acceptable)'], checks: [] as string[], actions: ['Steam thoroughly until grains are evenly gelatinized through the center'] },
        { label: 'Hiki-komi / Drying', atH: 5, durationH: 3, goals: ['Dry rice down to 28–31% weight gain before inoculation', 'For a first run with a new rice, aim for 29–30%'], checks: ['Keep rice spread out for even drying', 'Use ~37–40°C chamber heat; up to 45°C is acceptable in an oven', 'Avoid prolonged exposure above 50°C'], actions: ['Dry steamed rice on racks in a warm, ventilated chamber or low-temp oven until target weight is reached'] },
        { label: 'Tane-kiri / Inoculation', atH: 8, durationH: undefined as number | undefined, goals: ['Rice will typically end around 29–30% after tane-kiri'], checks: ['Rice must be at or below 40°C before inoculation', 'Distribute spores as evenly as possible'], actions: ['Measure and dilute starter as needed, then shake evenly over rice while breaking up clumps and turning rice'] },
        { label: 'Momi-age / Germination', atH: 8, durationH: 18, goals: ['Chamber target: 32°C', 'Koji target at start: 32°C', 'Expected weight ratio: 28–29%'], checks: ['Use sanitized tubs with lids loosely placed to retain rice moisture', 'Do not add extra humidity to the chamber'], actions: ['Divide rice into tubs, record weights, loosely cover, and hold at 32°C for germination'] },
        { label: 'Mori / Heaping', atH: 26, durationH: 6, goals: ['Weight should remain stable, with less than 0.5% drop', 'Koji temp target at start: 32.5–34°C', 'Chamber target: 32°C'], checks: ['Proceed to naka when surface haze reaches roughly 10–20%'], actions: ['Break up any clumps, stir lightly, record weight, and crack lid slightly for oxygen'] },
        { label: 'Naka-shigoto / Middle Work', atH: 32, durationH: 6, goals: ['Weight should remain stable, with less than 0.5% drop', 'Koji temp target at start: 34–35°C', 'Chamber target: 33–34°C'], checks: ['Proceed to shimai when surface haze reaches roughly 30–40%'], actions: ['Mix lightly, break up clumps so grains are loose again, and record weight'] },
        { label: 'Shimai-shigoto / Final Work', atH: 38, durationH: undefined as number | undefined, goals: ['Ideal timing is around 38.5°C koji temperature', 'Koji temp target at start: 38–39°C', 'Chamber target: 35–36°C'], checks: ['Once koji reaches 40°C, or at shimai, remove lid and cover tub with a clean dry cotton towel'], actions: ['Mix thoroughly so grains are separated, record weight, then transition from lid to dry towel cover'] },
        { label: 'Peak Temperature Hold', atH: 42, durationH: undefined as number | undefined, goals: ['Target peak koji temperature: 40–41°C for a typical batch', 'Acceptable overall peak range: 40–43°C depending on strain and goals', 'Maintain near peak until de-koji'], checks: ['Start de-koji timing once peak temperature is reached', 'If temperature overshoots, mix and/or lower chamber by 1–2°C', 'Do not remove towel during correction or rice may dry too quickly'], actions: ['Hold near peak temperature and monitor for stability'] },
        { label: 'De-koji', atH: 50, durationH: undefined as number | undefined, goals: ['Typical finish is 48–50 hours from tane-kiri', 'Final weight ratio often lands around 13–17%, though 10–20% is acceptable'], checks: ['Usually finish 10–18 hours after peak temperature is reached', 'Cool in a dry place or fridge, but do not seal immediately to avoid condensation'], actions: ['Remove koji from chamber, record final weight, and cool gradually'] },
      ];

      let ord = 0;
      for (const step of kojiSteps) {
        ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId: kojiSchedId, ordinal: ord++, kind: { tag: 'milestone' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: step.label, description: undefined, durationH: step.durationH, note: undefined });
        for (const g of step.goals) {
          ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId: kojiSchedId, ordinal: ord++, kind: { tag: 'goal' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: g, description: g, durationH: undefined, note: undefined });
        }
        for (const c of step.checks) {
          ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId: kojiSchedId, ordinal: ord++, kind: { tag: 'check' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: c, description: c, durationH: undefined, note: undefined });
        }
        for (const a of step.actions) {
          ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId: kojiSchedId, ordinal: ord++, kind: { tag: 'action' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: a, description: a, durationH: undefined, note: undefined });
        }
      }
    }

    // Moto method
    const motoEntityId = 'ent-method-moto-sokujo';
    if (!ctx.db.Entity.id.find(motoEntityId)) {
      ctx.db.Entity.insert({
        id: motoEntityId, ownerId: systemOwner,
        dataType: { tag: 'moto_method' }, entityKind: { tag: 'snapshot' },
        name: 'Sokujo Moto Method', description: undefined, version: '1.0.0',
        isPublic: true, isArchived: false,
        lineageRootId: motoEntityId, parentEntityId: undefined,
        provenanceKind: { tag: 'original' }, provenanceEntityId: undefined,
        createdAt: now, updatedAt: now,
      });
      ctx.db.MotoMethod.insert({
        entityId: motoEntityId,
        riceFrac: 0.07, kojiFrac: 0.3, waterLPerKg: 1.07,
        yeastPitchRateMPerMl: 3, acidRefMlPerL: 0.03, acidRefStrengthPct: 88,
      });

      // Moto schedule
      const motoSchedId = ctx.newUuidV4().toString();
      ctx.db.ScheduleTable.insert({ id: motoSchedId, methodEntityId: motoEntityId, workflowKind: { tag: 'moto' }, name: 'Sokujo Moto Schedule' });

      const motoSteps = [
        { label: 'Prepare Moto Water', atH: 0, durationH: 1, goals: ['Water treated and at target temperature'], checks: [] as string[], actions: ['Measure water, add mineral salts and lactic acid, mix thoroughly'] },
        { label: 'Combine Koji, Water, and Yeast', atH: 1, durationH: undefined as number | undefined, goals: ['Koji hydrated and yeast pitched'], checks: [] as string[], actions: ['Add koji to treated water, stir to break up clumps', 'Pitch yeast into the mixture'] },
        { label: 'Add Kake Rice', atH: 2, durationH: undefined as number | undefined, goals: ['Steamed kake rice incorporated into moto'], checks: [] as string[], actions: ['Add cooled steamed rice, mix evenly into koji-water mixture'] },
        { label: 'Fermentation', atH: 2, durationH: 336, goals: ['Active fermentation with yeast propagation'], checks: ['Stir once or twice daily for the first few days', 'Monitor temperature and aroma for healthy fermentation signs'], actions: [] as string[] },
        { label: 'Moto Ready', atH: 338, durationH: undefined as number | undefined, goals: ['Moto is mature and ready for moromi build'], checks: ['Confirm healthy yeast population before proceeding to soe'], actions: [] as string[] },
      ];

      let ord = 0;
      for (const step of motoSteps) {
        ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId: motoSchedId, ordinal: ord++, kind: { tag: 'milestone' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: step.label, description: undefined, durationH: step.durationH, note: undefined });
        for (const g of step.goals) {
          ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId: motoSchedId, ordinal: ord++, kind: { tag: 'goal' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: g, description: g, durationH: undefined, note: undefined });
        }
        for (const c of step.checks) {
          ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId: motoSchedId, ordinal: ord++, kind: { tag: 'check' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: c, description: c, durationH: undefined, note: undefined });
        }
        for (const a of step.actions) {
          ctx.db.ScheduleEvent.insert({ id: ctx.newUuidV4().toString(), scheduleId: motoSchedId, ordinal: ord++, kind: { tag: 'action' }, timingKind: { tag: 'absolute' }, hoursFromStart: step.atH, stageOrdinal: undefined, offsetHours: undefined, label: a, description: a, durationH: undefined, note: undefined });
        }
      }
    }

    // Moromi method
    const moromiEntityId = 'ent-method-moromi-sandan';
    if (!ctx.db.Entity.id.find(moromiEntityId)) {
      ctx.db.Entity.insert({
        id: moromiEntityId, ownerId: systemOwner,
        dataType: { tag: 'moromi_method' }, entityKind: { tag: 'snapshot' },
        name: 'Sandan Moromi Method', description: undefined, version: '1.0.0',
        isPublic: true, isArchived: false,
        lineageRootId: moromiEntityId, parentEntityId: undefined,
        provenanceKind: { tag: 'original' }, provenanceEntityId: undefined,
        createdAt: now, updatedAt: now,
      });
      ctx.db.MoromiMethod.insert({ entityId: moromiEntityId, notes: undefined });
      ctx.db.MoromiStage.insert({ id: ctx.newUuidV4().toString(), moromiMethodEntityId: moromiEntityId, ordinal: 1, name: 'Soe', riceFrac: 0.15, kojiFrac: 0.28, waterLPerKg: 0.92 });
      ctx.db.MoromiStage.insert({ id: ctx.newUuidV4().toString(), moromiMethodEntityId: moromiEntityId, ordinal: 2, name: 'Naka', riceFrac: 0.3, kojiFrac: 0.21, waterLPerKg: 1.2 });
      ctx.db.MoromiStage.insert({ id: ctx.newUuidV4().toString(), moromiMethodEntityId: moromiEntityId, ordinal: 3, name: 'Tome', riceFrac: 0.48, kojiFrac: 0.21, waterLPerKg: 1.2 });
    }

    // ── 4. Inventory entries ────────────────────────────────────────────────

    const invOwner = systemOwner;

    const riceLots = [
      { id: 'inv-lot-yamada-60', catId: riceYamada, polishPct: 60, lotLabel: 'Lot A' },
      { id: 'inv-lot-yamada-70', catId: riceYamada, polishPct: 70, lotLabel: 'Lot B' },
      { id: 'inv-lot-gohyaku-50', catId: riceGohyaku, polishPct: 50, lotLabel: 'Lot C' },
    ];
    for (const lot of riceLots) {
      if (!ctx.db.InventoryRiceLot.id.find(lot.id)) {
        ctx.db.InventoryRiceLot.insert({
          id: lot.id, ownerId: invOwner,
          catalogRiceVarietyId: lot.catId, customVarietyName: undefined,
          polishPct: lot.polishPct, lotLabel: lot.lotLabel,
          massKgAvailable: undefined, createdAt: now, updatedAt: now,
        });
      }
    }

    const kojiSpores = [
      { id: 'inv-koji-konno-a1', catId: sporeA1 },
      { id: 'inv-koji-hishiroku', catId: sporeHishi },
    ];
    for (const spore of kojiSpores) {
      if (!ctx.db.InventoryKojiSporeLot.id.find(spore.id)) {
        ctx.db.InventoryKojiSporeLot.insert({
          id: spore.id, ownerId: invOwner,
          catalogKojiSporeProductId: spore.catId, customName: undefined,
          createdAt: now, updatedAt: now,
        });
      }
    }

    const yeastStocks = [
      { id: 'inv-yeast-wl707', catId: yeastWl707 },
      { id: 'inv-yeast-k7-dry', catId: yeastK7 },
    ];
    for (const stock of yeastStocks) {
      if (!ctx.db.InventoryYeastStock.id.find(stock.id)) {
        ctx.db.InventoryYeastStock.insert({
          id: stock.id, ownerId: invOwner,
          catalogYeastProductId: stock.catId, customName: undefined,
          format: undefined, createdAt: now, updatedAt: now,
        });
      }
    }

    // ── 5. Recipe snapshot entity (public library entry) ────────────────────

    const recipeSnapshotId = 'ent-recipe-sakura-ginjo-snap';
    if (!ctx.db.Entity.id.find(recipeSnapshotId)) {
      ctx.db.Entity.insert({
        id: recipeSnapshotId, ownerId: systemOwner,
        dataType: { tag: 'recipe' }, entityKind: { tag: 'snapshot' },
        name: 'Sakura Ginjo',
        description: 'A light ginjo-style sake with delicate sakura petal additions during soe. Uses sokujo moto with sandan moromi build and soft ginjo water profile.',
        version: '1.0.0',
        isPublic: true, isArchived: false,
        lineageRootId: recipeSnapshotId, parentEntityId: undefined,
        provenanceKind: { tag: 'original' }, provenanceEntityId: undefined,
        createdAt: now, updatedAt: now,
      });

      ctx.db.Recipe.insert({
        entityId: recipeSnapshotId,
        kojiMethodEntityId: kojiEntityId,
        motoMethodEntityId: motoEntityId,
        moromiMethodEntityId: moromiEntityId,
        waterProfileEntityId: waterEntityId,
        recommendedCatalogRiceVarietyId: riceYamada,
        recommendedPolishPct: 60,
        recommendedAcidTypeId: acidId,
        recommendedYeastProductId: undefined,
      });

      ctx.db.RecipeAmendment.insert({
        id: ctx.newUuidV4().toString(),
        recipeEntityId: recipeSnapshotId,
        ordinal: 1,
        kind: 'Sakura Petals',
        fracOfTotalRice: 0.0005,
        placementKind: { tag: 'moromi_stage' },
        stageOrdinal: 1,
      });
    }
  }
);
