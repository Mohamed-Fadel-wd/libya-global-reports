import { describe, expect, it } from "vitest";
import { evaluateDemoGate, MIN_REAL_ARTICLES_BEFORE_DEMO_OFF } from "../src/lib/demo-gate";
import type { Article } from "../src/lib/schemas";

function article(partial: Partial<Article>): Article {
  return {
    id: "art-1",
    slug: "test-article",
    title: "Title",
    summary: "Summary",
    whatHappened: "What",
    whyItMatters: "Why",
    watchNext: "Next",
    region: "west",
    locations: ["Tripoli"],
    categories: ["politics"],
    sectors: ["other"],
    eventTime: "2026-09-03T12:00:00+02:00",
    sourcePublishedAt: "2026-09-03T12:00:00+02:00",
    publishedAt: "2026-09-03T12:00:00+02:00",
    updatedAt: "2026-09-03T12:00:00+02:00",
    sourceIds: ["src-a"],
    sourceUrls: ["https://example.org/doc"],
    verificationStatus: "reported",
    confidence: "medium",
    confidenceRationale: "Test",
    editorialStatus: "published",
    demo: true,
    severity: "low",
    direction: "unchanged",
    disputedClaims: [],
    corrections: [],
    locale: "en",
    ...partial,
  };
}

describe("demo-off gate", () => {
  it("blocks SAMPLE off until the minimum real articles exist", () => {
    const samples = [article({ id: "d1", slug: "d1", demo: true })];
    const gate = evaluateDemoGate(samples);
    expect(gate.demoOffReady).toBe(false);
    expect(gate.realPublishedCount).toBe(0);
    expect(MIN_REAL_ARTICLES_BEFORE_DEMO_OFF).toBe(5);
  });

  it("is ready once five approved non-demo articles exist", () => {
    const real = Array.from({ length: 5 }, (_, index) =>
      article({
        id: `r${index}`,
        slug: `real-${index}`,
        demo: false,
        editorialStatus: "published",
      }),
    );
    expect(evaluateDemoGate(real).demoOffReady).toBe(true);
  });
});
