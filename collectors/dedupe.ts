import { contentHash } from "./http.ts";
import type { DraftRecord } from "../src/lib/schemas.ts";

export function draftIdentity(item: { canonicalUrl: string; title: string; excerpt: string }): { canonicalUrl: string; contentHash: string } {
  const canonicalUrl = new URL(item.canonicalUrl).toString();
  return {
    canonicalUrl,
    contentHash: contentHash([item.title.trim(), item.excerpt.trim()]),
  };
}

export function dedupeDrafts(records: DraftRecord[]): DraftRecord[] {
  const byUrl = new Map<string, DraftRecord>();
  const hashes = new Set<string>();
  for (const record of records) {
    const identity = draftIdentity(record);
    if (byUrl.has(identity.canonicalUrl) || hashes.has(identity.contentHash)) continue;
    byUrl.set(identity.canonicalUrl, { ...record, ...identity });
    hashes.add(identity.contentHash);
  }
  return [...byUrl.values()];
}

export function mergeWithExisting(existing: DraftRecord[], incoming: DraftRecord[]): { next: DraftRecord[]; added: number; skipped: number } {
  const combined = dedupeDrafts([...existing, ...incoming]);
  return {
    next: combined,
    added: combined.length - existing.length,
    skipped: incoming.length - (combined.length - existing.length),
  };
}
