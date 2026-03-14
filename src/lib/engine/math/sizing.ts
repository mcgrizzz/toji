export const GENSHU_L_PER_KG_RICE = 1.35;

export function estimateTotalRiceFromGenshuVolume(targetL: number, lPerKg = GENSHU_L_PER_KG_RICE): number {
	return targetL / lPerKg;
}

export function estimateGenshuFromRice(totalRiceKg: number, lPerKg = GENSHU_L_PER_KG_RICE): number {
	return totalRiceKg * lPerKg;
}
