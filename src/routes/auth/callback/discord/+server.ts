import { redirect } from '@sveltejs/kit';
import { decodeIdToken } from 'arctic';
import { discord } from '$lib/server/discord';
import { encrypt } from '$lib/server/session';
import type { RequestHandler } from './$types';

type DiscordMeResponse = {
	id: string;
	username: string;
	global_name?: string | null;
	email?: string | null;
	avatar?: string | null;
	discriminator?: string;
};

function discordAvatarUrl(user: Pick<DiscordMeResponse, 'id' | 'avatar'>): string {
	if (!user.avatar) return '';
	return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}

async function fetchDiscordMe(accessToken: string): Promise<DiscordMeResponse> {
	const res = await fetch('https://discord.com/api/users/@me', {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!res.ok) {
		const body = await res.text();
		throw new Error(`Failed to fetch Discord profile: ${res.status} ${body}`);
	}

	return (await res.json()) as DiscordMeResponse;
}

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state');

	if (!code || !state || !storedState || state !== storedState) {
		throw redirect(302, '/auth/login');
	}

	cookies.delete('oauth_state', { path: '/' });

	const tokens = await discord.validateAuthorizationCode(code, null);
	const idToken = tokens.idToken();
	const accessToken = tokens.accessToken();
	const me = await fetchDiscordMe(accessToken);

	const sessionCookie = encrypt({
		idToken,
		user: {
			sub: me.id,
			name: me.global_name ?? me.username ?? 'Unknown',
			email: me.email ?? '',
			picture: discordAvatarUrl(me) || ''
		}
	});

	cookies.set('session', sessionCookie, {
		path: '/',
		httpOnly: true,
		secure: false, // localhost
		maxAge: 60 * 60 * 24 * 7,
		sameSite: 'lax'
	});

	throw redirect(302, '/');
};