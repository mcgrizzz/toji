import { decrypt } from '$lib/server/session';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionCookie = event.cookies.get('session');
	if (sessionCookie) {
		const session = decrypt(sessionCookie);
		if (session) {
			event.locals.user = session.user;
			event.locals.idToken = session.idToken;
		}
	}
	return resolve(event);
};
