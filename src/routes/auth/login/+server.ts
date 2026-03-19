import { redirect } from '@sveltejs/kit';
import { generateState } from 'arctic';
import { discord } from '$lib/server/discord';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const state = generateState();

	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: false, // localhost
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax'
	});

	const url = discord.createAuthorizationURL(state, null, ['openid', 'identify', 'email']);

	redirect(302, url.toString());
};
