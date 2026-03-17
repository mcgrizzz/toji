import { schema } from 'spacetimedb/server';

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
  User,
  Entity,
  Recipe,
  Process,
  WaterProfile,
  ProcessParamSpec,
  ProcessStageSpec,
  ProcessSubstageSpec,
  ProcessMaterialSlotSpec,
  ProcessStepSpec,
  ProcessStepFieldSpec,
  RecipeProcessUse,
  RecipeMaterialSpec,
  RecipeProcessMaterialBinding,
  WaterProfileIon,
  ScheduleTable,
  ScheduleEvent,
} from './recipe';

export { Batch } from './batch';

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
  User,
  Entity,
  Recipe,
  Process,
  WaterProfile,
  ProcessParamSpec,
  ProcessStageSpec,
  ProcessSubstageSpec,
  ProcessMaterialSlotSpec,
  ProcessStepSpec,
  ProcessStepFieldSpec,
  RecipeProcessUse,
  RecipeMaterialSpec,
  RecipeProcessMaterialBinding,
  WaterProfileIon,
  ScheduleTable,
  ScheduleEvent,
} from './recipe';

import { Batch } from './batch';

export default schema({
  User,
  Entity,
  Recipe,
  Process,
  WaterProfile,
  ProcessParamSpec,
  ProcessStageSpec,
  ProcessSubstageSpec,
  ProcessMaterialSlotSpec,
  ProcessStepSpec,
  ProcessStepFieldSpec,
  RecipeProcessUse,
  RecipeMaterialSpec,
  RecipeProcessMaterialBinding,
  WaterProfileIon,
  ScheduleTable,
  ScheduleEvent,
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
});
