
import type { Allocation, Amendment } from "./engineTypes";
export type AllocationSpec = Allocation;
export type AmendmentSpec = Amendment;

export type RecipeSpec = {
    name: string;
    description?: string;

    koji?: KojiBlockSpec;
    moto?: MotoBlockSpec;
    additions?: AdditionsBlockSpec;

    extras?: ExtrasBlockSpec;
};

export type KojiBlockSpec {
    amendments?: AmendmentSpec[]; //This will include koji
    plan?: PlanSpec;
}

export type MotoBlockSpec {
    allocations: AllocationSpec[];
    
    requiresAcid?: boolean;
    plan?: PipelineDestinationPromiseFunction;
}