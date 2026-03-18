import { t } from 'spacetimedb/server';
import spacetimedb from './schema';
import { seedDemoData as seedDemoDataFn } from './seed/seedData';

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

// ── Generic process loaders ─────────────────────────────────────────────────

function loadProcessEntity(tx: any, entityId: string) {
  const entity = tx.db.Entity.id.find(entityId);
  if (!entity) throw new Error(`Process entity ${entityId} not found`);
  const process = tx.db.Process.entityId.find(entityId);
  if (!process) throw new Error(`Process payload ${entityId} not found`);
  return { entity, process };
}

function loadProcessParamMap(tx: any, entityId: string): Map<string, number | string | boolean> {
  const rows = [...tx.db.ProcessParamSpec.byProcessEntityId.filter(entityId)];
  const map = new Map<string, number | string | boolean>();
  for (const r of rows) {
    switch (r.valueType.tag) {
      case 'number': if (r.defaultNumberValue != null) map.set(r.key, r.defaultNumberValue); break;
      case 'text': if (r.defaultTextValue != null) map.set(r.key, r.defaultTextValue); break;
      case 'boolean': if (r.defaultBoolValue != null) map.set(r.key, r.defaultBoolValue); break;
    }
  }
  return map;
}

function loadProcessStages(tx: any, entityId: string) {
  return [...tx.db.ProcessStageSpec.byProcessEntityId.filter(entityId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
}

function loadProcessMaterialSlots(tx: any, entityId: string) {
  return [...tx.db.ProcessMaterialSlotSpec.byProcessEntityId.filter(entityId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
}

function loadRecipeProcessUses(tx: any, recipeEntityId: string) {
  return [...tx.db.RecipeProcessUse.byRecipeEntityId.filter(recipeEntityId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
}

function loadRecipeMaterialSpecs(tx: any, recipeEntityId: string) {
  return [...tx.db.RecipeMaterialSpec.byRecipeEntityId.filter(recipeEntityId)];
}

function loadRecipeMaterialBindings(tx: any, rpuId: string) {
  return [...tx.db.RecipeProcessMaterialBinding.byRecipeProcessUseId.filter(rpuId)];
}

// ── Compatibility projection helpers ────────────────────────────────────────

function projectKojiPresetFromProcess(entity: any, paramMap: Map<string, number | string | boolean>) {
  return {
    id: entity.id,
    name: entity.name,
    isBuiltIn: isSystemOwner(entity.ownerId),
    kojiGPerKgRice: (paramMap.get('koji_g_per_kg_rice') ?? 0) as number,
    carrier: (paramMap.get('carrier_name') ?? '') as string,
    carrierRatioGPerG: (paramMap.get('carrier_ratio_g_per_g') ?? 0) as number,
  };
}

function projectMotoPresetFromProcess(entity: any, paramMap: Map<string, number | string | boolean>) {
  return {
    id: entity.id,
    name: entity.name,
    isBuiltIn: isSystemOwner(entity.ownerId),
    riceFrac: (paramMap.get('rice_frac') ?? 0) as number,
    kojiFrac: (paramMap.get('koji_frac') ?? 0) as number,
    waterLPerKg: (paramMap.get('water_l_per_kg') ?? 0) as number,
    yeastPitchRateMPerMl: (paramMap.get('yeast_pitch_rate_m_per_ml') ?? 0) as number,
    acidRefMlPerL: (paramMap.get('acid_ref_ml_per_l') ?? 0) as number,
    acidRefStrengthPct: (paramMap.get('acid_ref_strength_pct') ?? 0) as number,
  };
}

function projectMoromiPresetFromProcess(entity: any, stages: any[], materialSlots: any[]) {
  const materialStages = stages
    .filter((s: any) => s.materialOrdinal != null)
    .sort((a: any, b: any) => a.materialOrdinal - b.materialOrdinal);

  return {
    id: entity.id,
    name: entity.name,
    isBuiltIn: isSystemOwner(entity.ownerId),
    stages: materialStages.map((stage: any) => {
      const stageSlots = materialSlots.filter((s: any) => s.stageSpecId === stage.id);
      const riceSlot = stageSlots.find((s: any) => s.key === 'rice');
      const kojiSlot = stageSlots.find((s: any) => s.key === 'koji');
      const waterSlot = stageSlots.find((s: any) => s.key === 'water');
      return {
        name: stage.label,
        ordinal: stage.materialOrdinal,
        riceFrac: riceSlot?.quantityValue ?? 0,
        kojiFrac: kojiSlot?.quantityValue ?? 0,
        waterLPerKg: waterSlot?.quantityValue ?? 0,
      };
    }),
  };
}

function projectRecipeAmendmentsCompat(tx: any, processUses: any[]) {
  const amendments: any[] = [];
  for (const pu of processUses) {
    const { process } = loadProcessEntity(tx, pu.processSnapshotEntityId);
    const bindings = loadRecipeMaterialBindings(tx, pu.id);
    for (const binding of bindings) {
      const materialSpec = tx.db.RecipeMaterialSpec.id.find(binding.recipeMaterialSpecId);
      if (!materialSpec || materialSpec.materialClass.tag !== 'adjunct') continue;

      const slotSpec = tx.db.ProcessMaterialSlotSpec.id.find(binding.processMaterialSlotSpecId);
      if (!slotSpec) continue;

      const fracOfTotalRice = binding.quantityOverride ?? slotSpec.quantityValue ?? 0;

      let placement: any;
      if (process.processKind.tag === 'moto') {
        placement = { where: 'moto' as const };
      } else {
        const stage = slotSpec.stageSpecId ? tx.db.ProcessStageSpec.id.find(slotSpec.stageSpecId) : null;
        placement = { where: 'moromi' as const, stageOrdinal: stage?.materialOrdinal ?? 1 };
      }

      amendments.push({ kind: materialSpec.label, fracOfTotalRice, placement });
    }
  }
  return amendments;
}

// ── Shared data loaders ─────────────────────────────────────────────────────

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

function loadSchedule(tx: any, processEntityId: string) {
  const schedules = [...tx.db.ScheduleTable.byProcessEntityId.filter(processEntityId)];
  if (schedules.length === 0) return null;
  const schedule = schedules[0];
  const events = [...tx.db.ScheduleEvent.byScheduleId.filter(schedule.id)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);

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

function loadAcid(tx: any) {
  const all = [...tx.db.AcidType.iter()];
  if (all.length === 0) throw new Error('No acid types available');
  return { id: all[0].id, name: all[0].name, isBuiltIn: true, strengthPct: all[0].strengthPct, relativeAcidity: all[0].relativeAcidity };
}

// ── Bundle builder ──────────────────────────────────────────────────────────

function buildBundle(tx: any, entity: any, recipePayload: any) {
  const processUses = loadRecipeProcessUses(tx, entity.id);

  let kojiData: any, motoData: any, moromiData: any;
  for (const pu of processUses) {
    const { entity: procEntity, process } = loadProcessEntity(tx, pu.processSnapshotEntityId);
    switch (process.processKind.tag) {
      case 'koji': kojiData = { pu, entity: procEntity }; break;
      case 'moto': motoData = { pu, entity: procEntity }; break;
      case 'moromi': moromiData = { pu, entity: procEntity }; break;
    }
  }
  if (!kojiData || !motoData || !moromiData) throw new Error('Recipe missing required processes');

  const kojiParamMap = loadProcessParamMap(tx, kojiData.entity.id);
  const motoParamMap = loadProcessParamMap(tx, motoData.entity.id);
  const moromiStages = loadProcessStages(tx, moromiData.entity.id);
  const moromiSlots = loadProcessMaterialSlots(tx, moromiData.entity.id);

  const koji = projectKojiPresetFromProcess(kojiData.entity, kojiParamMap);
  const moto = projectMotoPresetFromProcess(motoData.entity, motoParamMap);
  const moromi = projectMoromiPresetFromProcess(moromiData.entity, moromiStages, moromiSlots);
  const waterProfile = loadWaterProfile(tx, recipePayload.defaultWaterProfileEntityId);
  const salts = loadAllSalts(tx);
  const acid = loadAcid(tx);
  const amendments = projectRecipeAmendmentsCompat(tx, processUses);

  const template = {
    id: entity.id,
    name: entity.name,
    kojiPresetRef: kojiData.pu.processSnapshotEntityId,
    motoPresetRef: motoData.pu.processSnapshotEntityId,
    moromiPresetRef: moromiData.pu.processSnapshotEntityId,
    waterProfileRef: recipePayload.defaultWaterProfileEntityId ?? '',
    amendments,
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
  const kojiSch = loadSchedule(tx, kojiData.pu.processSnapshotEntityId);
  const motoSch = loadSchedule(tx, motoData.pu.processSnapshotEntityId);
  const moromiSch = loadSchedule(tx, moromiData.pu.processSnapshotEntityId);
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
    // Filter out recipes attached to a batch
    const unattached = recipes.filter((r: any) => {
      const payload = tx.db.Recipe.entityId.find(r.id);
      return !payload?.attachedBatchId;
    });
    return JSON.stringify(unattached.map((r: any) => ({
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

    // Copy Entity
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

    // Copy Recipe
    tx.db.Recipe.insert({
      entityId: newEntityId,
      defaultWaterProfileEntityId: sourcePayload.defaultWaterProfileEntityId,
      attachedBatchId: undefined,
      notes: sourcePayload.notes,
    });

    // Copy RecipeProcessUse rows with ID remapping
    const sourceRpus = loadRecipeProcessUses(tx, snapshotId);
    const rpuIdMap = new Map<string, string>();
    for (const rpu of sourceRpus) {
      const newRpuId = tx.newUuidV4().toString();
      rpuIdMap.set(rpu.id, newRpuId);
      tx.db.RecipeProcessUse.insert({
        id: newRpuId,
        recipeEntityId: newEntityId,
        ordinal: rpu.ordinal,
        label: rpu.label,
        processSnapshotEntityId: rpu.processSnapshotEntityId,
        notes: rpu.notes,
      });
    }

    // Copy RecipeMaterialSpec rows with ID remapping
    const sourceRms = loadRecipeMaterialSpecs(tx, snapshotId);
    const rmsIdMap = new Map<string, string>();
    for (const rms of sourceRms) {
      const newRmsId = tx.newUuidV4().toString();
      rmsIdMap.set(rms.id, newRmsId);
      tx.db.RecipeMaterialSpec.insert({
        id: newRmsId,
        recipeEntityId: newEntityId,
        key: rms.key,
        label: rms.label,
        materialClass: rms.materialClass,
        defaultUnit: rms.defaultUnit,
        catalogRefType: rms.catalogRefType,
        catalogRefId: rms.catalogRefId,
        customName: rms.customName,
        notes: rms.notes,
      });
    }

    // Copy RecipeProcessMaterialBinding rows with remapped IDs
    for (const [oldRpuId, newRpuId] of rpuIdMap) {
      const bindings = loadRecipeMaterialBindings(tx, oldRpuId);
      for (const b of bindings) {
        tx.db.RecipeProcessMaterialBinding.insert({
          id: tx.newUuidV4().toString(),
          recipeProcessUseId: newRpuId,
          processMaterialSlotSpecId: b.processMaterialSlotSpecId,
          recipeMaterialSpecId: rmsIdMap.get(b.recipeMaterialSpecId) ?? b.recipeMaterialSpecId,
          quantityOverride: b.quantityOverride,
          quantityUnitOverride: b.quantityUnitOverride,
          notes: b.notes,
        });
      }
    }

    return JSON.stringify({ recipeId: newEntityId });
  })
);

export const createBatch = spacetimedb.procedure(
  { recipeId: t.string(), selections: t.string(), version: t.option(t.string()) },
  t.string(),
  (ctx, { recipeId, selections: _selectionsJson, version }) => ctx.withTx(tx => {
    const senderId = tx.sender.toHexString();
    const recipeEntity = tx.db.Entity.id.find(recipeId);
    if (!recipeEntity) throw new Error(`Recipe ${recipeId} not found`);
    if (recipeEntity.ownerId !== senderId) throw new Error('Not the owner');
    if (recipeEntity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const recipePayload = tx.db.Recipe.entityId.find(recipeId);
    if (!recipePayload) throw new Error(`Recipe payload ${recipeId} not found`);

    const now = tx.timestamp;
    const snapshotId = tx.newUuidV4().toString();
    const batchId = tx.newUuidV4().toString();
    const snapshotVersion = version ?? '1.0.0';

    // Create snapshot entity
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

    // Copy Recipe payload
    tx.db.Recipe.insert({
      entityId: snapshotId,
      defaultWaterProfileEntityId: recipePayload.defaultWaterProfileEntityId,
      attachedBatchId: batchId,
      notes: recipePayload.notes,
    });

    // Copy RecipeProcessUse rows
    const sourceRpus = loadRecipeProcessUses(tx, recipeId);
    const rpuIdMap = new Map<string, string>();
    for (const rpu of sourceRpus) {
      const newRpuId = tx.newUuidV4().toString();
      rpuIdMap.set(rpu.id, newRpuId);
      tx.db.RecipeProcessUse.insert({
        id: newRpuId,
        recipeEntityId: snapshotId,
        ordinal: rpu.ordinal,
        label: rpu.label,
        processSnapshotEntityId: rpu.processSnapshotEntityId,
        notes: rpu.notes,
      });
    }

    // Copy RecipeMaterialSpec rows
    const sourceRms = loadRecipeMaterialSpecs(tx, recipeId);
    const rmsIdMap = new Map<string, string>();
    for (const rms of sourceRms) {
      const newRmsId = tx.newUuidV4().toString();
      rmsIdMap.set(rms.id, newRmsId);
      tx.db.RecipeMaterialSpec.insert({
        id: newRmsId,
        recipeEntityId: snapshotId,
        key: rms.key,
        label: rms.label,
        materialClass: rms.materialClass,
        defaultUnit: rms.defaultUnit,
        catalogRefType: rms.catalogRefType,
        catalogRefId: rms.catalogRefId,
        customName: rms.customName,
        notes: rms.notes,
      });
    }

    // Copy RecipeProcessMaterialBinding rows
    for (const [oldRpuId, newRpuId] of rpuIdMap) {
      const bindings = loadRecipeMaterialBindings(tx, oldRpuId);
      for (const b of bindings) {
        tx.db.RecipeProcessMaterialBinding.insert({
          id: tx.newUuidV4().toString(),
          recipeProcessUseId: newRpuId,
          processMaterialSlotSpecId: b.processMaterialSlotSpecId,
          recipeMaterialSpecId: rmsIdMap.get(b.recipeMaterialSpecId) ?? b.recipeMaterialSpecId,
          quantityOverride: b.quantityOverride,
          quantityUnitOverride: b.quantityUnitOverride,
          notes: b.notes,
        });
      }
    }

    // Create batch
    tx.db.Batch.insert({
      id: batchId,
      ownerId: senderId,
      recipeSnapshotEntityId: snapshotId,
      name: recipeEntity.name,
      status: { tag: 'planned' },
      targetKind: { tag: 'total_rice_kg' },
      targetValue: 5.5,
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

    // Delete bindings for each RPU
    const rpus = [...ctx.db.RecipeProcessUse.byRecipeEntityId.filter(recipeId)];
    for (const rpu of rpus) {
      const bindings = [...ctx.db.RecipeProcessMaterialBinding.byRecipeProcessUseId.filter(rpu.id)];
      for (const b of bindings) {
        ctx.db.RecipeProcessMaterialBinding.id.delete(b.id);
      }
      ctx.db.RecipeProcessUse.id.delete(rpu.id);
    }

    // Delete material specs
    const specs = [...ctx.db.RecipeMaterialSpec.byRecipeEntityId.filter(recipeId)];
    for (const s of specs) {
      ctx.db.RecipeMaterialSpec.id.delete(s.id);
    }

    // Delete payload and entity
    ctx.db.Recipe.entityId.delete(recipeId);
    ctx.db.Entity.id.delete(recipeId);
  }
);

// ── Seed demo data ──────────────────────────────────────────────────────────

export const seedDemoData = spacetimedb.reducer(
  (ctx) => { seedDemoDataFn(ctx); }
);
