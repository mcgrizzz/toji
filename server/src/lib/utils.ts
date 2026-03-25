import { Timestamp } from 'spacetimedb';

/* eslint-disable @typescript-eslint/no-explicit-any */

export function tsToIso(ts: { toISOString(): string }): string {
  return ts.toISOString();
}

/** Resolve the User.id for the current sender. Returns null for system/admin connections. */
export function resolveUserId(ctx: any): string | null {
  const identityHex = ctx.sender.toHexString();
  const link = ctx.db.AuthIdentity.identityHex.find(identityHex);
  return link?.userId ?? null;
}

export function isSystemOwner(ownerId: string): boolean {
  return ownerId === '__system__';
}

export function addHours(ts: Timestamp, hours: number): Timestamp {
  const microsToAdd = BigInt(Math.round(hours * 3_600_000_000));
  return new Timestamp(ts.microsSinceUnixEpoch + microsToAdd);
}
