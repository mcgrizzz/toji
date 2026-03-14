export type Amendment = {
    kind: string; //"plums", "sugar", "wine" etc..
    fracOfRice: number; //Fraction of total rice mass. This allows amendments in additions without any rice or koji. 
};

export type Allocation = {
    riceFrac: number;
    kojiFrac: number;
    waterLPerKg: number;
    rawRiceFrac?: number;
    extras?: Amendment[];
};

export type AllocationResult = {
    riceKg: number;
    kojiKg: number;
    kakeKg: number;
    rawRiceKg: number;
    waterL: number;

    extras?: {
        kind: string;
        massKg: number;
    }[];
}

export type EngineInput = {
    totalRiceKg: number;
    allocations: Allocation[];
};

export type EngineOutput = {
    allocations: AllocationResult[];

    totals: {
        totalRiceKg: number;
        totalKojiKg: number;
        totalKakeKg: number;
        totalRawRiceKg: number;
        totalWaterL: number;

        kojiFrac: number; // totalKojiKg / totalRiceKg
        waterLPerKg: number; // totalWaterL / totalRiceKg
    };
};