import type { EngineInput } from "../core/engineTypes";

//This a converted recipe from NRIB from the Acidhouse spreadsheet
export const recipeInput: EngineInput = {
  totalRiceKg: 100,
  allocations: [
    //Moto
    { riceFrac: 0.0707, kojiFrac: 0.3077, waterLPerKg: 1.077 },
    //Soe
    { riceFrac: 0.1522, kojiFrac: 0.2857, waterLPerKg: 0.9286 },
    //naka
    { riceFrac: 0.2989, kojiFrac: 0.2182, waterLPerKg: 1.2 },
    //tome
    { riceFrac: 0.4783, kojiFrac: 0.1818, waterLPerKg: 1.431 },

    //random addition
    {
      riceFrac: 0.0,
      kojiFrac: 0.0,
      waterLPerKg: 0.0,
      extras: [{ kind: "plum", fracOfRice: 0.05 }]
    }
  ]
};

// Clean 4-stage sandan (moto+soe+naka+tome), no extras, fracs sum to 1.0
export const sandanStandardInput: EngineInput = {
  totalRiceKg: 5.5,
  allocations: [
    { riceFrac: 0.07, kojiFrac: 0.30, waterLPerKg: 1.07 },   // moto
    { riceFrac: 0.15, kojiFrac: 0.28, waterLPerKg: 0.92 },   // soe
    { riceFrac: 0.30, kojiFrac: 0.21, waterLPerKg: 1.20 },   // naka
    { riceFrac: 0.48, kojiFrac: 0.21, waterLPerKg: 1.20 },   // tome
  ]
};

// All allocations have kojiFrac: 0 (koji is pre-purchased)
export const premadeKojiInput: EngineInput = {
  totalRiceKg: 5.5,
  allocations: [
    { riceFrac: 0.07, kojiFrac: 0.0, waterLPerKg: 1.07 },    // moto
    { riceFrac: 0.15, kojiFrac: 0.0, waterLPerKg: 0.92 },    // soe
    { riceFrac: 0.30, kojiFrac: 0.0, waterLPerKg: 1.20 },    // naka
    { riceFrac: 0.48, kojiFrac: 0.0, waterLPerKg: 1.20 },    // tome
  ]
};

// Moto allocation has a lactic acid boost amendment
export const motoAmendmentInput: EngineInput = {
  totalRiceKg: 5.5,
  allocations: [
    {
      riceFrac: 0.07, kojiFrac: 0.30, waterLPerKg: 1.07,
      extras: [{ kind: 'lactic_acid_boost', fracOfRice: 0.001 }]
    },
    { riceFrac: 0.15, kojiFrac: 0.28, waterLPerKg: 0.92 },
    { riceFrac: 0.30, kojiFrac: 0.21, waterLPerKg: 1.20 },
    { riceFrac: 0.48, kojiFrac: 0.21, waterLPerKg: 1.20 },
  ]
};

// Soe allocation has sakura petals amendment
export const moromiAmendmentInput: EngineInput = {
  totalRiceKg: 5.5,
  allocations: [
    { riceFrac: 0.07, kojiFrac: 0.30, waterLPerKg: 1.07 },
    {
      riceFrac: 0.15, kojiFrac: 0.28, waterLPerKg: 0.92,
      extras: [{ kind: 'Sakura Petals', fracOfRice: 0.0005 }]
    },
    { riceFrac: 0.30, kojiFrac: 0.21, waterLPerKg: 1.20 },
    { riceFrac: 0.48, kojiFrac: 0.21, waterLPerKg: 1.20 },
  ]
};

// Rice fracs sum to 0.85 — tests validateRiceFracSum error path
export const invalidRiceFracInput: EngineInput = {
  totalRiceKg: 5.5,
  allocations: [
    { riceFrac: 0.07, kojiFrac: 0.30, waterLPerKg: 1.07 },
    { riceFrac: 0.15, kojiFrac: 0.28, waterLPerKg: 0.92 },
    { riceFrac: 0.30, kojiFrac: 0.21, waterLPerKg: 1.20 },
    { riceFrac: 0.33, kojiFrac: 0.21, waterLPerKg: 1.20 },   // 0.85 total
  ]
};

// Standalone zero-rice allocation with extras only
export const zeroRiceExtraInput: EngineInput = {
  totalRiceKg: 5.5,
  allocations: [
    { riceFrac: 0.07, kojiFrac: 0.30, waterLPerKg: 1.07 },
    { riceFrac: 0.15, kojiFrac: 0.28, waterLPerKg: 0.92 },
    { riceFrac: 0.30, kojiFrac: 0.21, waterLPerKg: 1.20 },
    { riceFrac: 0.48, kojiFrac: 0.21, waterLPerKg: 1.20 },
    {
      riceFrac: 0.0, kojiFrac: 0.0, waterLPerKg: 0.0,
      extras: [{ kind: 'plum', fracOfRice: 0.05 }]
    }
  ]
};
