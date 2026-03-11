export const KOJI_MOISTURE_LOSS_FRAC = 0.06;

/** Tane-koji (spore inoculant) needed for a given mass of koji rice */
export function calcTaneKojiG(kojiRiceKg: number, kojiGPerKgRice: number): number {
	return kojiRiceKg * kojiGPerKgRice;
}

/** Carrier (e.g. toasted rice flour) to dilute tane-koji for even distribution */
export function calcCarrierG(taneKojiG: number, carrierRatioGPerG: number): number {
	return taneKojiG * carrierRatioGPerG;
}

/** Estimated dry koji mass after moisture loss during incubation */
export function estimateDryKojiKg(kojiRiceKg: number): number {
	return kojiRiceKg * (1 - KOJI_MOISTURE_LOSS_FRAC);
}
