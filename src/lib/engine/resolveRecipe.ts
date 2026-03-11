import type { AllocationResult, EngineInput, EngineOutput } from "./engineTypes";

//Engine is agnostic to conventions/traditions. It's a simple machine, we will enforce rules/scaling/conventions above the the engine, not within it. 
//notice, there is no concept of moto, moromi, etc in here. 
// somethings we need to enforce somewhere else:
/**
 * 1. riceFractions of allocations need to sum to 1. 
 * 2. global koji % or water rates need to be enforced if enabled
 * 3. Recipe scaling
 */

export function resolveRecipe(input: EngineInput): EngineOutput {

    const totalRiceKg = input.totalRiceKg;
    let totalKojiKg = 0.0;
    let totalKakeKg = 0.0;
    let totalRawRiceKg = 0.0;
    let totalWaterL = 0.0;

    const allocationResults: AllocationResult[] = [];

    input.allocations.forEach((allocation) => {
        const riceKg = allocation.riceFrac * totalRiceKg;
        const kojiKg = allocation.kojiFrac * riceKg;

        const rawFrac = allocation.rawRiceFrac ?? 0.0;
        const rawRiceKg = rawFrac * riceKg;

        const kakeKg = riceKg - kojiKg - rawRiceKg;
        const waterL = allocation.waterLPerKg * riceKg;

        totalKojiKg += kojiKg;
        totalKakeKg += kakeKg;
        totalRawRiceKg += rawRiceKg;
        totalWaterL += waterL;

        const allocationResult: AllocationResult = {
            riceKg,
            kojiKg,
            kakeKg,
            rawRiceKg,
            waterL,
        };
        
        if(allocation.extras){
            
            const outputExtras: { kind: string; massKg: number; }[] = [];

            allocation.extras.forEach((extra) => {
                outputExtras.push({
                    kind: extra.kind,
                    massKg: extra.fracOfRice * totalRiceKg,
                });
            });

            allocationResult.extras = outputExtras;

        }

        allocationResults.push(allocationResult);
    })

    return {
        allocations: allocationResults,
        totals: {
            totalRiceKg, 
            totalKojiKg,
            totalKakeKg,
            totalRawRiceKg,
            totalWaterL,
            kojiFrac: totalKojiKg / totalRiceKg,
            waterLPerKg: totalWaterL / totalRiceKg,
        }
    }

};