import { schema } from 'spacetimedb/server';

export {
  User,
  AuthIdentity,
} from './user';

export {
  CatalogRiceVariety,
  CatalogYeastProduct,
  CatalogKojiSporeProduct,
  AcidType,
  MineralSalt,
  MineralSaltIon,
  InventoryRiceLot,
  InventoryYeastStock,
  InventoryKojiSporeLot,
} from './catalog';

export {
  Asset,
  Recipe,
  Process,
  WaterProfile,
  ProcessParameter,
  ProcessStage,
  ProcessMaterialSlot,
  ProcessStep,
  ProcessMetric,
  StageMetric,
  StepPrompt,
  StepTransition,
  RecipeProcess,
  RecipeMaterial,
  RecipeMaterialBinding,
  WaterProfileIonTarget,
  ProcessTask,
} from './recipe';

export {
  Batch,
  BatchProcess,
  BatchStage,
  BatchStep,
  BatchMaterial,
  BatchTask,
  BatchObservation,
  BatchContextValue,
} from './batch';

import {
  User,
  AuthIdentity,
} from './user';

import {
  CatalogRiceVariety,
  CatalogYeastProduct,
  CatalogKojiSporeProduct,
  AcidType,
  MineralSalt,
  MineralSaltIon,
  InventoryRiceLot,
  InventoryYeastStock,
  InventoryKojiSporeLot,
} from './catalog';

import {
  Asset,
  Recipe,
  Process,
  WaterProfile,
  ProcessParameter,
  ProcessStage,
  ProcessMaterialSlot,
  ProcessStep,
  ProcessMetric,
  StageMetric,
  StepPrompt,
  StepTransition,
  RecipeProcess,
  RecipeMaterial,
  RecipeMaterialBinding,
  WaterProfileIonTarget,
  ProcessTask,
} from './recipe';

import {
  Batch,
  BatchProcess,
  BatchStage,
  BatchStep,
  BatchMaterial,
  BatchTask,
  BatchObservation,
  BatchContextValue,
} from './batch';

export default schema({
  User,
  AuthIdentity,
  Asset,
  Recipe,
  Process,
  WaterProfile,
  ProcessParameter,
  ProcessStage,
  ProcessMaterialSlot,
  ProcessStep,
  ProcessMetric,
  StageMetric,
  StepPrompt,
  StepTransition,
  RecipeProcess,
  RecipeMaterial,
  RecipeMaterialBinding,
  WaterProfileIonTarget,
  ProcessTask,
  CatalogRiceVariety,
  CatalogYeastProduct,
  CatalogKojiSporeProduct,
  AcidType,
  MineralSalt,
  MineralSaltIon,
  InventoryRiceLot,
  InventoryYeastStock,
  InventoryKojiSporeLot,
  Batch,
  BatchProcess,
  BatchStage,
  BatchStep,
  BatchMaterial,
  BatchTask,
  BatchObservation,
  BatchContextValue,
});
