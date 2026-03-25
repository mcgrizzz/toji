import { t } from 'spacetimedb/server';
import spacetimedb from '../schema';
import { copyRecipeEntity } from '../lib/copyRecipe';
import {
  loadProcessEntity,
  loadProcessStages,
  loadProcessSteps,
  loadRecipeProcessUses,
  loadRecipeMaterialBindings,
} from '../lib/loaders';
import { tsToIso, addHours } from '../lib/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export const getMyBatches = spacetimedb.procedure(
  t.string(),
  (ctx) => ctx.withTx(tx => {
    const senderId = tx.sender.toHexString();
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
    const senderId = tx.sender.toHexString();
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
