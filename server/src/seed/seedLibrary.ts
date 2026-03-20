/* eslint-disable @typescript-eslint/no-explicit-any */

import { insertTaskSpecSteps, type SeedStep } from './seedDataHelpers';

export function seedLibrary(ctx: any): void {
  const now = ctx.timestamp;
  const systemOwner = '__system__';

  // ── Water profile entity ──────────────────────────────────────────────────

  const waterEntityId = 'ent-water-ginjo-1';
  if (!ctx.db.Asset.id.find(waterEntityId)) {
    ctx.db.Asset.insert({
      id: waterEntityId, ownerId: systemOwner,
      dataType: { tag: 'water_profile' }, assetKind: { tag: 'snapshot' },
      name: 'Ginjo 1', description: undefined, version: '1.0.0',
      isPublic: true, isArchived: false,
      lineageRootId: waterEntityId, parentAssetId: undefined,
      provenanceKind: { tag: 'original' }, provenanceAssetId: undefined,
      createdAt: now, updatedAt: now,
    });
    ctx.db.WaterProfile.insert({ assetId: waterEntityId, notes: undefined });
    ctx.db.WaterProfileIonTarget.insert({ id: ctx.newUuidV4().toString(), waterProfileAssetId: waterEntityId, ionSymbol: 'Ca', targetPpm: 10 });
    ctx.db.WaterProfileIonTarget.insert({ id: ctx.newUuidV4().toString(), waterProfileAssetId: waterEntityId, ionSymbol: 'Mg', targetPpm: 3 });
  }

  // ── Koji process ──────────────────────────────────────────────────────────

  const kojiEntityId = 'ent-process-koji-ueda';
  if (!ctx.db.Asset.id.find(kojiEntityId)) {
    ctx.db.Asset.insert({
      id: kojiEntityId, ownerId: systemOwner,
      dataType: { tag: 'process' }, assetKind: { tag: 'snapshot' },
      name: 'Ueda Koji Method', description: undefined, version: '1.0.0',
      isPublic: true, isArchived: false,
      lineageRootId: kojiEntityId, parentAssetId: undefined,
      provenanceKind: { tag: 'original' }, provenanceAssetId: undefined,
      createdAt: now, updatedAt: now,
    });
    ctx.db.Process.insert({ assetId: kojiEntityId, processKind: { tag: 'koji' }, notes: 'The Ueda method is a systematic approach to koji making with precise weight-tracking at each stage. Drying is the most critical step. Smaller batches may fluctuate more at peak temperature. The overall timeline from inoculation to de-koji is typically 48-50 hours.' });

    // Koji params — original 3 kept for compatibility projection, plus new process knobs
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-1', processAssetId: kojiEntityId, ordinal: 1, key: 'koji_g_per_kg_rice', label: 'Koji per kg Rice', valueType: { tag: 'number' }, unit: 'g/kg', defaultNumberValue: 0.08, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-2', processAssetId: kojiEntityId, ordinal: 2, key: 'carrier_name', label: 'Carrier', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Toasted Rice Flour', defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-3', processAssetId: kojiEntityId, ordinal: 3, key: 'carrier_ratio_g_per_g', label: 'Carrier Ratio', valueType: { tag: 'number' }, unit: 'g/g', defaultNumberValue: 5, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-4', processAssetId: kojiEntityId, ordinal: 4, key: 'starter_rate_low_g_per_kg', label: 'Starter Rate (Low)', valueType: { tag: 'number' }, unit: 'g/kg', defaultNumberValue: 0.05, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-5', processAssetId: kojiEntityId, ordinal: 5, key: 'starter_rate_typical_g_per_kg', label: 'Starter Rate (Typical)', valueType: { tag: 'number' }, unit: 'g/kg', defaultNumberValue: 0.08, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-6', processAssetId: kojiEntityId, ordinal: 6, key: 'starter_rate_high_g_per_kg', label: 'Starter Rate (High)', valueType: { tag: 'number' }, unit: 'g/kg', defaultNumberValue: 0.15, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-7', processAssetId: kojiEntityId, ordinal: 7, key: 'starter_extension_ratio', label: 'Starter Extension Ratio', valueType: { tag: 'number' }, unit: undefined, defaultNumberValue: 5, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-8', processAssetId: kojiEntityId, ordinal: 8, key: 'post_steam_target_min_pct', label: 'Post-Steam Weight Min', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 42, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-9', processAssetId: kojiEntityId, ordinal: 9, key: 'post_steam_target_max_pct', label: 'Post-Steam Weight Max', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 43, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-10', processAssetId: kojiEntityId, ordinal: 10, key: 'drying_target_min_pct', label: 'Drying Target Min', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 28, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-11', processAssetId: kojiEntityId, ordinal: 11, key: 'drying_target_max_pct', label: 'Drying Target Max', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 31, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-12', processAssetId: kojiEntityId, ordinal: 12, key: 'peak_target_min_c', label: 'Peak Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 40, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-13', processAssetId: kojiEntityId, ordinal: 13, key: 'peak_target_max_c', label: 'Peak Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 43, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-14', processAssetId: kojiEntityId, ordinal: 14, key: 'dekoji_hours_after_peak_min', label: 'De-koji Min Hours After Peak', valueType: { tag: 'number' }, unit: 'h', defaultNumberValue: 10, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-koji-ueda-15', processAssetId: kojiEntityId, ordinal: 15, key: 'dekoji_hours_after_peak_max', label: 'De-koji Max Hours After Peak', valueType: { tag: 'number' }, unit: 'h', defaultNumberValue: 18, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });

    // Koji stage
    const kojiStageId = 'pstg-koji-ueda-making';
    ctx.db.ProcessStage.insert({ id: kojiStageId, processAssetId: kojiEntityId, ordinal: 1, key: 'koji_making', label: 'Koji Making', materialOrdinal: undefined, notes: undefined });

    // Koji material slots
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-koji-ueda-rice', processAssetId: kojiEntityId, stageId: kojiStageId, ordinal: 1, key: 'rice', label: 'Rice', materialClass: { tag: 'rice' }, quantityMode: { tag: 'absolute' }, quantityValue: undefined, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-koji-ueda-tane', processAssetId: kojiEntityId, stageId: kojiStageId, ordinal: 2, key: 'tane-koji', label: 'Tane-koji', materialClass: { tag: 'koji' }, quantityMode: { tag: 'absolute' }, quantityValue: undefined, quantityUnit: undefined, notes: undefined });

    // Koji steps (ProcessStepSpec)
    const kojiStepIds = {
      soak: 'pss-koji-ueda-soak',
      steam: 'pss-koji-ueda-steam',
      dry: 'pss-koji-ueda-dry',
      inoculate: 'pss-koji-ueda-inoculate',
      germinate: 'pss-koji-ueda-germinate',
      mori_work: 'pss-koji-ueda-mori_work',
      naka_work: 'pss-koji-ueda-naka_work',
      shimai_work: 'pss-koji-ueda-shimai_work',
      peak_hold: 'pss-koji-ueda-peak_hold',
      dekoji_finish: 'pss-koji-ueda-dekoji_finish',
    };

    ctx.db.ProcessStep.insert({ id: kojiStepIds.soak, stageId: kojiStageId, ordinal: 1, key: 'soak', label: 'Soak + Drain Rest', instructionTemplate: 'Soak rice to target absorption, drain, then rest to allow moisture to distribute evenly.', sectionKey: 'soaking', sectionLabel: 'Soaking', notes: undefined });
    ctx.db.ProcessStep.insert({ id: kojiStepIds.steam, stageId: kojiStageId, ordinal: 2, key: 'steam', label: 'Steam Rice', instructionTemplate: 'Steam thoroughly until grains are evenly gelatinized through the center.', sectionKey: 'steaming', sectionLabel: 'Steaming', notes: undefined });
    ctx.db.ProcessStep.insert({ id: kojiStepIds.dry, stageId: kojiStageId, ordinal: 3, key: 'dry', label: 'Hiki-komi / Drying', instructionTemplate: 'Dry steamed rice on racks in a warm, ventilated chamber or low-temp oven until target weight is reached.', sectionKey: 'drying', sectionLabel: 'Hiki-komi / Drying', notes: 'Drying is the most important step in the koji process. Avoid prolonged exposure above 50°C.' });
    ctx.db.ProcessStep.insert({ id: kojiStepIds.inoculate, stageId: kojiStageId, ordinal: 4, key: 'inoculate', label: 'Tane-kiri / Inoculation', instructionTemplate: 'Measure and dilute starter as needed, then shake evenly over rice while breaking up clumps and turning rice.', sectionKey: 'inoculation', sectionLabel: 'Tane-kiri / Inoculation', notes: 'Expect about 1% moisture drop from tane-kiri.' });
    ctx.db.ProcessStep.insert({ id: kojiStepIds.germinate, stageId: kojiStageId, ordinal: 5, key: 'germinate', label: 'Momi-age / Germination', instructionTemplate: 'Divide rice into tubs, record weights, loosely cover, and hold at 32°C for germination.', sectionKey: 'germination', sectionLabel: 'Momi-age / Germination', notes: undefined });
    ctx.db.ProcessStep.insert({ id: kojiStepIds.mori_work, stageId: kojiStageId, ordinal: 6, key: 'mori_work', label: 'Mori / Heaping', instructionTemplate: 'Break up any clumps, stir lightly, record weight, and crack lid slightly for oxygen.', sectionKey: 'mori', sectionLabel: 'Mori / Heaping', notes: undefined });
    ctx.db.ProcessStep.insert({ id: kojiStepIds.naka_work, stageId: kojiStageId, ordinal: 7, key: 'naka_work', label: 'Naka-shigoto / Middle Work', instructionTemplate: 'Mix lightly, break up clumps so grains are loose again, and record weight.', sectionKey: 'naka', sectionLabel: 'Naka-shigoto / Middle Work', notes: undefined });
    ctx.db.ProcessStep.insert({ id: kojiStepIds.shimai_work, stageId: kojiStageId, ordinal: 8, key: 'shimai_work', label: 'Shimai-shigoto / Final Work', instructionTemplate: 'Mix thoroughly so grains are separated, record weight, then transition from lid to dry towel cover.', sectionKey: 'shimai', sectionLabel: 'Shimai-shigoto / Final Work', notes: undefined });
    ctx.db.ProcessStep.insert({ id: kojiStepIds.peak_hold, stageId: kojiStageId, ordinal: 9, key: 'peak_hold', label: 'Peak Temperature Hold', instructionTemplate: 'Hold near peak temperature and monitor for stability.', sectionKey: 'peak', sectionLabel: 'Peak Temperature', notes: 'Smaller batches may fluctuate more at peak temperature.' });
    ctx.db.ProcessStep.insert({ id: kojiStepIds.dekoji_finish, stageId: kojiStageId, ordinal: 10, key: 'dekoji_finish', label: 'De-koji', instructionTemplate: 'Remove koji from chamber, record final weight, and cool gradually.', sectionKey: 'dekoji', sectionLabel: 'De-koji', notes: 'De-koji usually 10-18h after peak; often 48-50h from inoculation. Final weight ratio around 12-17% is acceptable, even 10-20%.' });

    // Koji metrics
    const pmKojiTemp = 'pm-koji-ueda-koji_temp_c';
    const pmChamberTemp = 'pm-koji-ueda-chamber_temp_c';
    const pmWeightRatio = 'pm-koji-ueda-weight_ratio_pct';
    const pmNetWeight = 'pm-koji-ueda-net_weight_g';
    ctx.db.ProcessMetric.insert({ id: pmKojiTemp, processAssetId: kojiEntityId, ordinal: 1, key: 'koji_temp_c', label: 'Koji Temperature', valueType: { tag: 'number' }, unit: '°C', isTimeSeries: true, notes: undefined });
    ctx.db.ProcessMetric.insert({ id: pmChamberTemp, processAssetId: kojiEntityId, ordinal: 2, key: 'chamber_temp_c', label: 'Chamber Temperature', valueType: { tag: 'number' }, unit: '°C', isTimeSeries: true, notes: undefined });
    ctx.db.ProcessMetric.insert({ id: pmWeightRatio, processAssetId: kojiEntityId, ordinal: 3, key: 'weight_ratio_pct', label: 'Weight Ratio', valueType: { tag: 'number' }, unit: '%', isTimeSeries: true, notes: undefined });
    ctx.db.ProcessMetric.insert({ id: pmNetWeight, processAssetId: kojiEntityId, ordinal: 4, key: 'net_weight_g', label: 'Net Weight', valueType: { tag: 'number' }, unit: 'g', isTimeSeries: true, notes: undefined });

    // Koji stage metrics (skeletal — a few examples with target ranges)
    ctx.db.StageMetric.insert({ id: 'sm-koji-ueda-making-koji_temp', stageId: kojiStageId, processMetricId: pmKojiTemp, ordinal: 1, trackByDefault: true, targetMinNumber: undefined, targetMaxNumber: undefined, targetText: undefined, notes: undefined });
    ctx.db.StageMetric.insert({ id: 'sm-koji-ueda-making-chamber_temp', stageId: kojiStageId, processMetricId: pmChamberTemp, ordinal: 2, trackByDefault: true, targetMinNumber: undefined, targetMaxNumber: undefined, targetText: undefined, notes: undefined });
    ctx.db.StageMetric.insert({ id: 'sm-koji-ueda-making-weight_ratio', stageId: kojiStageId, processMetricId: pmWeightRatio, ordinal: 3, trackByDefault: true, targetMinNumber: undefined, targetMaxNumber: undefined, targetText: undefined, notes: undefined });

    // Koji schedule (TaskSpec rows) — with explicit sectionKey/sectionLabel
    const kojiSteps: SeedStep[] = [
      { label: 'Soak + Drain Rest', sectionKey: 'soaking', sectionLabel: 'Soaking', atH: 0, durationH: 4, goals: ['Target 29–32% weight gain by end of soak/drain period'], checks: [], actions: ['Soak rice to target absorption, drain, then rest to allow moisture to distribute evenly'] },
      { label: 'Steam Rice', sectionKey: 'steaming', sectionLabel: 'Steaming', atH: 4, durationH: 1, goals: ['Target 42–43% post-steam weight gain (40–44% acceptable)'], checks: [], actions: ['Steam thoroughly until grains are evenly gelatinized through the center'] },
      { label: 'Hiki-komi / Drying', sectionKey: 'drying', sectionLabel: 'Hiki-komi / Drying', atH: 5, durationH: 3, goals: ['Dry rice down to 28–31% weight gain before inoculation', 'For a first run with a new rice, aim for 29–30%'], checks: ['Keep rice spread out for even drying', 'Use ~37–40°C chamber heat; up to 45°C is acceptable in an oven', 'Avoid prolonged exposure above 50°C'], actions: ['Dry steamed rice on racks in a warm, ventilated chamber or low-temp oven until target weight is reached'] },
      { label: 'Tane-kiri / Inoculation', sectionKey: 'inoculation', sectionLabel: 'Tane-kiri / Inoculation', atH: 8, durationH: undefined, goals: ['Rice will typically end around 29–30% after tane-kiri'], checks: ['Rice must be at or below 40°C before inoculation', 'Distribute spores as evenly as possible'], actions: ['Measure and dilute starter as needed, then shake evenly over rice while breaking up clumps and turning rice'] },
      { label: 'Momi-age / Germination', sectionKey: 'germination', sectionLabel: 'Momi-age / Germination', atH: 8, durationH: 18, goals: ['Chamber target: 32°C', 'Koji target at start: 32°C', 'Expected weight ratio: 28–29%'], checks: ['Use sanitized tubs with lids loosely placed to retain rice moisture', 'Do not add extra humidity to the chamber'], actions: ['Divide rice into tubs, record weights, loosely cover, and hold at 32°C for germination'] },
      { label: 'Mori / Heaping', sectionKey: 'mori', sectionLabel: 'Mori / Heaping', atH: 26, durationH: 6, goals: ['Weight should remain stable, with less than 0.5% drop', 'Koji temp target at start: 32.5–34°C', 'Chamber target: 32°C'], checks: ['Proceed to naka when surface haze reaches roughly 10–20%'], actions: ['Break up any clumps, stir lightly, record weight, and crack lid slightly for oxygen'] },
      { label: 'Naka-shigoto / Middle Work', sectionKey: 'naka', sectionLabel: 'Naka-shigoto / Middle Work', atH: 32, durationH: 6, goals: ['Weight should remain stable, with less than 0.5% drop', 'Koji temp target at start: 34–35°C', 'Chamber target: 33–34°C'], checks: ['Proceed to shimai when surface haze reaches roughly 30–40%'], actions: ['Mix lightly, break up clumps so grains are loose again, and record weight'] },
      { label: 'Shimai-shigoto / Final Work', sectionKey: 'shimai', sectionLabel: 'Shimai-shigoto / Final Work', atH: 38, durationH: undefined, goals: ['Ideal timing is around 38.5°C koji temperature', 'Koji temp target at start: 38–39°C', 'Chamber target: 35–36°C'], checks: ['Once koji reaches 40°C, or at shimai, remove lid and cover tub with a clean dry cotton towel'], actions: ['Mix thoroughly so grains are separated, record weight, then transition from lid to dry towel cover'] },
      { label: 'Peak Temperature Hold', sectionKey: 'peak', sectionLabel: 'Peak Temperature', atH: 42, durationH: undefined, goals: ['Target peak koji temperature: 40–41°C for a typical batch', 'Acceptable overall peak range: 40–43°C depending on strain and goals', 'Maintain near peak until de-koji'], checks: ['Start de-koji timing once peak temperature is reached', 'If temperature overshoots, mix and/or lower chamber by 1–2°C', 'Do not remove towel during correction or rice may dry too quickly'], actions: ['Hold near peak temperature and monitor for stability'] },
      { label: 'De-koji', sectionKey: 'dekoji', sectionLabel: 'De-koji', atH: 50, durationH: undefined, goals: ['Typical finish is 48–50 hours from tane-kiri', 'Final weight ratio often lands around 13–17%, though 10–20% is acceptable'], checks: ['Usually finish 10–18 hours after peak temperature is reached', 'Cool in a dry place or fridge, but do not seal immediately to avoid condensation'], actions: ['Remove koji from chamber, record final weight, and cool gradually'] },
    ];

    insertTaskSpecSteps(ctx, kojiEntityId, kojiSteps);
  }

  // ── Moto process ──────────────────────────────────────────────────────────

  const motoEntityId = 'ent-process-moto-sokujo';
  if (!ctx.db.Asset.id.find(motoEntityId)) {
    ctx.db.Asset.insert({
      id: motoEntityId, ownerId: systemOwner,
      dataType: { tag: 'process' }, assetKind: { tag: 'snapshot' },
      name: 'Sokujo Moto Method', description: undefined, version: '1.0.0',
      isPublic: true, isArchived: false,
      lineageRootId: motoEntityId, parentAssetId: undefined,
      provenanceKind: { tag: 'original' }, provenanceAssetId: undefined,
      createdAt: now, updatedAt: now,
    });
    ctx.db.Process.insert({ assetId: motoEntityId, processKind: { tag: 'moto' }, notes: undefined });

    // Moto params
    ctx.db.ProcessParameter.insert({ id: 'pps-moto-sokujo-1', processAssetId: motoEntityId, ordinal: 1, key: 'rice_frac', label: 'Rice Fraction', valueType: { tag: 'number' }, unit: undefined, defaultNumberValue: 0.07, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-moto-sokujo-2', processAssetId: motoEntityId, ordinal: 2, key: 'koji_frac', label: 'Koji Fraction', valueType: { tag: 'number' }, unit: undefined, defaultNumberValue: 0.3, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-moto-sokujo-3', processAssetId: motoEntityId, ordinal: 3, key: 'water_l_per_kg', label: 'Water per kg', valueType: { tag: 'number' }, unit: 'L/kg', defaultNumberValue: 1.07, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-moto-sokujo-4', processAssetId: motoEntityId, ordinal: 4, key: 'yeast_pitch_rate_m_per_ml', label: 'Yeast Pitch Rate', valueType: { tag: 'number' }, unit: 'M/mL', defaultNumberValue: 3, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-moto-sokujo-5', processAssetId: motoEntityId, ordinal: 5, key: 'acid_ref_ml_per_l', label: 'Acid Ref mL/L', valueType: { tag: 'number' }, unit: 'mL/L', defaultNumberValue: 0.03, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParameter.insert({ id: 'pps-moto-sokujo-6', processAssetId: motoEntityId, ordinal: 6, key: 'acid_ref_strength_pct', label: 'Acid Ref Strength', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 88, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });

    // Moto stage
    const motoStageId = 'pstg-moto-sokujo-build';
    ctx.db.ProcessStage.insert({ id: motoStageId, processAssetId: motoEntityId, ordinal: 1, key: 'moto_build', label: 'Moto Build', materialOrdinal: undefined, notes: undefined });

    // Moto material slots
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moto-rice', processAssetId: motoEntityId, stageId: motoStageId, ordinal: 1, key: 'rice', label: 'Rice', materialClass: { tag: 'rice' }, quantityMode: { tag: 'ratio_of_total_rice' }, quantityValue: 0.07, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moto-koji', processAssetId: motoEntityId, stageId: motoStageId, ordinal: 2, key: 'koji', label: 'Koji', materialClass: { tag: 'koji' }, quantityMode: { tag: 'ratio_of_stage_rice' }, quantityValue: 0.3, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moto-water', processAssetId: motoEntityId, stageId: motoStageId, ordinal: 3, key: 'water', label: 'Water', materialClass: { tag: 'water' }, quantityMode: { tag: 'ratio_of_target' }, quantityValue: 1.07, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moto-yeast', processAssetId: motoEntityId, stageId: motoStageId, ordinal: 4, key: 'yeast', label: 'Yeast', materialClass: { tag: 'yeast' }, quantityMode: { tag: 'absolute' }, quantityValue: undefined, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moto-acid', processAssetId: motoEntityId, stageId: motoStageId, ordinal: 5, key: 'acid', label: 'Acid', materialClass: { tag: 'acid' }, quantityMode: { tag: 'absolute' }, quantityValue: undefined, quantityUnit: undefined, notes: undefined });

    // Moto schedule (TaskSpec rows)
    const motoSteps: SeedStep[] = [
      { label: 'Prepare Moto Water', atH: 0, durationH: 1, goals: ['Water treated and at target temperature'], checks: [], actions: ['Measure water, add mineral salts and lactic acid, mix thoroughly'] },
      { label: 'Combine Koji, Water, and Yeast', atH: 1, durationH: undefined, goals: ['Koji hydrated and yeast pitched'], checks: [], actions: ['Add koji to treated water, stir to break up clumps', 'Pitch yeast into the mixture'] },
      { label: 'Add Kake Rice', atH: 2, durationH: undefined, goals: ['Steamed kake rice incorporated into moto'], checks: [], actions: ['Add cooled steamed rice, mix evenly into koji-water mixture'] },
      { label: 'Fermentation', atH: 2, durationH: 336, goals: ['Active fermentation with yeast propagation'], checks: ['Stir once or twice daily for the first few days', 'Monitor temperature and aroma for healthy fermentation signs'], actions: [] },
      { label: 'Moto Ready', atH: 338, durationH: undefined, goals: ['Moto is mature and ready for moromi build'], checks: ['Confirm healthy yeast population before proceeding to soe'], actions: [] },
    ];

    insertTaskSpecSteps(ctx, motoEntityId, motoSteps);
  }

  // ── Moromi process ────────────────────────────────────────────────────────

  const moromiEntityId = 'ent-process-moromi-sandan';
  if (!ctx.db.Asset.id.find(moromiEntityId)) {
    ctx.db.Asset.insert({
      id: moromiEntityId, ownerId: systemOwner,
      dataType: { tag: 'process' }, assetKind: { tag: 'snapshot' },
      name: 'Sandan Moromi Method', description: undefined, version: '1.0.0',
      isPublic: true, isArchived: false,
      lineageRootId: moromiEntityId, parentAssetId: undefined,
      provenanceKind: { tag: 'original' }, provenanceAssetId: undefined,
      createdAt: now, updatedAt: now,
    });
    ctx.db.Process.insert({ assetId: moromiEntityId, processKind: { tag: 'moromi' }, notes: undefined });

    // Moromi stages
    const soeStageId = 'pstg-moromi-sandan-soe';
    const odoriStageId = 'pstg-moromi-sandan-odori';
    const nakaStageId = 'pstg-moromi-sandan-naka';
    const tomeStageId = 'pstg-moromi-sandan-tome';

    ctx.db.ProcessStage.insert({ id: soeStageId, processAssetId: moromiEntityId, ordinal: 1, key: 'soe', label: 'Soe', materialOrdinal: 1, notes: undefined });
    ctx.db.ProcessStage.insert({ id: odoriStageId, processAssetId: moromiEntityId, ordinal: 2, key: 'odori', label: 'Odori', materialOrdinal: undefined, notes: undefined });
    ctx.db.ProcessStage.insert({ id: nakaStageId, processAssetId: moromiEntityId, ordinal: 3, key: 'naka', label: 'Naka', materialOrdinal: 2, notes: undefined });
    ctx.db.ProcessStage.insert({ id: tomeStageId, processAssetId: moromiEntityId, ordinal: 4, key: 'tome', label: 'Tome', materialOrdinal: 3, notes: undefined });

    // Moromi material slots — soe
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moromi-soe-rice', processAssetId: moromiEntityId, stageId: soeStageId, ordinal: 1, key: 'rice', label: 'Rice', materialClass: { tag: 'rice' }, quantityMode: { tag: 'ratio_of_total_rice' }, quantityValue: 0.15, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moromi-soe-koji', processAssetId: moromiEntityId, stageId: soeStageId, ordinal: 2, key: 'koji', label: 'Koji', materialClass: { tag: 'koji' }, quantityMode: { tag: 'ratio_of_stage_rice' }, quantityValue: 0.28, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moromi-soe-water', processAssetId: moromiEntityId, stageId: soeStageId, ordinal: 3, key: 'water', label: 'Water', materialClass: { tag: 'water' }, quantityMode: { tag: 'ratio_of_target' }, quantityValue: 0.92, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moromi-soe-adjunct', processAssetId: moromiEntityId, stageId: soeStageId, ordinal: 4, key: 'soe_adjunct', label: 'Soe Adjunct', materialClass: { tag: 'adjunct' }, quantityMode: { tag: 'ratio_of_total_rice' }, quantityValue: undefined, quantityUnit: undefined, notes: undefined });

    // Moromi material slots — naka
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moromi-naka-rice', processAssetId: moromiEntityId, stageId: nakaStageId, ordinal: 5, key: 'rice', label: 'Rice', materialClass: { tag: 'rice' }, quantityMode: { tag: 'ratio_of_total_rice' }, quantityValue: 0.30, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moromi-naka-koji', processAssetId: moromiEntityId, stageId: nakaStageId, ordinal: 6, key: 'koji', label: 'Koji', materialClass: { tag: 'koji' }, quantityMode: { tag: 'ratio_of_stage_rice' }, quantityValue: 0.21, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moromi-naka-water', processAssetId: moromiEntityId, stageId: nakaStageId, ordinal: 7, key: 'water', label: 'Water', materialClass: { tag: 'water' }, quantityMode: { tag: 'ratio_of_target' }, quantityValue: 1.2, quantityUnit: undefined, notes: undefined });

    // Moromi material slots — tome
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moromi-tome-rice', processAssetId: moromiEntityId, stageId: tomeStageId, ordinal: 8, key: 'rice', label: 'Rice', materialClass: { tag: 'rice' }, quantityMode: { tag: 'ratio_of_total_rice' }, quantityValue: 0.48, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moromi-tome-koji', processAssetId: moromiEntityId, stageId: tomeStageId, ordinal: 9, key: 'koji', label: 'Koji', materialClass: { tag: 'koji' }, quantityMode: { tag: 'ratio_of_stage_rice' }, quantityValue: 0.21, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlot.insert({ id: 'pmss-moromi-tome-water', processAssetId: moromiEntityId, stageId: tomeStageId, ordinal: 10, key: 'water', label: 'Water', materialClass: { tag: 'water' }, quantityMode: { tag: 'ratio_of_target' }, quantityValue: 1.2, quantityUnit: undefined, notes: undefined });

    // Moromi metrics
    const pmMoromiTemp = 'pm-moromi-sandan-moromi_temp_c';
    const pmAmbientTemp = 'pm-moromi-sandan-ambient_temp_c';
    const pmPh = 'pm-moromi-sandan-ph';
    const pmBaume = 'pm-moromi-sandan-baume';
    ctx.db.ProcessMetric.insert({ id: pmMoromiTemp, processAssetId: moromiEntityId, ordinal: 1, key: 'moromi_temp_c', label: 'Moromi Temperature', valueType: { tag: 'number' }, unit: '°C', isTimeSeries: true, notes: undefined });
    ctx.db.ProcessMetric.insert({ id: pmAmbientTemp, processAssetId: moromiEntityId, ordinal: 2, key: 'ambient_temp_c', label: 'Ambient Temperature', valueType: { tag: 'number' }, unit: '°C', isTimeSeries: true, notes: undefined });
    ctx.db.ProcessMetric.insert({ id: pmPh, processAssetId: moromiEntityId, ordinal: 3, key: 'ph', label: 'pH', valueType: { tag: 'number' }, unit: undefined, isTimeSeries: true, notes: undefined });
    ctx.db.ProcessMetric.insert({ id: pmBaume, processAssetId: moromiEntityId, ordinal: 4, key: 'baume', label: 'Baumé', valueType: { tag: 'number' }, unit: '°Bé', isTimeSeries: true, notes: undefined });

    // Moromi stage metrics (skeletal — one example per addition stage)
    ctx.db.StageMetric.insert({ id: 'sm-moromi-sandan-soe-temp', stageId: soeStageId, processMetricId: pmMoromiTemp, ordinal: 1, trackByDefault: true, targetMinNumber: undefined, targetMaxNumber: undefined, targetText: undefined, notes: undefined });
    ctx.db.StageMetric.insert({ id: 'sm-moromi-sandan-naka-temp', stageId: nakaStageId, processMetricId: pmMoromiTemp, ordinal: 1, trackByDefault: true, targetMinNumber: undefined, targetMaxNumber: undefined, targetText: undefined, notes: undefined });
    ctx.db.StageMetric.insert({ id: 'sm-moromi-sandan-tome-temp', stageId: tomeStageId, processMetricId: pmMoromiTemp, ordinal: 1, trackByDefault: true, targetMinNumber: undefined, targetMaxNumber: undefined, targetText: undefined, notes: undefined });
  }

  // ── Recipe snapshot entity ────────────────────────────────────────────────

  const recipeSnapshotId = 'ent-recipe-sakura-ginjo-snap';
  if (!ctx.db.Asset.id.find(recipeSnapshotId)) {
    ctx.db.Asset.insert({
      id: recipeSnapshotId, ownerId: systemOwner,
      dataType: { tag: 'recipe' }, assetKind: { tag: 'snapshot' },
      name: 'Sakura Ginjo',
      description: 'A light ginjo-style sake with delicate sakura petal additions during soe. Uses sokujo moto with sandan moromi build and soft ginjo water profile.',
      version: '1.0.0',
      isPublic: true, isArchived: false,
      lineageRootId: recipeSnapshotId, parentAssetId: undefined,
      provenanceKind: { tag: 'original' }, provenanceAssetId: undefined,
      createdAt: now, updatedAt: now,
    });

    ctx.db.Recipe.insert({
      assetId: recipeSnapshotId,
      defaultWaterProfileAssetId: waterEntityId,
      attachedBatchId: undefined,
      notes: undefined,
    });

    // RecipeProcessUse
    const rpuKojiId = 'rpu-sakura-koji';
    const rpuMotoId = 'rpu-sakura-moto';
    const rpuMoromiId = 'rpu-sakura-moromi';
    ctx.db.RecipeProcess.insert({ id: rpuKojiId, recipeAssetId: recipeSnapshotId, ordinal: 1, label: 'Koji', processSnapshotAssetId: kojiEntityId, notes: undefined });
    ctx.db.RecipeProcess.insert({ id: rpuMotoId, recipeAssetId: recipeSnapshotId, ordinal: 2, label: 'Moto', processSnapshotAssetId: motoEntityId, notes: undefined });
    ctx.db.RecipeProcess.insert({ id: rpuMoromiId, recipeAssetId: recipeSnapshotId, ordinal: 3, label: 'Moromi', processSnapshotAssetId: moromiEntityId, notes: undefined });

    // RecipeMaterialSpec
    const rmsMainRiceId = 'rms-sakura-main-rice';
    const rmsKojiRiceId = 'rms-sakura-koji-rice';
    const rmsWaterId = 'rms-sakura-water';
    const rmsYeastId = 'rms-sakura-yeast';
    const rmsAcidId = 'rms-sakura-acid';
    const rmsSakuraId = 'rms-sakura-sakura-petals';

    ctx.db.RecipeMaterial.insert({ id: rmsMainRiceId, recipeAssetId: recipeSnapshotId, key: 'main_rice', label: 'Main Rice', materialClass: { tag: 'rice' }, defaultUnit: 'kg', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });
    ctx.db.RecipeMaterial.insert({ id: rmsKojiRiceId, recipeAssetId: recipeSnapshotId, key: 'koji_rice', label: 'Koji Rice', materialClass: { tag: 'rice' }, defaultUnit: 'kg', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });
    ctx.db.RecipeMaterial.insert({ id: rmsWaterId, recipeAssetId: recipeSnapshotId, key: 'water', label: 'Water', materialClass: { tag: 'water' }, defaultUnit: 'L', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });
    ctx.db.RecipeMaterial.insert({ id: rmsYeastId, recipeAssetId: recipeSnapshotId, key: 'yeast', label: 'Yeast', materialClass: { tag: 'yeast' }, defaultUnit: 'unit', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });
    ctx.db.RecipeMaterial.insert({ id: rmsAcidId, recipeAssetId: recipeSnapshotId, key: 'acid', label: 'Acid', materialClass: { tag: 'acid' }, defaultUnit: 'mL', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });
    ctx.db.RecipeMaterial.insert({ id: rmsSakuraId, recipeAssetId: recipeSnapshotId, key: 'sakura_petals', label: 'Sakura Petals', materialClass: { tag: 'adjunct' }, defaultUnit: 'kg', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });

    // RecipeProcessMaterialBinding — moto
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMotoId, processMaterialSlotId: 'pmss-moto-rice', recipeMaterialId: rmsMainRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMotoId, processMaterialSlotId: 'pmss-moto-koji', recipeMaterialId: rmsKojiRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMotoId, processMaterialSlotId: 'pmss-moto-water', recipeMaterialId: rmsWaterId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMotoId, processMaterialSlotId: 'pmss-moto-yeast', recipeMaterialId: rmsYeastId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMotoId, processMaterialSlotId: 'pmss-moto-acid', recipeMaterialId: rmsAcidId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });

    // RecipeProcessMaterialBinding — moromi soe
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMoromiId, processMaterialSlotId: 'pmss-moromi-soe-rice', recipeMaterialId: rmsMainRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMoromiId, processMaterialSlotId: 'pmss-moromi-soe-koji', recipeMaterialId: rmsKojiRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMoromiId, processMaterialSlotId: 'pmss-moromi-soe-water', recipeMaterialId: rmsWaterId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMoromiId, processMaterialSlotId: 'pmss-moromi-soe-adjunct', recipeMaterialId: rmsSakuraId, quantityOverride: 0.0005, quantityUnitOverride: undefined, notes: undefined });

    // RecipeProcessMaterialBinding — moromi naka
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMoromiId, processMaterialSlotId: 'pmss-moromi-naka-rice', recipeMaterialId: rmsMainRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMoromiId, processMaterialSlotId: 'pmss-moromi-naka-koji', recipeMaterialId: rmsKojiRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMoromiId, processMaterialSlotId: 'pmss-moromi-naka-water', recipeMaterialId: rmsWaterId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });

    // RecipeProcessMaterialBinding — moromi tome
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMoromiId, processMaterialSlotId: 'pmss-moromi-tome-rice', recipeMaterialId: rmsMainRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMoromiId, processMaterialSlotId: 'pmss-moromi-tome-koji', recipeMaterialId: rmsKojiRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessId: rpuMoromiId, processMaterialSlotId: 'pmss-moromi-tome-water', recipeMaterialId: rmsWaterId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
  }
}
