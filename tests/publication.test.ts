import { describe, expect, it } from "vitest";
import { buildBoard } from "../src/lib/board";
import { isRssEligible, isVisibleOnSite, rssArticles } from "../src/lib/publication";
import type { Article, DailyBriefing, IndicatorObservation, Settings, Source, WeeklyOutlook } from "../src/lib/schemas";

const settings: Settings = {
  siteName: "Libya Global Reports",
  tagline: "Daily context for decisions in Libya.",
  timezone: "Africa/Tripoli",
  showDemoContent: true,
  contactHref: "",
  siteUrl: "http://localhost:4321",
  lastReviewedAt: "2026-09-03T16:00:00+02:00",
  fxAlignmentHours: 48,
};

const sources: Source[] = [
  {
    id: "src-a",
    name: "Test",
    url: "https://example.org",
    language: "en",
    sourceType: "other",
    geographicCoverage: ["Libya"],
    collectionMethod: "manual",
    reviewStatus: "reviewed",
    reuseNotes: "test",
    enabled: false,
    localeReady: ["en"],
  },
];

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
    demo: false,
    severity: "low",
    direction: "unchanged",
    disputedClaims: [],
    corrections: [],
    locale: "en",
    ...partial,
  };
}

const emptyBriefings: DailyBriefing[] = [];
const emptyOutlooks: WeeklyOutlook[] = [];
const emptyObs: IndicatorObservation[] = [];

describe("publication filters", () => {
  it("keeps draft articles out of production site output", () => {
    const draft = article({ id: "draft", slug: "draft", editorialStatus: "draft", demo: false });
    const live = article({ id: "live", slug: "live", editorialStatus: "published", demo: false });
    const board = buildBoard({
      settings,
      sources,
      articles: [draft, live],
      briefings: emptyBriefings,
      outlooks: emptyOutlooks,
      observations: emptyObs,
    });
    expect(board.articles.map((item) => item.id)).toEqual(["live"]);
    expect(isVisibleOnSite(draft, true)).toBe(false);
  });

  it("keeps demo articles out of the public RSS feed even when they are published", () => {
    const previous = process.env.LGR_SHOW_DEMO;
    delete process.env.LGR_SHOW_DEMO;
    try {
      const demo = article({ id: "demo", slug: "demo", demo: true, editorialStatus: "published" });
      const approved = article({ id: "real", slug: "real", demo: false, editorialStatus: "published" });
      expect(isRssEligible(demo)).toBe(false);
      expect(rssArticles([demo, approved]).map((item) => item.id)).toEqual(["real"]);
      const board = buildBoard({
        settings,
        sources,
        articles: [demo, approved],
        briefings: emptyBriefings,
        outlooks: emptyOutlooks,
        observations: emptyObs,
      });
      expect(board.rssItems.map((item) => item.id)).toEqual(["real"]);
      expect(board.articles.map((item) => item.id).sort()).toEqual(["demo", "real"]);
    } finally {
      if (previous === undefined) delete process.env.LGR_SHOW_DEMO;
      else process.env.LGR_SHOW_DEMO = previous;
    }
  });
});
