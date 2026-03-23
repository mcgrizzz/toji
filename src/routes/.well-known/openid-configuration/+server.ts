import { auth } from '$lib/server/auth';
import { ORIGIN } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const doc = await auth.api.getOpenIdConfig();
	// Override issuer to match jwt() plugin's iss claim (raw ORIGIN, not ORIGIN + basePath)
	doc.issuer = ORIGIN;
	return new Response(JSON.stringify(doc), {
		headers: {
			'content-type': 'application/json',
			'cache-control': 'public, max-age=3600'
		}
	});
};
