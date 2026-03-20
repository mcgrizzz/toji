import { t } from 'spacetimedb/server';
import { SenderError, Timestamp } from 'spacetimedb';
import spacetimedb from './schema';
import { seedDemoData as seedDemoDataFn } from './seed/seedData';

export default spacetimedb;

const ALLOWED_ISSUERS = new Set([
  'https://discord.com',
  'https://auth.spacetimedb.com',
]);

export const onConnect = spacetimedb.clientConnected(ctx => {
  if (ctx.senderAuth.isInternal) return;
  const jwt = ctx.senderAuth.jwt;
  if (jwt == null) {
    throw new SenderError('Unauthorized: JWT is required to connect');
  }
  if (!ALLOWED_ISSUERS.has(jwt.issuer)) {
    throw new SenderError(`Unauthorized: issuer '${jwt.issuer}' is not allowed`);
  }

  // Upsert User + AuthIdentity for non-admin issuers
  if (jwt.issuer === 'https://auth.spacetimedb.com') return;

  const identityHex = ctx.sender.toHexString();
  const now = ctx.timestamp;

  const existing = ctx.db.AuthIdentity.identityHex.find(identityHex);
  if (!existing) {
    const userId = ctx.newUuidV4().toString();
    ctx.db.User.insert({
      id: userId,
      displayName: jwt.subject,
      email: undefined,
      avatarUrl: undefined,
      createdAt: now,
      updatedAt: now,
    });
    ctx.db.AuthIdentity.insert({
      identityHex,
      userId,
      issuer: jwt.issuer,
      subject: jwt.subject,
      createdAt: now,
    });
  }
});
export const onDisconnect = spacetimedb.clientDisconnected(_ctx => {});

// ── DTO conversion helpers ──────────────────────────────────────────────────

function tsToIso(ts: { toISOString(): string }): string {
  return ts.toISOString();
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Resolve the User.id for the current sender. Returns null for system/admin connections. */
function resolveUserId(ctx: any): string | null {
  const identityHex = ctx.sender.toHexString();
  const link = ctx.db.AuthIdentity.identityHex.find(identityHex);
  return link?.userId ?? null;
}

function isSystemOwner(ownerId: string): boolean {
  return ownerId === '__system__';
}

function addHours(ts: Timestamp, hours: number): Timestamp {
  const microsToAdd = BigInt(Math.round(hours * 3_600_000_000));
  return new Timestamp(ts.microsSinceUnixEpoch + microsToAdd);
}

// ── Generic process loaders ─────────────────────────────────────────────────

function loadProcessEntity(tx: any, assetId: string) {
  const entity = tx.db.Asset.id.find(assetId);
  if (!entity) throw new Error(`Process entity ${assetId} not found`);
  const process = tx.db.Process.assetId.find(assetId);
  if (!process) throw new Error(`Process payload ${assetId} not found`);
  return { entity, process };
}

function loadProcessParamMap(tx: any, assetId: string): Map<string, number | string | boolean> {
  const rows = [...tx.db.ProcessParameter.byProcessAssetId.filter(assetId)];
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

function loadProcessStages(tx: any, assetId: string) {
  return [...tx.db.ProcessStage.byProcessAssetId.filter(assetId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
}

function loadProcessMaterialSlots(tx: any, assetId: string) {
  return [...tx.db.ProcessMaterialSlot.byProcessAssetId.filter(assetId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
}

function loadRecipeProcessUses(tx: any, recipeEntityId: string) {
  return [...tx.db.RecipeProcess.byRecipeAssetId.filter(recipeEntityId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
}

function loadRecipeMaterialSpecs(tx: any, recipeEntityId: string) {
  return [...tx.db.RecipeMaterial.byRecipeAssetId.filter(recipeEntityId)];
}

function loadRecipeMaterialBindings(tx: any, rpuId: string) {
  return [...tx.db.RecipeMaterialBinding.byRecipeProcessId.filter(rpuId)];
}

function loadProcessSteps(tx: any, stageId: string) {
  return [...tx.db.ProcessStep.byStageId.filter(stageId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);
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
      const stageSlots = materialSlots.filter((s: any) => s.stageId === stage.id);
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
    const { process } = loadProcessEntity(tx, pu.processSnapshotAssetId);
    const bindings = loadRecipeMaterialBindings(tx, pu.id);
    for (const binding of bindings) {
      const materialSpec = tx.db.RecipeMaterial.id.find(binding.recipeMaterialId);
      if (!materialSpec || materialSpec.materialClass.tag !== 'adjunct') continue;

      const slotSpec = tx.db.ProcessMaterialSlot.id.find(binding.processMaterialSlotId);
      if (!slotSpec) continue;

      const fracOfTotalRice = binding.quantityOverride ?? slotSpec.quantityValue ?? 0;

      let placement: any;
      if (process.processKind.tag === 'moto') {
        placement = { where: 'moto' as const };
      } else {
        const stage = slotSpec.stageId ? tx.db.ProcessStage.id.find(slotSpec.stageId) : null;
        placement = { where: 'moromi' as const, stageOrdinal: stage?.materialOrdinal ?? 1 };
      }

      amendments.push({ kind: materialSpec.label, fracOfTotalRice, placement });
    }
  }
  return amendments;
}

// ── Shared data loaders ─────────────────────────────────────────────────────

function loadWaterProfile(tx: any, assetId: string | undefined) {
  if (!assetId) return null;
  const entity = tx.db.Asset.id.find(assetId);
  if (!entity) return null;
  const ions = [...tx.db.WaterProfileIonTarget.byWaterProfileAssetId.filter(assetId)];
  return {
    id: entity.id,
    name: entity.name,
    isBuiltIn: isSystemOwner(entity.ownerId),
    ions: ions.map((i: any) => ({ symbol: i.ionSymbol, targetPpm: i.targetPpm })),
  };
}

function loadSchedule(tx: any, processEntityId: string) {
  const tasks = [...tx.db.ProcessTask.byProcessAssetId.filter(processEntityId)]
    .sort((a: any, b: any) => a.ordinal - b.ordinal);

  if (tasks.length === 0) return null;

  // Determine workflow kind from the process
  const process = tx.db.Process.assetId.find(processEntityId);
  const workflowKind = process?.processKind?.tag ?? 'koji';

  // Group by sectionKey to reconstruct ScheduleTemplate steps
  const steps: any[] = [];
  let currentStep: any = null;

  for (const task of tasks) {
    switch (task.taskKind.tag) {
      case 'milestone':
        currentStep = {
          key: task.sectionKey ?? task.key,
          label: task.label,
          atH: task.hoursFromStart ?? 0,
          durationH: task.durationH,
          notes: task.notes ? [task.notes] : [],
          goals: [],
          checks: [],
          actions: [],
        };
        steps.push(currentStep);
        break;
      case 'goal':
        if (currentStep) currentStep.goals.push({ description: task.description ?? task.label });
        break;
      case 'check':
        if (currentStep) currentStep.checks.push({ description: task.description ?? task.label });
        break;
      case 'action':
        if (currentStep) currentStep.actions.push({ description: task.description ?? task.label });
        break;
    }
  }

  // Look up the process entity for the name
  const entity = tx.db.Asset.id.find(processEntityId);
  return {
    name: entity?.name ? `${entity.name} Schedule` : 'Schedule',
    workflow: { kind: workflowKind },
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
    const { entity: procEntity, process } = loadProcessEntity(tx, pu.processSnapshotAssetId);
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
  const waterProfile = loadWaterProfile(tx, recipePayload.defaultWaterProfileAssetId);
  const salts = loadAllSalts(tx);
  const acid = loadAcid(tx);
  const amendments = projectRecipeAmendmentsCompat(tx, processUses);

  const template = {
    id: entity.id,
    name: entity.name,
    kojiPresetRef: kojiData.pu.processSnapshotAssetId,
    motoPresetRef: motoData.pu.processSnapshotAssetId,
    moromiPresetRef: moromiData.pu.processSnapshotAssetId,
    waterProfileRef: recipePayload.defaultWaterProfileAssetId ?? '',
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
  const kojiSch = loadSchedule(tx, kojiData.pu.processSnapshotAssetId);
  const motoSch = loadSchedule(tx, motoData.pu.processSnapshotAssetId);
  const moromiSch = loadSchedule(tx, moromiData.pu.processSnapshotAssetId);
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
    const all = [...tx.db.Asset.iter()];
    const publicSnapshots = all.filter(
      (e: any) => e.isPublic && e.assetKind.tag === 'snapshot' && e.dataType.tag === 'recipe'
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
    const entity = tx.db.Asset.id.find(snapshotId);
    if (!entity) throw new Error(`Entity ${snapshotId} not found`);
    if (!entity.isPublic) throw new Error('Cannot view a non-public snapshot');
    if (entity.assetKind.tag !== 'snapshot') throw new Error('Not a snapshot');
    if (entity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const payload = tx.db.Recipe.assetId.find(snapshotId);
    if (!payload) throw new Error(`Recipe payload ${snapshotId} not found`);

    return JSON.stringify(buildBundle(tx, entity, payload));
  })
);

export const getMyRecipes = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const senderId = ctx.sender.toHexString();
    const all = [...tx.db.Asset.byOwnerId.filter(senderId)];
    const recipes = all.filter(
      (e: any) => e.assetKind.tag === 'working' && e.dataType.tag === 'recipe'
    );
    // Filter out recipes attached to a batch
    const unattached = recipes.filter((r: any) => {
      const payload = tx.db.Recipe.assetId.find(r.id);
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
    const entity = tx.db.Asset.id.find(recipeId);
    if (!entity) throw new Error(`Recipe ${recipeId} not found`);
    if (entity.ownerId !== senderId) throw new Error('Not the owner');
    if (entity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const payload = tx.db.Recipe.assetId.find(recipeId);
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

export const getSeedInventory = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const ownerId = '__system__';

    const riceLots = [...tx.db.InventoryRiceLot.byOwnerId.filter(ownerId)].map((r: any) => {
      let variety = r.customVarietyName;
      if (r.catalogRiceVarietyId) {
        const cat = tx.db.CatalogRiceVariety.id.find(r.catalogRiceVarietyId);
        if (cat) variety = cat.name;
      }
      return { lotId: r.id, variety: variety ?? 'Unknown', polishPct: r.polishPct, lotLabel: r.lotLabel };
    });

    const kojiStrains = [...tx.db.InventoryKojiSporeLot.byOwnerId.filter(ownerId)].map((k: any) => {
      let name = k.customName;
      if (k.catalogKojiSporeProductId) {
        const cat = tx.db.CatalogKojiSporeProduct.id.find(k.catalogKojiSporeProductId);
        if (cat) name = cat.name;
      }
      return { strainId: k.id, name: name ?? 'Unknown' };
    });

    const yeasts = [...tx.db.InventoryYeastStock.byOwnerId.filter(ownerId)].map((y: any) => {
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
      const entity = tx.db.Asset.id.find(b.batchRecipeAssetId);
      return {
        id: b.id,
        sourceRecipeAssetId: b.sourceRecipeAssetId,
        batchRecipeAssetId: b.batchRecipeAssetId,
        recipeName: entity?.name ?? 'Unknown',
        status: b.status.tag,
        targetKind: b.targetKind.tag,
        targetValue: b.targetValue,
        createdAt: tsToIso(b.createdAt),
        startedAt: b.startedAt ? tsToIso(b.startedAt) : undefined,
        completedAt: b.completedAt ? tsToIso(b.completedAt) : undefined,
        notes: b.notes,
      };
    }));
  })
);

export const getBatchDetail = spacetimedb.procedure(
  { batchId: t.string() },
  t.string(),
  (ctx, { batchId }) => ctx.withTx(tx => {
    const senderId = ctx.sender.toHexString();
    const batch = tx.db.Batch.id.find(batchId);
    if (!batch) throw new Error(`Batch ${batchId} not found`);
    if (batch.ownerId !== senderId) throw new Error('Not the owner');

    // Load processes sorted by ordinal
    const processes = [...tx.db.BatchProcess.byBatchId.filter(batchId)]
      .sort((a: any, b: any) => a.ordinal - b.ordinal);

    const processResults = processes.map((bpi: any) => {
      // Stages
      const stages = [...tx.db.BatchStage.byBatchProcessId.filter(bpi.id)]
        .sort((a: any, b: any) => a.ordinal - b.ordinal);

      const stageResults = stages.map((bsi: any) => {
        const steps = [...tx.db.BatchStep.byBatchStageId.filter(bsi.id)]
          .sort((a: any, b: any) => a.ordinal - b.ordinal);

        return {
          id: bsi.id,
          label: bsi.label,
          ordinal: bsi.ordinal,
          status: bsi.status.tag,
          startedAt: bsi.startedAt ? tsToIso(bsi.startedAt) : undefined,
          completedAt: bsi.completedAt ? tsToIso(bsi.completedAt) : undefined,
          steps: steps.map((step: any) => ({
            id: step.id,
            label: step.label,
            ordinal: step.ordinal,
            renderedInstruction: step.renderedInstruction,
            sectionKey: step.sectionKey,
            sectionLabel: step.sectionLabel,
            status: step.status.tag,
            dueAt: step.dueAt ? tsToIso(step.dueAt) : undefined,
            completedAt: step.completedAt ? tsToIso(step.completedAt) : undefined,
            notes: step.notes,
          })),
        };
      });

      // Tasks grouped by section
      const tasks = [...tx.db.BatchTask.byBatchProcessId.filter(bpi.id)]
        .sort((a: any, b: any) => a.ordinal - b.ordinal);

      const sectionMap = new Map<string | null, { sectionKey: string | null; sectionLabel: string | null; tasks: any[] }>();
      for (const task of tasks) {
        const key = task.sectionKey ?? null;
        if (!sectionMap.has(key)) {
          sectionMap.set(key, {
            sectionKey: task.sectionKey ?? null,
            sectionLabel: task.sectionLabel ?? null,
            tasks: [],
          });
        }
        sectionMap.get(key)!.tasks.push({
          id: task.id,
          label: task.label,
          ordinal: task.ordinal,
          key: task.key,
          taskKind: task.taskKind.tag,
          status: task.status.tag,
          dueAt: task.dueAt ? tsToIso(task.dueAt) : undefined,
          completedAt: task.completedAt ? tsToIso(task.completedAt) : undefined,
          notes: task.notes,
        });
      }

      return {
        id: bpi.id,
        label: bpi.label,
        ordinal: bpi.ordinal,
        status: bpi.status.tag,
        startedAt: bpi.startedAt ? tsToIso(bpi.startedAt) : undefined,
        completedAt: bpi.completedAt ? tsToIso(bpi.completedAt) : undefined,
        stages: stageResults,
        taskSections: [...sectionMap.values()],
      };
    });

    // Materials
    const materials = [...tx.db.BatchMaterial.byBatchId.filter(batchId)].map((m: any) => ({
      id: m.id,
      batchProcessId: m.batchProcessId,
      batchStageId: m.batchStageId,
      label: m.label,
      materialClass: m.materialClass.tag,
      plannedQuantity: m.plannedQuantity,
      plannedUnit: m.plannedUnit,
      inventoryRefType: m.inventoryRefType,
      inventoryRefId: m.inventoryRefId,
      customName: m.customName,
      notes: m.notes,
    }));

    const entity = tx.db.Asset.id.find(batch.batchRecipeAssetId);
    return JSON.stringify({
      batch: {
        id: batch.id,
        name: batch.name,
        status: batch.status.tag,
        targetKind: batch.targetKind.tag,
        targetValue: batch.targetValue,
        createdAt: tsToIso(batch.createdAt),
        startedAt: batch.startedAt ? tsToIso(batch.startedAt) : undefined,
        completedAt: batch.completedAt ? tsToIso(batch.completedAt) : undefined,
        notes: batch.notes,
        sourceRecipeAssetId: batch.sourceRecipeAssetId,
        batchRecipeAssetId: batch.batchRecipeAssetId,
        recipeName: entity?.name ?? 'Unknown',
      },
      processes: processResults,
      materials,
    });
  })
);

// ── Write procedures ────────────────────────────────────────────────────────

// ── Shared recipe copy helper ────────────────────────────────────────────────

function copyRecipeEntity(tx: any, sourceEntityId: string, senderId: string, overrides: {
  assetKind: 'working' | 'snapshot';
  attachedBatchId?: string;
  version?: string;
  lineageRootId?: string;
  provenanceKind?: string;
  provenanceAssetId?: string;
}): { newEntityId: string; rpuIdMap: Map<string, string>; rmsIdMap: Map<string, string> } {
  const sourceEntity = tx.db.Asset.id.find(sourceEntityId);
  if (!sourceEntity) throw new Error(`Entity ${sourceEntityId} not found`);
  const sourcePayload = tx.db.Recipe.assetId.find(sourceEntityId);
  if (!sourcePayload) throw new Error(`Recipe payload ${sourceEntityId} not found`);

  const newEntityId = tx.newUuidV4().toString();
  const now = tx.timestamp;

  // Copy Entity
  tx.db.Asset.insert({
    id: newEntityId,
    ownerId: senderId,
    dataType: { tag: 'recipe' },
    assetKind: { tag: overrides.assetKind },
    name: sourceEntity.name,
    description: sourceEntity.description,
    version: overrides.version,
    isPublic: false,
    isArchived: false,
    lineageRootId: overrides.lineageRootId ?? newEntityId,
    parentAssetId: sourceEntityId,
    provenanceKind: overrides.provenanceKind
      ? { tag: overrides.provenanceKind }
      : sourceEntity.provenanceKind,
    provenanceAssetId: overrides.provenanceAssetId ?? sourceEntity.provenanceAssetId,
    createdAt: now,
    updatedAt: now,
  });

  // Copy Recipe payload
  tx.db.Recipe.insert({
    assetId: newEntityId,
    defaultWaterProfileAssetId: sourcePayload.defaultWaterProfileAssetId,
    attachedBatchId: overrides.attachedBatchId,
    notes: sourcePayload.notes,
  });

  // Copy RecipeProcessUse rows with ID remapping
  const sourceRpus = loadRecipeProcessUses(tx, sourceEntityId);
  const rpuIdMap = new Map<string, string>();
  for (const rpu of sourceRpus) {
    const newRpuId = tx.newUuidV4().toString();
    rpuIdMap.set(rpu.id, newRpuId);
    tx.db.RecipeProcess.insert({
      id: newRpuId,
      recipeAssetId: newEntityId,
      ordinal: rpu.ordinal,
      label: rpu.label,
      processSnapshotAssetId: rpu.processSnapshotAssetId,
      notes: rpu.notes,
    });
  }

  // Copy RecipeMaterialSpec rows with ID remapping
  const sourceRms = loadRecipeMaterialSpecs(tx, sourceEntityId);
  const rmsIdMap = new Map<string, string>();
  for (const rms of sourceRms) {
    const newRmsId = tx.newUuidV4().toString();
    rmsIdMap.set(rms.id, newRmsId);
    tx.db.RecipeMaterial.insert({
      id: newRmsId,
      recipeAssetId: newEntityId,
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
      tx.db.RecipeMaterialBinding.insert({
        id: tx.newUuidV4().toString(),
        recipeProcessId: newRpuId,
        processMaterialSlotId: b.processMaterialSlotId,
        recipeMaterialId: rmsIdMap.get(b.recipeMaterialId) ?? b.recipeMaterialId,
        quantityOverride: b.quantityOverride,
        quantityUnitOverride: b.quantityUnitOverride,
        notes: b.notes,
      });
    }
  }

  return { newEntityId, rpuIdMap, rmsIdMap };
}

export const copyRecipeSnapshotToRecipe = spacetimedb.procedure(
  { snapshotId: t.string() },
  t.string(),
  (ctx, { snapshotId }) => ctx.withTx(tx => {
    const sourceEntity = tx.db.Asset.id.find(snapshotId);
    if (!sourceEntity) throw new Error(`Snapshot ${snapshotId} not found`);
    if (!sourceEntity.isPublic) throw new Error('Cannot copy a non-public snapshot');
    if (sourceEntity.assetKind.tag !== 'snapshot') throw new Error('Not a snapshot');
    if (sourceEntity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    const senderId = tx.sender.toHexString();
    const { newEntityId } = copyRecipeEntity(tx, snapshotId, senderId, {
      assetKind: 'working',
      provenanceKind: 'copied_from_public',
      provenanceAssetId: snapshotId,
    });

    return JSON.stringify({ recipeId: newEntityId });
  })
);

export const createBatch = spacetimedb.procedure(
  { recipeId: t.string(), selections: t.string(), version: t.option(t.string()) },
  t.string(),
  (ctx, { recipeId, selections: selectionsJson }) => ctx.withTx(tx => {
    const senderId = tx.sender.toHexString();
    const recipeEntity = tx.db.Asset.id.find(recipeId);
    if (!recipeEntity) throw new Error(`Recipe ${recipeId} not found`);
    if (recipeEntity.ownerId !== senderId) throw new Error('Not the owner');
    if (recipeEntity.dataType.tag !== 'recipe') throw new Error('Not a recipe');
    if (recipeEntity.assetKind.tag !== 'working') throw new Error('Source must be a working recipe');

    // Parse selections
    const sel = JSON.parse(selectionsJson);
    const targetKind = sel.targetKind?.tag ?? 'total_rice_kg';
    const targetValue = sel.targetValue ?? 5.5;

    const now = tx.timestamp;
    const batchId = tx.newUuidV4().toString();

    // Create batch-private working copy of the recipe
    const { newEntityId: batchRecipeAssetId, rpuIdMap } = copyRecipeEntity(tx, recipeId, senderId, {
      assetKind: 'working',
      attachedBatchId: batchId,
      lineageRootId: recipeEntity.lineageRootId,
    });

    // Create Batch row
    tx.db.Batch.insert({
      id: batchId,
      ownerId: senderId,
      sourceRecipeAssetId: recipeId,
      batchRecipeAssetId,
      name: recipeEntity.name,
      status: { tag: 'planned' },
      targetKind: { tag: targetKind },
      targetValue,
      startedAt: undefined,
      completedAt: undefined,
      notes: undefined,
      createdAt: now,
      updatedAt: now,
    });

    // ── Instantiate execution rows ─────────────────────────────────────────

    // Build a map of new RPU ids to their rows for the copied recipe
    const newRpus = loadRecipeProcessUses(tx, batchRecipeAssetId);

    // Map from new RPU id back to the original RPU id (for selection matching)
    const reverseRpuMap = new Map<string, string>();
    for (const [oldId, newId] of rpuIdMap) {
      reverseRpuMap.set(newId, oldId);
    }

    // Track stage instances by process kind + materialOrdinal for selection matching
    const stageInstancesByProcessKind = new Map<string, Map<number, string>>();
    // Track process instances by process kind for selection matching
    const processInstanceByKind = new Map<string, string>();

    for (const rpu of newRpus) {
      const { process } = loadProcessEntity(tx, rpu.processSnapshotAssetId);
      const processKind = process.processKind.tag;
      const bpiId = tx.newUuidV4().toString();

      tx.db.BatchProcess.insert({
        id: bpiId,
        batchId,
        recipeProcessId: rpu.id,
        ordinal: rpu.ordinal,
        processSnapshotAssetId: rpu.processSnapshotAssetId,
        label: rpu.label,
        status: { tag: 'pending' },
        startedAt: undefined,
        completedAt: undefined,
      });

      processInstanceByKind.set(processKind, bpiId);

      // Stages
      const stages = loadProcessStages(tx, rpu.processSnapshotAssetId);
      const kindStageMap = stageInstancesByProcessKind.get(processKind) ?? new Map<number, string>();
      const stageSpecToInstanceId = new Map<string, string>();
      const stepSpecToInstanceId = new Map<string, string>();

      for (const stage of stages) {
        const bsiId = tx.newUuidV4().toString();

        tx.db.BatchStage.insert({
          id: bsiId,
          batchProcessId: bpiId,
          stageId: stage.id,
          ordinal: stage.ordinal,
          label: stage.label,
          status: { tag: 'pending' },
          startedAt: undefined,
          completedAt: undefined,
        });

        stageSpecToInstanceId.set(stage.id, bsiId);

        if (stage.materialOrdinal != null) {
          kindStageMap.set(stage.materialOrdinal, bsiId);
        }

        // Steps (directly under stage)
        const steps = loadProcessSteps(tx, stage.id);
        for (const step of steps) {
          const bstepId = tx.newUuidV4().toString();

          tx.db.BatchStep.insert({
            id: bstepId,
            batchStageId: bsiId,
            stepId: step.id,
            ordinal: step.ordinal,
            label: step.label,
            renderedInstruction: step.instructionTemplate,
            sectionKey: step.sectionKey,
            sectionLabel: step.sectionLabel,
            status: { tag: 'pending' },
            dueAt: undefined,
            completedAt: undefined,
            notes: undefined,
          });

          stepSpecToInstanceId.set(step.id, bstepId);
        }
      }

      stageInstancesByProcessKind.set(processKind, kindStageMap);

      // ── Task instance rows for this process ───────────────────────────

      const taskSpecs = [...tx.db.ProcessTask.byProcessAssetId.filter(rpu.processSnapshotAssetId)]
        .sort((a: any, b: any) => a.ordinal - b.ordinal);

      for (const spec of taskSpecs) {
        const bsiId = spec.stageId ? stageSpecToInstanceId.get(spec.stageId) : undefined;
        const bstepId = spec.stepId ? stepSpecToInstanceId.get(spec.stepId) : undefined;

        // Compute dueAt (will be undefined for new batches since nothing has startedAt yet)
        let dueAt: any = undefined;
        if (spec.timingKind.tag === 'absolute' && spec.hoursFromStart != null) {
          const bpi = tx.db.BatchProcess.id.find(bpiId);
          if (bpi?.startedAt) {
            dueAt = addHours(bpi.startedAt, spec.hoursFromStart);
          }
        } else if (spec.timingKind.tag === 'relative_to_stage' && spec.anchorStageId && spec.offsetHours != null) {
          const anchorBsiId = stageSpecToInstanceId.get(spec.anchorStageId);
          if (anchorBsiId) {
            const anchorBsi = tx.db.BatchStage.id.find(anchorBsiId);
            if (anchorBsi?.startedAt) {
              dueAt = addHours(anchorBsi.startedAt, spec.offsetHours);
            }
          }
        }

        tx.db.BatchTask.insert({
          id: tx.newUuidV4().toString(),
          batchId,
          batchProcessId: bpiId,
          batchStageId: bsiId,
          batchStepId: bstepId,
          processTaskId: spec.id,
          ordinal: spec.ordinal,
          key: spec.key,
          label: spec.label,
          taskKind: spec.taskKind,
          sectionKey: spec.sectionKey,
          sectionLabel: spec.sectionLabel,
          dueAt,
          status: { tag: 'pending' },
          completedAt: undefined,
          notes: undefined,
        });
      }

      // ── Material plan rows for this process ────────────────────────────

      const bindings = loadRecipeMaterialBindings(tx, rpu.id);
      for (const binding of bindings) {
        const slotSpec = tx.db.ProcessMaterialSlot.id.find(binding.processMaterialSlotId);
        const materialSpec = tx.db.RecipeMaterial.id.find(binding.recipeMaterialId);
        if (!slotSpec || !materialSpec) continue;

        // Find the stage instance for this slot's stage
        let batchStageId: string | undefined;
        if (slotSpec.stageId) {
          const stageSpec = tx.db.ProcessStage.id.find(slotSpec.stageId);
          if (stageSpec?.materialOrdinal != null) {
            batchStageId = kindStageMap.get(stageSpec.materialOrdinal);
          }
        }

        tx.db.BatchMaterial.insert({
          id: tx.newUuidV4().toString(),
          batchId,
          batchProcessId: bpiId,
          batchStageId,
          processMaterialSlotId: slotSpec.id,
          recipeMaterialId: materialSpec.id,
          label: materialSpec.label,
          materialClass: materialSpec.materialClass,
          plannedQuantity: binding.quantityOverride ?? slotSpec.quantityValue,
          plannedUnit: binding.quantityUnitOverride ?? slotSpec.quantityUnit,
          inventoryRefType: undefined,
          inventoryRefId: undefined,
          customName: materialSpec.customName,
          notes: undefined,
        });
      }
    }

    // ── Map selections to inventory refs ──────────────────────────────────

    const materialPlans = [...tx.db.BatchMaterial.byBatchId.filter(batchId)];

    function assignInventoryRef(
      materialClass: string,
      processKind: string,
      inventoryRefType: string,
      inventoryRefId: string,
      materialOrdinal?: number,
    ) {
      for (const plan of materialPlans) {
        if (plan.materialClass.tag !== materialClass) continue;
        // Match by process kind
        const bpi = plan.batchProcessId
          ? tx.db.BatchProcess.id.find(plan.batchProcessId)
          : null;
        if (!bpi) continue;
        const { process } = loadProcessEntity(tx, bpi.processSnapshotAssetId);
        if (process.processKind.tag !== processKind) continue;

        // If materialOrdinal specified, match by stage materialOrdinal
        if (materialOrdinal != null) {
          if (!plan.batchStageId) continue;
          const bsi = tx.db.BatchStage.id.find(plan.batchStageId);
          if (!bsi) continue;
          const stageSpec = tx.db.ProcessStage.id.find(bsi.stageId);
          if (!stageSpec || stageSpec.materialOrdinal !== materialOrdinal) continue;
        }

        // Update the plan row
        tx.db.BatchMaterial.id.delete(plan.id);
        tx.db.BatchMaterial.insert({
          ...plan,
          inventoryRefType,
          inventoryRefId,
        });
        return; // Only match first
      }
    }

    if (sel.kojiRiceLotId) {
      assignInventoryRef('rice', 'koji', 'rice_lot', sel.kojiRiceLotId);
    }
    if (sel.motoRiceLotId) {
      assignInventoryRef('rice', 'moto', 'rice_lot', sel.motoRiceLotId);
    }
    if (sel.yeastId) {
      assignInventoryRef('yeast', 'moto', 'yeast_stock', sel.yeastId);
    }
    if (sel.acidTypeId) {
      assignInventoryRef('acid', 'moto', 'acid_type', sel.acidTypeId);
    }
    if (Array.isArray(sel.moromiStageLots)) {
      for (const lot of sel.moromiStageLots) {
        if (lot.riceLotId && lot.stageOrdinal != null) {
          assignInventoryRef('rice', 'moromi', 'rice_lot', lot.riceLotId, lot.stageOrdinal);
        }
      }
    }

    return JSON.stringify({ batchId, batchRecipeAssetId });
  })
);

// ── Reducers ────────────────────────────────────────────────────────────────

export const deleteRecipe = spacetimedb.reducer(
  { recipeId: t.string() },
  (ctx, { recipeId }) => {
    const entity = ctx.db.Asset.id.find(recipeId);
    if (!entity) throw new Error(`Recipe ${recipeId} not found`);
    if (entity.ownerId !== ctx.sender.toHexString()) throw new Error('Not the owner');
    if (entity.dataType.tag !== 'recipe') throw new Error('Not a recipe');

    // Delete bindings for each RPU
    const rpus = [...ctx.db.RecipeProcess.byRecipeAssetId.filter(recipeId)];
    for (const rpu of rpus) {
      const bindings = [...ctx.db.RecipeMaterialBinding.byRecipeProcessId.filter(rpu.id)];
      for (const b of bindings) {
        ctx.db.RecipeMaterialBinding.id.delete(b.id);
      }
      ctx.db.RecipeProcess.id.delete(rpu.id);
    }

    // Delete material specs
    const specs = [...ctx.db.RecipeMaterial.byRecipeAssetId.filter(recipeId)];
    for (const s of specs) {
      ctx.db.RecipeMaterial.id.delete(s.id);
    }

    // Delete payload and entity
    ctx.db.Recipe.assetId.delete(recipeId);
    ctx.db.Asset.id.delete(recipeId);
  }
);

export const syncProfile = spacetimedb.reducer(
  { displayName: t.string(), email: t.option(t.string()), avatarUrl: t.option(t.string()) },
  (ctx, { displayName, email, avatarUrl }) => {
    const userId = resolveUserId(ctx);
    if (!userId) return;
    const user = ctx.db.User.id.find(userId);
    if (!user) return;
    ctx.db.User.id.delete(userId);
    ctx.db.User.insert({
      ...user,
      displayName,
      email,
      avatarUrl,
      updatedAt: ctx.timestamp,
    });
  }
);

// ── Seed demo data ──────────────────────────────────────────────────────────

export const seedDemoData = spacetimedb.reducer(
  (ctx) => { seedDemoDataFn(ctx); }
);
