import { betterAuth } from 'better-auth';
import { jwt } from 'better-auth/plugins';
import { oauthProvider } from '@better-auth/oauth-provider';
import Database from 'better-sqlite3';
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, ORIGIN, BETTER_AUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

export const auth = betterAuth({
	database: new Database('auth.db'),
	baseURL: ORIGIN,
	basePath: '/api/auth',
	secret: BETTER_AUTH_SECRET,
	trustedOrigins: ['http://localhost:5173', 'https://auth.toji.app'],
	advanced: {},
	socialProviders: {
		discord: {
			clientId: DISCORD_CLIENT_ID,
			clientSecret: DISCORD_CLIENT_SECRET
		},
		github: {
			clientId: GITHUB_CLIENT_ID,
			clientSecret: GITHUB_CLIENT_SECRET
		}
	},
	disabledPaths: [],
	plugins: [
		jwt({
			disableSettingJwtHeader: true,
			jwks: {
				keyPairConfig: {
					alg: 'ES256'
				}
			},
			jwt: {
				definePayload: ({ user }) => ({
					name: user.name,
					email: user.email,
					image: user.image,
				}),
			},
		}),
		oauthProvider({
			loginPage: '/',
			consentPage: '/consent'
		})
	]
});
