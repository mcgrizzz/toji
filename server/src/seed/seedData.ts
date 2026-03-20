/* eslint-disable @typescript-eslint/no-explicit-any */

import { seedCatalog } from './seedCatalog';
import { seedLibrary } from './seedLibrary';
import { seedInventory } from './seedInventory';

export function seedDemoData(ctx: any): void {
  const catalogIds = seedCatalog(ctx);
  seedLibrary(ctx);
  seedInventory(ctx, catalogIds);
}
