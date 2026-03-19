/* eslint-disable @typescript-eslint/no-explicit-any */

import { insertTaskSpecSteps, type SeedStep } from './seedDataHelpers';

export function seedLibrary(ctx: any): void {
  const now = ctx.timestamp;
  const systemOwner = '__system__';

  // ── Water profile entity ──────────────────────────────────────────────────

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

  // ── Koji process ──────────────────────────────────────────────────────────

  const kojiEntityId = 'ent-process-koji-ueda';
  if (!ctx.db.Entity.id.find(kojiEntityId)) {
    ctx.db.Entity.insert({
      id: kojiEntityId, ownerId: systemOwner,
      dataType: { tag: 'process' }, entityKind: { tag: 'snapshot' },
      name: 'Ueda Koji Method', description: undefined, version: '1.0.0',
      isPublic: true, isArchived: false,
      lineageRootId: kojiEntityId, parentEntityId: undefined,
      provenanceKind: { tag: 'original' }, provenanceEntityId: undefined,
      createdAt: now, updatedAt: now,
    });
    ctx.db.Process.insert({ entityId: kojiEntityId, processKind: { tag: 'koji' }, notes: 'The Ueda method is a systematic approach to koji making with precise weight-tracking at each stage. Drying is the most critical step. Smaller batches may fluctuate more at peak temperature. The overall timeline from inoculation to de-koji is typically 48-50 hours.' });

    // Koji params — original 3 kept for compatibility projection, plus new process knobs
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-1', processEntityId: kojiEntityId, ordinal: 1, key: 'koji_g_per_kg_rice', label: 'Koji per kg Rice', valueType: { tag: 'number' }, unit: 'g/kg', defaultNumberValue: 0.08, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-2', processEntityId: kojiEntityId, ordinal: 2, key: 'carrier_name', label: 'Carrier', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Toasted Rice Flour', defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-3', processEntityId: kojiEntityId, ordinal: 3, key: 'carrier_ratio_g_per_g', label: 'Carrier Ratio', valueType: { tag: 'number' }, unit: 'g/g', defaultNumberValue: 5, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-4', processEntityId: kojiEntityId, ordinal: 4, key: 'starter_rate_low_g_per_kg', label: 'Starter Rate (Low)', valueType: { tag: 'number' }, unit: 'g/kg', defaultNumberValue: 0.05, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-5', processEntityId: kojiEntityId, ordinal: 5, key: 'starter_rate_typical_g_per_kg', label: 'Starter Rate (Typical)', valueType: { tag: 'number' }, unit: 'g/kg', defaultNumberValue: 0.08, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-6', processEntityId: kojiEntityId, ordinal: 6, key: 'starter_rate_high_g_per_kg', label: 'Starter Rate (High)', valueType: { tag: 'number' }, unit: 'g/kg', defaultNumberValue: 0.15, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-7', processEntityId: kojiEntityId, ordinal: 7, key: 'starter_extension_ratio', label: 'Starter Extension Ratio', valueType: { tag: 'number' }, unit: undefined, defaultNumberValue: 5, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-8', processEntityId: kojiEntityId, ordinal: 8, key: 'post_steam_target_min_pct', label: 'Post-Steam Weight Min', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 42, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-9', processEntityId: kojiEntityId, ordinal: 9, key: 'post_steam_target_max_pct', label: 'Post-Steam Weight Max', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 43, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-10', processEntityId: kojiEntityId, ordinal: 10, key: 'drying_target_min_pct', label: 'Drying Target Min', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 28, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-11', processEntityId: kojiEntityId, ordinal: 11, key: 'drying_target_max_pct', label: 'Drying Target Max', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 31, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-12', processEntityId: kojiEntityId, ordinal: 12, key: 'peak_target_min_c', label: 'Peak Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 40, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-13', processEntityId: kojiEntityId, ordinal: 13, key: 'peak_target_max_c', label: 'Peak Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 43, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-14', processEntityId: kojiEntityId, ordinal: 14, key: 'dekoji_hours_after_peak_min', label: 'De-koji Min Hours After Peak', valueType: { tag: 'number' }, unit: 'h', defaultNumberValue: 10, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-koji-ueda-15', processEntityId: kojiEntityId, ordinal: 15, key: 'dekoji_hours_after_peak_max', label: 'De-koji Max Hours After Peak', valueType: { tag: 'number' }, unit: 'h', defaultNumberValue: 18, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });

    // Koji stage
    const kojiStageId = 'pstg-koji-ueda-making';
    ctx.db.ProcessStageSpec.insert({ id: kojiStageId, processEntityId: kojiEntityId, ordinal: 1, key: 'koji_making', label: 'Koji Making', materialOrdinal: undefined, notes: undefined });

    // Koji material slots
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-koji-ueda-rice', processEntityId: kojiEntityId, stageSpecId: kojiStageId, ordinal: 1, key: 'rice', label: 'Rice', materialClass: { tag: 'rice' }, quantityMode: { tag: 'absolute' }, quantityValue: undefined, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-koji-ueda-tane', processEntityId: kojiEntityId, stageSpecId: kojiStageId, ordinal: 2, key: 'tane-koji', label: 'Tane-koji', materialClass: { tag: 'koji' }, quantityMode: { tag: 'absolute' }, quantityValue: undefined, quantityUnit: undefined, notes: undefined });

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

    ctx.db.ProcessStepSpec.insert({ id: kojiStepIds.soak, stageSpecId: kojiStageId, ordinal: 1, key: 'soak', label: 'Soak + Drain Rest', instructionTemplate: 'Soak rice to target absorption, drain, then rest to allow moisture to distribute evenly.', isCheckable: true, sectionKey: 'soaking', sectionLabel: 'Soaking', notes: undefined });
    ctx.db.ProcessStepSpec.insert({ id: kojiStepIds.steam, stageSpecId: kojiStageId, ordinal: 2, key: 'steam', label: 'Steam Rice', instructionTemplate: 'Steam thoroughly until grains are evenly gelatinized through the center.', isCheckable: true, sectionKey: 'steaming', sectionLabel: 'Steaming', notes: undefined });
    ctx.db.ProcessStepSpec.insert({ id: kojiStepIds.dry, stageSpecId: kojiStageId, ordinal: 3, key: 'dry', label: 'Hiki-komi / Drying', instructionTemplate: 'Dry steamed rice on racks in a warm, ventilated chamber or low-temp oven until target weight is reached.', isCheckable: true, sectionKey: 'drying', sectionLabel: 'Hiki-komi / Drying', notes: 'Drying is the most important step in the koji process. Avoid prolonged exposure above 50°C.' });
    ctx.db.ProcessStepSpec.insert({ id: kojiStepIds.inoculate, stageSpecId: kojiStageId, ordinal: 4, key: 'inoculate', label: 'Tane-kiri / Inoculation', instructionTemplate: 'Measure and dilute starter as needed, then shake evenly over rice while breaking up clumps and turning rice.', isCheckable: true, sectionKey: 'inoculation', sectionLabel: 'Tane-kiri / Inoculation', notes: 'Expect about 1% moisture drop from tane-kiri.' });
    ctx.db.ProcessStepSpec.insert({ id: kojiStepIds.germinate, stageSpecId: kojiStageId, ordinal: 5, key: 'germinate', label: 'Momi-age / Germination', instructionTemplate: 'Divide rice into tubs, record weights, loosely cover, and hold at 32°C for germination.', isCheckable: true, sectionKey: 'germination', sectionLabel: 'Momi-age / Germination', notes: undefined });
    ctx.db.ProcessStepSpec.insert({ id: kojiStepIds.mori_work, stageSpecId: kojiStageId, ordinal: 6, key: 'mori_work', label: 'Mori / Heaping', instructionTemplate: 'Break up any clumps, stir lightly, record weight, and crack lid slightly for oxygen.', isCheckable: true, sectionKey: 'mori', sectionLabel: 'Mori / Heaping', notes: undefined });
    ctx.db.ProcessStepSpec.insert({ id: kojiStepIds.naka_work, stageSpecId: kojiStageId, ordinal: 7, key: 'naka_work', label: 'Naka-shigoto / Middle Work', instructionTemplate: 'Mix lightly, break up clumps so grains are loose again, and record weight.', isCheckable: true, sectionKey: 'naka', sectionLabel: 'Naka-shigoto / Middle Work', notes: undefined });
    ctx.db.ProcessStepSpec.insert({ id: kojiStepIds.shimai_work, stageSpecId: kojiStageId, ordinal: 8, key: 'shimai_work', label: 'Shimai-shigoto / Final Work', instructionTemplate: 'Mix thoroughly so grains are separated, record weight, then transition from lid to dry towel cover.', isCheckable: true, sectionKey: 'shimai', sectionLabel: 'Shimai-shigoto / Final Work', notes: undefined });
    ctx.db.ProcessStepSpec.insert({ id: kojiStepIds.peak_hold, stageSpecId: kojiStageId, ordinal: 9, key: 'peak_hold', label: 'Peak Temperature Hold', instructionTemplate: 'Hold near peak temperature and monitor for stability.', isCheckable: true, sectionKey: 'peak', sectionLabel: 'Peak Temperature', notes: 'Smaller batches may fluctuate more at peak temperature.' });
    ctx.db.ProcessStepSpec.insert({ id: kojiStepIds.dekoji_finish, stageSpecId: kojiStageId, ordinal: 10, key: 'dekoji_finish', label: 'De-koji', instructionTemplate: 'Remove koji from chamber, record final weight, and cool gradually.', isCheckable: true, sectionKey: 'dekoji', sectionLabel: 'De-koji', notes: 'De-koji usually 10-18h after peak; often 48-50h from inoculation. Final weight ratio around 12-17% is acceptable, even 10-20%.' });

    // Koji step fields (ProcessStepFieldSpec)
    let fOrd = 0;

    // soak fields
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-soak-target_weight_ratio_min_pct', stepSpecId: kojiStepIds.soak, ordinal: fOrd++, key: 'target_weight_ratio_min_pct', label: 'Target Weight Ratio Min', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 29, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-soak-target_weight_ratio_max_pct', stepSpecId: kojiStepIds.soak, ordinal: fOrd++, key: 'target_weight_ratio_max_pct', label: 'Target Weight Ratio Max', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 32, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-soak-actual_weight_ratio_pct', stepSpecId: kojiStepIds.soak, ordinal: fOrd++, key: 'actual_weight_ratio_pct', label: 'Actual Weight Ratio', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-soak-proceed_note', stepSpecId: kojiStepIds.soak, ordinal: fOrd++, key: 'proceed_note', label: 'Proceed Note', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Soak to target weight', defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });

    // steam fields
    fOrd = 0;
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-steam-target_weight_ratio_min_pct', stepSpecId: kojiStepIds.steam, ordinal: fOrd++, key: 'target_weight_ratio_min_pct', label: 'Target Weight Ratio Min', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 42, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-steam-target_weight_ratio_max_pct', stepSpecId: kojiStepIds.steam, ordinal: fOrd++, key: 'target_weight_ratio_max_pct', label: 'Target Weight Ratio Max', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 43, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-steam-actual_weight_ratio_pct', stepSpecId: kojiStepIds.steam, ordinal: fOrd++, key: 'actual_weight_ratio_pct', label: 'Actual Weight Ratio', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-steam-proceed_note', stepSpecId: kojiStepIds.steam, ordinal: fOrd++, key: 'proceed_note', label: 'Proceed Note', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Steam thoroughly', defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });

    // dry fields
    fOrd = 0;
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dry-target_weight_ratio_min_pct', stepSpecId: kojiStepIds.dry, ordinal: fOrd++, key: 'target_weight_ratio_min_pct', label: 'Target Weight Ratio Min', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 28, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dry-target_weight_ratio_max_pct', stepSpecId: kojiStepIds.dry, ordinal: fOrd++, key: 'target_weight_ratio_max_pct', label: 'Target Weight Ratio Max', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 31, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dry-target_duration_h', stepSpecId: kojiStepIds.dry, ordinal: fOrd++, key: 'target_duration_h', label: 'Target Duration', valueType: { tag: 'number' }, unit: 'h', defaultNumberValue: 1, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dry-chamber_temp_min_c', stepSpecId: kojiStepIds.dry, ordinal: fOrd++, key: 'chamber_temp_min_c', label: 'Chamber Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 37, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dry-chamber_temp_max_c', stepSpecId: kojiStepIds.dry, ordinal: fOrd++, key: 'chamber_temp_max_c', label: 'Chamber Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 45, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dry-actual_weight_ratio_pct', stepSpecId: kojiStepIds.dry, ordinal: fOrd++, key: 'actual_weight_ratio_pct', label: 'Actual Weight Ratio', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dry-actual_chamber_temp_c', stepSpecId: kojiStepIds.dry, ordinal: fOrd++, key: 'actual_chamber_temp_c', label: 'Actual Chamber Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dry-proceed_note', stepSpecId: kojiStepIds.dry, ordinal: fOrd++, key: 'proceed_note', label: 'Proceed Note', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Dry to reach target weight (1-5 hours as needed)', defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });

    // inoculate fields
    fOrd = 0;
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-inoculate-target_weight_ratio_min_pct', stepSpecId: kojiStepIds.inoculate, ordinal: fOrd++, key: 'target_weight_ratio_min_pct', label: 'Target Weight Ratio Min', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 29, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-inoculate-target_weight_ratio_max_pct', stepSpecId: kojiStepIds.inoculate, ordinal: fOrd++, key: 'target_weight_ratio_max_pct', label: 'Target Weight Ratio Max', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 30, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-inoculate-koji_temp_max_c', stepSpecId: kojiStepIds.inoculate, ordinal: fOrd++, key: 'koji_temp_max_c', label: 'Koji Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 40, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-inoculate-actual_weight_ratio_pct', stepSpecId: kojiStepIds.inoculate, ordinal: fOrd++, key: 'actual_weight_ratio_pct', label: 'Actual Weight Ratio', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-inoculate-actual_koji_temp_c', stepSpecId: kojiStepIds.inoculate, ordinal: fOrd++, key: 'actual_koji_temp_c', label: 'Actual Koji Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-inoculate-proceed_note', stepSpecId: kojiStepIds.inoculate, ordinal: fOrd++, key: 'proceed_note', label: 'Proceed Note', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Rice should be below 40°C', defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });

    // germinate fields
    fOrd = 0;
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-target_weight_ratio_min_pct', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'target_weight_ratio_min_pct', label: 'Target Weight Ratio Min', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 28, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-target_weight_ratio_max_pct', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'target_weight_ratio_max_pct', label: 'Target Weight Ratio Max', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 29, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-target_duration_h', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'target_duration_h', label: 'Target Duration', valueType: { tag: 'number' }, unit: 'h', defaultNumberValue: 18, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-chamber_temp_min_c', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'chamber_temp_min_c', label: 'Chamber Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 32, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-chamber_temp_max_c', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'chamber_temp_max_c', label: 'Chamber Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 32, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-koji_temp_min_c', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'koji_temp_min_c', label: 'Koji Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 32, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-koji_temp_max_c', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'koji_temp_max_c', label: 'Koji Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 32, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-actual_weight_ratio_pct', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'actual_weight_ratio_pct', label: 'Actual Weight Ratio', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-actual_chamber_temp_c', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'actual_chamber_temp_c', label: 'Actual Chamber Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-actual_koji_temp_c', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'actual_koji_temp_c', label: 'Actual Koji Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-germinate-proceed_note', stepSpecId: kojiStepIds.germinate, ordinal: fOrd++, key: 'proceed_note', label: 'Proceed Note', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Proceed based on timing', defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });

    // mori_work fields
    fOrd = 0;
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-mori_work-target_duration_h', stepSpecId: kojiStepIds.mori_work, ordinal: fOrd++, key: 'target_duration_h', label: 'Target Duration', valueType: { tag: 'number' }, unit: 'h', defaultNumberValue: 6, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-mori_work-chamber_temp_min_c', stepSpecId: kojiStepIds.mori_work, ordinal: fOrd++, key: 'chamber_temp_min_c', label: 'Chamber Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 32, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-mori_work-chamber_temp_max_c', stepSpecId: kojiStepIds.mori_work, ordinal: fOrd++, key: 'chamber_temp_max_c', label: 'Chamber Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 32, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-mori_work-koji_temp_min_c', stepSpecId: kojiStepIds.mori_work, ordinal: fOrd++, key: 'koji_temp_min_c', label: 'Koji Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 32.5, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-mori_work-koji_temp_max_c', stepSpecId: kojiStepIds.mori_work, ordinal: fOrd++, key: 'koji_temp_max_c', label: 'Koji Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 34, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-mori_work-actual_chamber_temp_c', stepSpecId: kojiStepIds.mori_work, ordinal: fOrd++, key: 'actual_chamber_temp_c', label: 'Actual Chamber Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-mori_work-actual_koji_temp_c', stepSpecId: kojiStepIds.mori_work, ordinal: fOrd++, key: 'actual_koji_temp_c', label: 'Actual Koji Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-mori_work-proceed_note', stepSpecId: kojiStepIds.mori_work, ordinal: fOrd++, key: 'proceed_note', label: 'Proceed Note', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Proceed to naka at roughly 10-20% surface haze', defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });

    // naka_work fields
    fOrd = 0;
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-naka_work-target_duration_h', stepSpecId: kojiStepIds.naka_work, ordinal: fOrd++, key: 'target_duration_h', label: 'Target Duration', valueType: { tag: 'number' }, unit: 'h', defaultNumberValue: 6, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-naka_work-chamber_temp_min_c', stepSpecId: kojiStepIds.naka_work, ordinal: fOrd++, key: 'chamber_temp_min_c', label: 'Chamber Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 33, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-naka_work-chamber_temp_max_c', stepSpecId: kojiStepIds.naka_work, ordinal: fOrd++, key: 'chamber_temp_max_c', label: 'Chamber Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 34, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-naka_work-koji_temp_min_c', stepSpecId: kojiStepIds.naka_work, ordinal: fOrd++, key: 'koji_temp_min_c', label: 'Koji Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 34, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-naka_work-koji_temp_max_c', stepSpecId: kojiStepIds.naka_work, ordinal: fOrd++, key: 'koji_temp_max_c', label: 'Koji Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 35, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-naka_work-actual_chamber_temp_c', stepSpecId: kojiStepIds.naka_work, ordinal: fOrd++, key: 'actual_chamber_temp_c', label: 'Actual Chamber Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-naka_work-actual_koji_temp_c', stepSpecId: kojiStepIds.naka_work, ordinal: fOrd++, key: 'actual_koji_temp_c', label: 'Actual Koji Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-naka_work-proceed_note', stepSpecId: kojiStepIds.naka_work, ordinal: fOrd++, key: 'proceed_note', label: 'Proceed Note', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Proceed to shimai at roughly 30-40% surface haze', defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });

    // shimai_work fields
    fOrd = 0;
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-shimai_work-chamber_temp_min_c', stepSpecId: kojiStepIds.shimai_work, ordinal: fOrd++, key: 'chamber_temp_min_c', label: 'Chamber Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 35, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-shimai_work-chamber_temp_max_c', stepSpecId: kojiStepIds.shimai_work, ordinal: fOrd++, key: 'chamber_temp_max_c', label: 'Chamber Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 36, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-shimai_work-koji_temp_min_c', stepSpecId: kojiStepIds.shimai_work, ordinal: fOrd++, key: 'koji_temp_min_c', label: 'Koji Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 38, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-shimai_work-koji_temp_max_c', stepSpecId: kojiStepIds.shimai_work, ordinal: fOrd++, key: 'koji_temp_max_c', label: 'Koji Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 39, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-shimai_work-actual_chamber_temp_c', stepSpecId: kojiStepIds.shimai_work, ordinal: fOrd++, key: 'actual_chamber_temp_c', label: 'Actual Chamber Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-shimai_work-actual_koji_temp_c', stepSpecId: kojiStepIds.shimai_work, ordinal: fOrd++, key: 'actual_koji_temp_c', label: 'Actual Koji Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-shimai_work-proceed_note', stepSpecId: kojiStepIds.shimai_work, ordinal: fOrd++, key: 'proceed_note', label: 'Proceed Note', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: '38.5°C is a good timing target for shimai', defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });

    // peak_hold fields
    fOrd = 0;
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-peak_hold-chamber_temp_min_c', stepSpecId: kojiStepIds.peak_hold, ordinal: fOrd++, key: 'chamber_temp_min_c', label: 'Chamber Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 35, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-peak_hold-chamber_temp_max_c', stepSpecId: kojiStepIds.peak_hold, ordinal: fOrd++, key: 'chamber_temp_max_c', label: 'Chamber Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 36, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-peak_hold-koji_temp_min_c', stepSpecId: kojiStepIds.peak_hold, ordinal: fOrd++, key: 'koji_temp_min_c', label: 'Koji Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 40, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-peak_hold-koji_temp_max_c', stepSpecId: kojiStepIds.peak_hold, ordinal: fOrd++, key: 'koji_temp_max_c', label: 'Koji Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 43, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-peak_hold-actual_chamber_temp_c', stepSpecId: kojiStepIds.peak_hold, ordinal: fOrd++, key: 'actual_chamber_temp_c', label: 'Actual Chamber Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-peak_hold-actual_koji_temp_c', stepSpecId: kojiStepIds.peak_hold, ordinal: fOrd++, key: 'actual_koji_temp_c', label: 'Actual Koji Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-peak_hold-proceed_note', stepSpecId: kojiStepIds.peak_hold, ordinal: fOrd++, key: 'proceed_note', label: 'Proceed Note', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Start timing once peak temperature is reached', defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });

    // dekoji_finish fields
    fOrd = 0;
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dekoji_finish-target_weight_ratio_min_pct', stepSpecId: kojiStepIds.dekoji_finish, ordinal: fOrd++, key: 'target_weight_ratio_min_pct', label: 'Target Weight Ratio Min', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 13, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dekoji_finish-target_weight_ratio_max_pct', stepSpecId: kojiStepIds.dekoji_finish, ordinal: fOrd++, key: 'target_weight_ratio_max_pct', label: 'Target Weight Ratio Max', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 17, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dekoji_finish-koji_temp_min_c', stepSpecId: kojiStepIds.dekoji_finish, ordinal: fOrd++, key: 'koji_temp_min_c', label: 'Koji Temp Min', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 40, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dekoji_finish-koji_temp_max_c', stepSpecId: kojiStepIds.dekoji_finish, ordinal: fOrd++, key: 'koji_temp_max_c', label: 'Koji Temp Max', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: 43, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dekoji_finish-actual_weight_ratio_pct', stepSpecId: kojiStepIds.dekoji_finish, ordinal: fOrd++, key: 'actual_weight_ratio_pct', label: 'Actual Weight Ratio', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dekoji_finish-actual_koji_temp_c', stepSpecId: kojiStepIds.dekoji_finish, ordinal: fOrd++, key: 'actual_koji_temp_c', label: 'Actual Koji Temp', valueType: { tag: 'number' }, unit: '°C', defaultNumberValue: undefined, defaultTextValue: undefined, defaultBoolValue: undefined, captureActualOnComplete: true, notes: undefined });
    ctx.db.ProcessStepFieldSpec.insert({ id: 'psf-koji-ueda-dekoji_finish-proceed_note', stepSpecId: kojiStepIds.dekoji_finish, ordinal: fOrd++, key: 'proceed_note', label: 'Proceed Note', valueType: { tag: 'text' }, unit: undefined, defaultNumberValue: undefined, defaultTextValue: 'Finish roughly 10-18 hours after peak; typically 48-50 hours from tane-kiri', defaultBoolValue: undefined, captureActualOnComplete: false, notes: undefined });

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
  if (!ctx.db.Entity.id.find(motoEntityId)) {
    ctx.db.Entity.insert({
      id: motoEntityId, ownerId: systemOwner,
      dataType: { tag: 'process' }, entityKind: { tag: 'snapshot' },
      name: 'Sokujo Moto Method', description: undefined, version: '1.0.0',
      isPublic: true, isArchived: false,
      lineageRootId: motoEntityId, parentEntityId: undefined,
      provenanceKind: { tag: 'original' }, provenanceEntityId: undefined,
      createdAt: now, updatedAt: now,
    });
    ctx.db.Process.insert({ entityId: motoEntityId, processKind: { tag: 'moto' }, notes: undefined });

    // Moto params
    ctx.db.ProcessParamSpec.insert({ id: 'pps-moto-sokujo-1', processEntityId: motoEntityId, ordinal: 1, key: 'rice_frac', label: 'Rice Fraction', valueType: { tag: 'number' }, unit: undefined, defaultNumberValue: 0.07, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-moto-sokujo-2', processEntityId: motoEntityId, ordinal: 2, key: 'koji_frac', label: 'Koji Fraction', valueType: { tag: 'number' }, unit: undefined, defaultNumberValue: 0.3, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-moto-sokujo-3', processEntityId: motoEntityId, ordinal: 3, key: 'water_l_per_kg', label: 'Water per kg', valueType: { tag: 'number' }, unit: 'L/kg', defaultNumberValue: 1.07, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-moto-sokujo-4', processEntityId: motoEntityId, ordinal: 4, key: 'yeast_pitch_rate_m_per_ml', label: 'Yeast Pitch Rate', valueType: { tag: 'number' }, unit: 'M/mL', defaultNumberValue: 3, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-moto-sokujo-5', processEntityId: motoEntityId, ordinal: 5, key: 'acid_ref_ml_per_l', label: 'Acid Ref mL/L', valueType: { tag: 'number' }, unit: 'mL/L', defaultNumberValue: 0.03, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });
    ctx.db.ProcessParamSpec.insert({ id: 'pps-moto-sokujo-6', processEntityId: motoEntityId, ordinal: 6, key: 'acid_ref_strength_pct', label: 'Acid Ref Strength', valueType: { tag: 'number' }, unit: '%', defaultNumberValue: 88, defaultTextValue: undefined, defaultBoolValue: undefined, notes: undefined });

    // Moto stage
    const motoStageId = 'pstg-moto-sokujo-build';
    ctx.db.ProcessStageSpec.insert({ id: motoStageId, processEntityId: motoEntityId, ordinal: 1, key: 'moto_build', label: 'Moto Build', materialOrdinal: undefined, notes: undefined });

    // Moto material slots
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moto-rice', processEntityId: motoEntityId, stageSpecId: motoStageId, ordinal: 1, key: 'rice', label: 'Rice', materialClass: { tag: 'rice' }, quantityMode: { tag: 'ratio_of_total_rice' }, quantityValue: 0.07, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moto-koji', processEntityId: motoEntityId, stageSpecId: motoStageId, ordinal: 2, key: 'koji', label: 'Koji', materialClass: { tag: 'koji' }, quantityMode: { tag: 'ratio_of_stage_rice' }, quantityValue: 0.3, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moto-water', processEntityId: motoEntityId, stageSpecId: motoStageId, ordinal: 3, key: 'water', label: 'Water', materialClass: { tag: 'water' }, quantityMode: { tag: 'ratio_of_target' }, quantityValue: 1.07, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moto-yeast', processEntityId: motoEntityId, stageSpecId: motoStageId, ordinal: 4, key: 'yeast', label: 'Yeast', materialClass: { tag: 'yeast' }, quantityMode: { tag: 'absolute' }, quantityValue: undefined, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moto-acid', processEntityId: motoEntityId, stageSpecId: motoStageId, ordinal: 5, key: 'acid', label: 'Acid', materialClass: { tag: 'acid' }, quantityMode: { tag: 'absolute' }, quantityValue: undefined, quantityUnit: undefined, notes: undefined });

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
  if (!ctx.db.Entity.id.find(moromiEntityId)) {
    ctx.db.Entity.insert({
      id: moromiEntityId, ownerId: systemOwner,
      dataType: { tag: 'process' }, entityKind: { tag: 'snapshot' },
      name: 'Sandan Moromi Method', description: undefined, version: '1.0.0',
      isPublic: true, isArchived: false,
      lineageRootId: moromiEntityId, parentEntityId: undefined,
      provenanceKind: { tag: 'original' }, provenanceEntityId: undefined,
      createdAt: now, updatedAt: now,
    });
    ctx.db.Process.insert({ entityId: moromiEntityId, processKind: { tag: 'moromi' }, notes: undefined });

    // Moromi stages
    const soeStageId = 'pstg-moromi-sandan-soe';
    const odoriStageId = 'pstg-moromi-sandan-odori';
    const nakaStageId = 'pstg-moromi-sandan-naka';
    const tomeStageId = 'pstg-moromi-sandan-tome';

    ctx.db.ProcessStageSpec.insert({ id: soeStageId, processEntityId: moromiEntityId, ordinal: 1, key: 'soe', label: 'Soe', materialOrdinal: 1, notes: undefined });
    ctx.db.ProcessStageSpec.insert({ id: odoriStageId, processEntityId: moromiEntityId, ordinal: 2, key: 'odori', label: 'Odori', materialOrdinal: undefined, notes: undefined });
    ctx.db.ProcessStageSpec.insert({ id: nakaStageId, processEntityId: moromiEntityId, ordinal: 3, key: 'naka', label: 'Naka', materialOrdinal: 2, notes: undefined });
    ctx.db.ProcessStageSpec.insert({ id: tomeStageId, processEntityId: moromiEntityId, ordinal: 4, key: 'tome', label: 'Tome', materialOrdinal: 3, notes: undefined });

    // Moromi material slots — soe
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moromi-soe-rice', processEntityId: moromiEntityId, stageSpecId: soeStageId, ordinal: 1, key: 'rice', label: 'Rice', materialClass: { tag: 'rice' }, quantityMode: { tag: 'ratio_of_total_rice' }, quantityValue: 0.15, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moromi-soe-koji', processEntityId: moromiEntityId, stageSpecId: soeStageId, ordinal: 2, key: 'koji', label: 'Koji', materialClass: { tag: 'koji' }, quantityMode: { tag: 'ratio_of_stage_rice' }, quantityValue: 0.28, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moromi-soe-water', processEntityId: moromiEntityId, stageSpecId: soeStageId, ordinal: 3, key: 'water', label: 'Water', materialClass: { tag: 'water' }, quantityMode: { tag: 'ratio_of_target' }, quantityValue: 0.92, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moromi-soe-adjunct', processEntityId: moromiEntityId, stageSpecId: soeStageId, ordinal: 4, key: 'soe_adjunct', label: 'Soe Adjunct', materialClass: { tag: 'adjunct' }, quantityMode: { tag: 'ratio_of_total_rice' }, quantityValue: undefined, quantityUnit: undefined, notes: undefined });

    // Moromi material slots — naka
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moromi-naka-rice', processEntityId: moromiEntityId, stageSpecId: nakaStageId, ordinal: 5, key: 'rice', label: 'Rice', materialClass: { tag: 'rice' }, quantityMode: { tag: 'ratio_of_total_rice' }, quantityValue: 0.30, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moromi-naka-koji', processEntityId: moromiEntityId, stageSpecId: nakaStageId, ordinal: 6, key: 'koji', label: 'Koji', materialClass: { tag: 'koji' }, quantityMode: { tag: 'ratio_of_stage_rice' }, quantityValue: 0.21, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moromi-naka-water', processEntityId: moromiEntityId, stageSpecId: nakaStageId, ordinal: 7, key: 'water', label: 'Water', materialClass: { tag: 'water' }, quantityMode: { tag: 'ratio_of_target' }, quantityValue: 1.2, quantityUnit: undefined, notes: undefined });

    // Moromi material slots — tome
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moromi-tome-rice', processEntityId: moromiEntityId, stageSpecId: tomeStageId, ordinal: 8, key: 'rice', label: 'Rice', materialClass: { tag: 'rice' }, quantityMode: { tag: 'ratio_of_total_rice' }, quantityValue: 0.48, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moromi-tome-koji', processEntityId: moromiEntityId, stageSpecId: tomeStageId, ordinal: 9, key: 'koji', label: 'Koji', materialClass: { tag: 'koji' }, quantityMode: { tag: 'ratio_of_stage_rice' }, quantityValue: 0.21, quantityUnit: undefined, notes: undefined });
    ctx.db.ProcessMaterialSlotSpec.insert({ id: 'pmss-moromi-tome-water', processEntityId: moromiEntityId, stageSpecId: tomeStageId, ordinal: 10, key: 'water', label: 'Water', materialClass: { tag: 'water' }, quantityMode: { tag: 'ratio_of_target' }, quantityValue: 1.2, quantityUnit: undefined, notes: undefined });
  }

  // ── Recipe snapshot entity ────────────────────────────────────────────────

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
      defaultWaterProfileEntityId: waterEntityId,
      attachedBatchId: undefined,
      notes: undefined,
    });

    // RecipeProcessUse
    const rpuKojiId = 'rpu-sakura-koji';
    const rpuMotoId = 'rpu-sakura-moto';
    const rpuMoromiId = 'rpu-sakura-moromi';
    ctx.db.RecipeProcessUse.insert({ id: rpuKojiId, recipeEntityId: recipeSnapshotId, ordinal: 1, label: 'Koji', processSnapshotEntityId: kojiEntityId, notes: undefined });
    ctx.db.RecipeProcessUse.insert({ id: rpuMotoId, recipeEntityId: recipeSnapshotId, ordinal: 2, label: 'Moto', processSnapshotEntityId: motoEntityId, notes: undefined });
    ctx.db.RecipeProcessUse.insert({ id: rpuMoromiId, recipeEntityId: recipeSnapshotId, ordinal: 3, label: 'Moromi', processSnapshotEntityId: moromiEntityId, notes: undefined });

    // RecipeMaterialSpec
    const rmsMainRiceId = 'rms-sakura-main-rice';
    const rmsKojiRiceId = 'rms-sakura-koji-rice';
    const rmsWaterId = 'rms-sakura-water';
    const rmsYeastId = 'rms-sakura-yeast';
    const rmsAcidId = 'rms-sakura-acid';
    const rmsSakuraId = 'rms-sakura-sakura-petals';

    ctx.db.RecipeMaterialSpec.insert({ id: rmsMainRiceId, recipeEntityId: recipeSnapshotId, key: 'main_rice', label: 'Main Rice', materialClass: { tag: 'rice' }, defaultUnit: 'kg', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });
    ctx.db.RecipeMaterialSpec.insert({ id: rmsKojiRiceId, recipeEntityId: recipeSnapshotId, key: 'koji_rice', label: 'Koji Rice', materialClass: { tag: 'rice' }, defaultUnit: 'kg', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });
    ctx.db.RecipeMaterialSpec.insert({ id: rmsWaterId, recipeEntityId: recipeSnapshotId, key: 'water', label: 'Water', materialClass: { tag: 'water' }, defaultUnit: 'L', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });
    ctx.db.RecipeMaterialSpec.insert({ id: rmsYeastId, recipeEntityId: recipeSnapshotId, key: 'yeast', label: 'Yeast', materialClass: { tag: 'yeast' }, defaultUnit: 'unit', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });
    ctx.db.RecipeMaterialSpec.insert({ id: rmsAcidId, recipeEntityId: recipeSnapshotId, key: 'acid', label: 'Acid', materialClass: { tag: 'acid' }, defaultUnit: 'mL', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });
    ctx.db.RecipeMaterialSpec.insert({ id: rmsSakuraId, recipeEntityId: recipeSnapshotId, key: 'sakura_petals', label: 'Sakura Petals', materialClass: { tag: 'adjunct' }, defaultUnit: 'kg', catalogRefType: undefined, catalogRefId: undefined, customName: undefined, notes: undefined });

    // RecipeProcessMaterialBinding — moto
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMotoId, processMaterialSlotSpecId: 'pmss-moto-rice', recipeMaterialSpecId: rmsMainRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMotoId, processMaterialSlotSpecId: 'pmss-moto-koji', recipeMaterialSpecId: rmsKojiRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMotoId, processMaterialSlotSpecId: 'pmss-moto-water', recipeMaterialSpecId: rmsWaterId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMotoId, processMaterialSlotSpecId: 'pmss-moto-yeast', recipeMaterialSpecId: rmsYeastId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMotoId, processMaterialSlotSpecId: 'pmss-moto-acid', recipeMaterialSpecId: rmsAcidId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });

    // RecipeProcessMaterialBinding — moromi soe
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMoromiId, processMaterialSlotSpecId: 'pmss-moromi-soe-rice', recipeMaterialSpecId: rmsMainRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMoromiId, processMaterialSlotSpecId: 'pmss-moromi-soe-koji', recipeMaterialSpecId: rmsKojiRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMoromiId, processMaterialSlotSpecId: 'pmss-moromi-soe-water', recipeMaterialSpecId: rmsWaterId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMoromiId, processMaterialSlotSpecId: 'pmss-moromi-soe-adjunct', recipeMaterialSpecId: rmsSakuraId, quantityOverride: 0.0005, quantityUnitOverride: undefined, notes: undefined });

    // RecipeProcessMaterialBinding — moromi naka
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMoromiId, processMaterialSlotSpecId: 'pmss-moromi-naka-rice', recipeMaterialSpecId: rmsMainRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMoromiId, processMaterialSlotSpecId: 'pmss-moromi-naka-koji', recipeMaterialSpecId: rmsKojiRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMoromiId, processMaterialSlotSpecId: 'pmss-moromi-naka-water', recipeMaterialSpecId: rmsWaterId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });

    // RecipeProcessMaterialBinding — moromi tome
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMoromiId, processMaterialSlotSpecId: 'pmss-moromi-tome-rice', recipeMaterialSpecId: rmsMainRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMoromiId, processMaterialSlotSpecId: 'pmss-moromi-tome-koji', recipeMaterialSpecId: rmsKojiRiceId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
    ctx.db.RecipeProcessMaterialBinding.insert({ id: ctx.newUuidV4().toString(), recipeProcessUseId: rpuMoromiId, processMaterialSlotSpecId: 'pmss-moromi-tome-water', recipeMaterialSpecId: rmsWaterId, quantityOverride: undefined, quantityUnitOverride: undefined, notes: undefined });
  }
}
