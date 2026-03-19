import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { SESSION_SECRET } from '$env/static/private';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(SESSION_SECRET, 'base64').subarray(0, 32);

export interface SessionData {
	idToken: string;
	user: {
		sub: string;
		name: string;
		email: string;
		picture: string;
	};
}

export function encrypt(data: SessionData): string {
	const iv = randomBytes(12);
	const cipher = createCipheriv(ALGORITHM, KEY, iv);
	const json = JSON.stringify(data);
	const encrypted = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	// iv (12) + tag (16) + ciphertext
	return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

export function decrypt(cookie: string): SessionData | null {
	try {
		const buf = Buffer.from(cookie, 'base64url');
		const iv = buf.subarray(0, 12);
		const tag = buf.subarray(12, 28);
		const encrypted = buf.subarray(28);
		const decipher = createDecipheriv(ALGORITHM, KEY, iv);
		decipher.setAuthTag(tag);
		const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
		return JSON.parse(decrypted.toString('utf8'));
	} catch {
		return null;
	}
}
