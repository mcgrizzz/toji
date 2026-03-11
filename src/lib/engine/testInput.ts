import type { EngineInput } from "./engineTypes";

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
