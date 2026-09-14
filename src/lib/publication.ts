import type { Article, DailyBriefing, IndicatorObservation, WeeklyOutlook } from "./schemas";

export function isPublished<T extends { editorialStatus: string }>(record: T): boolean {
  return record.editorialStatus === "published";
}

export function isVisibleOnSite<T extends { editorialStatus: string; demo: boolean }>(
  record: T,
  showDemoContent: boolean,
): boolean {
  if (!isPublished(record)) return false;
  if (record.demo && !showDemoContent) return false;
  return true;
}

export function isRssEligible(article: Article, _showDemoContent = false): boolean {
  return isPublished(article) && article.demo === false;
}

export function searchText(article: Article): string {
  return [article.title, article.summary, article.locations.join(" "), article.region].join(" ").toLowerCase();
}

export function articleMatches(article: Article, filters: { region?: string; sector?: string; category?: string; query?: string }): boolean {
  if (filters.region && filters.region !== "all" && article.region !== filters.region) return false;
  if (filters.sector && filters.sector !== "all" && !article.sectors.includes(filters.sector as Article["sectors"][number])) {
    return false;
  }
  if (
    filters.category &&
    filters.category !== "all" &&
    !article.categories.includes(filters.category as Article["categories"][number])
  ) {
    return false;
  }
  if (filters.query) {
    const needle = filters.query.trim().toLowerCase();
    if (needle && !searchText(article).includes(needle)) return false;
  }
  return true;
}

export function publishedArticles(articles: Article[], showDemo: boolean): Article[] {
  return articles.filter((article) => isVisibleOnSite(article, showDemo)).sort(byUpdatedDesc);
}

export function rssArticles(articles: Article[]): Article[] {
  return articles.filter((article) => isRssEligible(article)).sort(byUpdatedDesc);
}

export function publishedObservations(items: IndicatorObservation[], showDemo: boolean): IndicatorObservation[] {
  return items.filter((item) => isVisibleOnSite(item, showDemo));
}

export function publishedBriefings(items: DailyBriefing[], showDemo: boolean): DailyBriefing[] {
  return items.filter((item) => isVisibleOnSite(item, showDemo)).sort((a, b) => b.date.localeCompare(a.date));
}

export function publishedOutlooks(items: WeeklyOutlook[], showDemo: boolean): WeeklyOutlook[] {
  return items.filter((item) => isVisibleOnSite(item, showDemo)).sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}

function byUpdatedDesc(a: Article, b: Article): number {
  return b.updatedAt.localeCompare(a.updatedAt);
}
