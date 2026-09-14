import type { Article } from "./schemas";

/** Plan minimum before SAMPLE may be turned off. Prefer 10; never fewer than 5. */
export const MIN_REAL_ARTICLES_BEFORE_DEMO_OFF = 5;

export type DemoGate = {
  realPublishedCount: number;
  rssEligibleCount: number;
  demoOffReady: boolean;
  reason: string;
};

export function evaluateDemoGate(articles: Article[]): DemoGate {
  const realPublished = articles.filter(
    (article) => article.editorialStatus === "published" && article.demo === false,
  );
  const ready = realPublished.length >= MIN_REAL_ARTICLES_BEFORE_DEMO_OFF;
  return {
    realPublishedCount: realPublished.length,
    rssEligibleCount: realPublished.length,
    demoOffReady: ready,
    reason: ready
      ? `At least ${MIN_REAL_ARTICLES_BEFORE_DEMO_OFF} approved non-demo articles exist.`
      : `Need at least ${MIN_REAL_ARTICLES_BEFORE_DEMO_OFF} approved non-demo articles before turning SAMPLE off (have ${realPublished.length}).`,
  };
}
