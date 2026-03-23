import { auth } from '$lib/server/auth';
import { building } from '$app/environment';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.user = session.user;
		event.locals.session = session.session;
	}

	if (building) return resolve(event);

	if (event.url.pathname.startsWith('/api/auth/')) {
		return auth.handler(event.request);
	}

	return resolve(event);
};
