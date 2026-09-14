import { describe, expect, it } from "vitest";
import { dedupeDrafts, mergeWithExisting } from "../collectors/dedupe";
import type { DraftRecord } from "../src/lib/schemas";

function draft(partial: Partial<DraftRecord>): DraftRecord {
  return {
    id: "d1",
    adapter: "fixture-reliefweb",
    sourceId: "src-fixture",
    canonicalUrl: "https://example.org/a",
    title: "Title",
    excerpt: "Excerpt",
    sourcePublishedAt: "2026-09-01T10:00:00.000Z",
    collectedAt: "2026-09-03T16:00:00.000Z",
    contentHash: "hash",
    editorialStatus: "draft",
    demo: false,
    ...partial,
  };
}

describe("collector deduplication", () => {
  it("drops duplicate canonical URLs", () => {
    const items = [
      draft({ id: "a" }),
      draft({ id: "b", title: "Changed title but same URL" }),
    ];
    const result = dedupeDrafts(items);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("a");
  });

  it("drops identical content hashes even with different ids", () => {
    const first = draft({ id: "a", canonicalUrl: "https://example.org/a" });
    const second = draft({
      id: "b",
      canonicalUrl: "https://example.org/b",
      title: "Title",
      excerpt: "Excerpt",
    });
    // Force the same hash as would be computed from title+excerpt+url... second has different URL so hash differs.
    const sameHash = dedupeDrafts([
      { ...first, contentHash: "same" },
      { ...second, contentHash: "same" },
    ]);
    expect(sameHash).toHaveLength(1);
  });

  it("merges incoming drafts into an existing queue without duplicating", () => {
    const existing = [draft({ id: "existing" })];
    const incoming = [draft({ id: "incoming" }), draft({ id: "fresh", canonicalUrl: "https://example.org/fresh", title: "Fresh" })];
    const merged = mergeWithExisting(existing, incoming);
    expect(merged.next).toHaveLength(2);
    expect(merged.added).toBe(1);
  });
});
