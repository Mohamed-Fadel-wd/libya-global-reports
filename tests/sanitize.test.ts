import { describe, expect, it } from "vitest";
import { escapeHtml, sanitizeHttpUrl, stripHtml, safeText } from "../src/lib/sanitize";
import { parseRssItems } from "../collectors/rss";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fixtureAdapter } from "../collectors/adapters/fixture";
import type { Source } from "../src/lib/schemas";

describe("untrusted content", () => {
  it("strips script tags and encodes HTML for display", () => {
    const dirty = `<p>Ok</p><script>alert(1)</script><img src=x onerror=alert(1)>`;
    expect(stripHtml(dirty)).not.toMatch(/script/i);
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
    expect(safeText(`<a href="javascript:alert(1)">click</a>`)).not.toContain("<a");
  });

  it("rejects non-http URL protocols", () => {
    expect(sanitizeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeHttpUrl("data:text/html,hi")).toBeNull();
    expect(sanitizeHttpUrl("https://example.org/safe")).toBe("https://example.org/safe");
  });

  it("drops unsafe RSS links from the fixture adapter", async () => {
    const xml = readFileSync(
      path.join(process.cwd(), "editorial/fixtures/reliefweb-libya.rss.xml"),
      "utf8",
    );
    const parsed = parseRssItems(xml);
    expect(parsed.some((item) => item.link.startsWith("javascript:"))).toBe(true);

    const source: Source = {
      id: "src-fixture",
      name: "Fixture",
      url: "https://example.org/lgr-fixture",
      language: "en",
      sourceType: "other",
      geographicCoverage: ["fixture"],
      collectionMethod: "rss",
      reviewStatus: "reviewed",
      reuseNotes: "test",
      enabled: true,
      adapter: "fixture-reliefweb",
      localeReady: ["en"],
    };
    const result = await fixtureAdapter.collect({
      source,
      options: { userAgent: "test", timeoutMs: 1000, maxRetries: 1, minIntervalMs: 0 },
      rootDir: process.cwd(),
      now: new Date("2026-09-03T16:00:00Z"),
    });
    expect(result.drafts.every((draft) => draft.canonicalUrl.startsWith("https://"))).toBe(true);
    expect(result.drafts.some((draft) => draft.excerpt.includes("<script>"))).toBe(false);
    expect(result.drafts).toHaveLength(2);
  });
});
