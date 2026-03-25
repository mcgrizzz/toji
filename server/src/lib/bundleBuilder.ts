import { isSystemOwner } from './utils';
import {
  loadProcessEntity,
  loadProcessParamMap,
  loadProcessStages,
  loadProcessMaterialSlots,
  loadRecipeProcessUses,
  loadRecipeMaterialBindings,
} from './loaders';

/* eslint-disable @typescript-eslint/no-explicit-any */

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

export function buildBundle(tx: any, entity: any, recipePayload: any) {
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
