import { table, t } from 'spacetimedb/server';

// ── User ──────────────────────────────────────────────────────────────────────

export const User = table(
  {
    name: 'user',
    public: true,
  },
  {
    id: t.string().primaryKey(),
    displayName: t.string(),
    email: t.string().optional(),
    avatarUrl: t.string().optional(),
    createdAt: t.timestamp(),
    updatedAt: t.timestamp(),
  }
);

/**
 * Maps a SpacetimeDB Identity (derived from issuer + subject) back to a User.
 * Each auth provider login produces a unique Identity; this table unifies them.
 */
export const AuthIdentity = table(
  {
    name: 'auth_identity',
    public: true,
    indexes: [
      { accessor: 'byUserId', algorithm: 'btree' as const, columns: ['userId'] },
    ],
  },
  {
    identityHex: t.string().primaryKey(),
    userId: t.string(),
    issuer: t.string(),
    subject: t.string(),
    createdAt: t.timestamp(),
  }
);
