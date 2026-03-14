export function validateRiceFracSum(
	allocations: { riceFrac: number }[],
	tolerance = 0.001
): boolean {
	const sum = allocations.reduce((acc, a) => acc + a.riceFrac, 0);
	return Math.abs(sum - 1) <= tolerance;
}
