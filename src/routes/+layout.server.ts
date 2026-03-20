import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => ({
	user: locals.user ?? null,
	idToken: locals.idToken ?? null
});
