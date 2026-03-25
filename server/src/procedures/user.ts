import { t } from 'spacetimedb/server';
import { SenderError } from 'spacetimedb';
import spacetimedb from '../schema';
import { resolveUserId } from '../lib/utils';
import { seedDemoData as seedDemoDataFn } from '../seed/seedData';

const ALLOWED_ISSUERS = new Set([
  'https://auth.spacetimedb.com',
  'localhost', // SpacetimeDB-issued JWT for anonymous/tokenless connections
  'https://auth.toji.app', // Better Auth (ORIGIN)
]);

export const onConnect = spacetimedb.clientConnected(ctx => {
  if (ctx.senderAuth.isInternal) return;
  const jwt = ctx.senderAuth.jwt;
  if (jwt == null) {
    throw new SenderError('Unauthorized: JWT is required to connect');
  }
  if (!ALLOWED_ISSUERS.has(jwt.issuer)) {
    throw new SenderError(`Unauthorized: issuer '${jwt.issuer}' is not allowed`);
  }

  // Only create User + AuthIdentity for Better Auth JWTs
  if (jwt.issuer === 'https://auth.spacetimedb.com' || jwt.issuer === 'localhost') return;

  const identityHex = ctx.sender.toHexString();
  const now = ctx.timestamp;

  // Already seen this exact identity → done
  const existing = ctx.db.AuthIdentity.identityHex.find(identityHex);
  if (existing) return;

  // Extract profile from JWT claims
  const email = typeof jwt.fullPayload.email === 'string' ? jwt.fullPayload.email : undefined;
  const name = typeof jwt.fullPayload.name === 'string' ? jwt.fullPayload.name : 'Brewer';
  const avatarUrl = typeof jwt.fullPayload.image === 'string' ? jwt.fullPayload.image : undefined;

  // 1. Cross-provider dedup: same email → same user
  let userId: string | undefined;
  if (email) {
    for (const u of ctx.db.User.iter()) {
      if (u.email === email) {
        userId = u.id;
        break;
      }
    }
  }

  // 2. Same-provider fallback: same subject+issuer → same user
  if (!userId) {
    for (const ai of ctx.db.AuthIdentity.iter()) {
      if (ai.subject === jwt.subject && ai.issuer === jwt.issuer) {
        userId = ai.userId;
        break;
      }
    }
  }

  // 3. Brand new user
  if (!userId) {
    userId = ctx.newUuidV4().toString();
    ctx.db.User.insert({
      id: userId,
      displayName: name,
      email,
      avatarUrl,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Link this identity to the user
  ctx.db.AuthIdentity.insert({
    identityHex,
    userId,
    issuer: jwt.issuer,
    subject: jwt.subject,
    createdAt: now,
  });
});

export const onDisconnect = spacetimedb.clientDisconnected(_ctx => {});

export const syncProfile = spacetimedb.reducer(
  { displayName: t.string(), email: t.option(t.string()), avatarUrl: t.option(t.string()) },
  (ctx, { displayName, email, avatarUrl }) => {
    const userId = resolveUserId(ctx);
    if (!userId) return;
    const user = ctx.db.User.id.find(userId);
    if (!user) return;
    ctx.db.User.id.delete(userId);
    ctx.db.User.insert({
      ...user,
      displayName,
      email,
      avatarUrl,
      updatedAt: ctx.timestamp,
    });
  }
);

export const seedDemoData = spacetimedb.reducer(
  (ctx) => { seedDemoDataFn(ctx); }
);
