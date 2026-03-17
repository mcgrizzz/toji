import { table, t } from 'spacetimedb/server';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const YeastFormat = t.enum('YeastFormat', ['liquid_pouch', 'dry', 'slant']);

// ── Catalog tables (shared, no ownerId, public) ───────────────────────────────

export const CatalogRiceVariety = table(
  { name: 'catalog_rice_variety', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    region: t.option(t.string()),
    description: t.option(t.string()),
  }
);

export const CatalogYeastProduct = table(
  { name: 'catalog_yeast_product', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    format: t.option(YeastFormat),
    supplier: t.option(t.string()),
    description: t.option(t.string()),
  }
);

export const CatalogKojiSporeProduct = table(
  { name: 'catalog_koji_spore_product', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    supplier: t.option(t.string()),
    description: t.option(t.string()),
  }
);

export const AcidType = table(
  { name: 'acid_type', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    strengthPct: t.f64(),
    relativeAcidity: t.f64(),
  }
);

export const MineralSalt = table(
  { name: 'mineral_salt', public: true },
  {
    id: t.string().primaryKey(),
    name: t.string(),
    primaryIon: t.string(),
  }
);

export const MineralSaltIon = table(
  {
    name: 'mineral_salt_ion',
    public: true,
    indexes: [
      { accessor: 'bySaltId', algorithm: 'btree' as const, columns: ['saltId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    saltId: t.string(),
    ionSymbol: t.string(),
    massGPerGSalt: t.f64(),
  }
);

// ── Inventory tables (owned, with ownerId) ────────────────────────────────────

/** Exactly one of catalogRiceVarietyId or customVarietyName expected. */
export const InventoryRiceLot = table(
  {
    name: 'inventory_rice_lot',
    public: true,
    indexes: [
      { accessor: 'byOwnerId', algorithm: 'btree' as const, columns: ['ownerId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    ownerId: t.string(),
    catalogRiceVarietyId: t.option(t.string()),
    customVarietyName: t.option(t.string()),
    polishPct: t.f64(),
    lotLabel: t.option(t.string()),
    massKgAvailable: t.option(t.f64()),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

export const InventoryYeastStock = table(
  {
    name: 'inventory_yeast_stock',
    public: true,
    indexes: [
      { accessor: 'byOwnerId', algorithm: 'btree' as const, columns: ['ownerId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    ownerId: t.string(),
    catalogYeastProductId: t.option(t.string()),
    customName: t.option(t.string()),
    format: t.option(YeastFormat),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

export const InventoryKojiSporeLot = table(
  {
    name: 'inventory_koji_spore_lot',
    public: true,
    indexes: [
      { accessor: 'byOwnerId', algorithm: 'btree' as const, columns: ['ownerId'] },
    ],
  },
  {
    id: t.string().primaryKey(),
    ownerId: t.string(),
    catalogKojiSporeProductId: t.option(t.string()),
    customName: t.option(t.string()),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);
