import { Discord } from 'arctic';
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, ORIGIN } from '$env/static/private';

export const discord = new Discord(
	DISCORD_CLIENT_ID,
	DISCORD_CLIENT_SECRET,
	`${ORIGIN}/auth/callback/discord`
);
