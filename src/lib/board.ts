import type { Article, DailyBriefing, IndicatorObservation, Settings, Source, WeeklyOutlook } from "./schemas";
import { publishedArticles, publishedBriefings, publishedObservations, publishedOutlooks, rssArticles } from "./publication";
import { sanitizeContactHref } from "./sanitize";

export type BoardData = {
  settings: Settings;
  sources: Source[];
  articles: Article[];
  allArticles: Article[];
  briefings: DailyBriefing[];
  outlooks: WeeklyOutlook[];
  observations: IndicatorObservation[];
  rssItems: Article[];
  contactHref: string | null;
  demoActive: boolean;
};

export function applyEnvSettings(settings: Settings): Settings {
  let next = { ...settings };
  if (typeof process !== "undefined" && process.env.LGR_SHOW_DEMO === "false") {
    next = { ...next, showDemoContent: false };
  }
  if (typeof process !== "undefined" && process.env.LGR_SITE_URL) {
    next = { ...next, siteUrl: process.env.LGR_SITE_URL };
  }
  if (typeof process !== "undefined" && process.env.LGR_CONTACT_HREF !== undefined) {
    next = { ...next, contactHref: process.env.LGR_CONTACT_HREF };
  }
  return next;
}

export function buildBoard(input: {
  settings: Settings;
  sources: Source[];
  articles: Article[];
  briefings: DailyBriefing[];
  outlooks: WeeklyOutlook[];
  observations: IndicatorObservation[];
}): BoardData {
  const settings = applyEnvSettings(input.settings);
  const sourceIds = new Set(input.sources.map((source) => source.id));
  const seenSource = new Set<string>();
  for (const source of input.sources) {
    if (seenSource.has(source.id)) throw new Error(`Duplicate source id: ${source.id}`);
    seenSource.add(source.id);
  }
  const seenArticleIds = new Set<string>();
  const seenSlugs = new Set<string>();
  for (const article of input.articles) {
    if (seenArticleIds.has(article.id)) throw new Error(`Duplicate article id: ${article.id}`);
    if (seenSlugs.has(article.slug)) throw new Error(`Duplicate article slug: ${article.slug}`);
    seenArticleIds.add(article.id);
    seenSlugs.add(article.slug);
    for (const sourceId of article.sourceIds) {
      if (!sourceIds.has(sourceId)) throw new Error(`Article ${article.id} references unknown source ${sourceId}`);
    }
  }
  for (const observation of input.observations) {
    if (!sourceIds.has(observation.sourceId)) {
      throw new Error(`Observation ${observation.id} references unknown source ${observation.sourceId}`);
    }
  }
  const articles = publishedArticles(input.articles, settings.showDemoContent);
  const briefings = publishedBriefings(input.briefings, settings.showDemoContent).map((briefing) => ({
    ...briefing,
    essentialArticleIds: briefing.essentialArticleIds.filter((articleId) => {
      const exists = input.articles.some((article) => article.id === articleId);
      if (!exists) throw new Error(`Briefing ${briefing.id} points at missing article ${articleId}`);
      return articles.some((article) => article.id === articleId);
    }),
  }));
  return {
    settings,
    sources: input.sources,
    articles,
    allArticles: input.articles,
    briefings,
    outlooks: publishedOutlooks(input.outlooks, settings.showDemoContent),
    observations: publishedObservations(input.observations, settings.showDemoContent),
    rssItems: rssArticles(input.articles),
    contactHref: sanitizeContactHref(process.env.LGR_CONTACT_HREF || settings.contactHref),
    demoActive:
      settings.showDemoContent &&
      (articles.some((item) => item.demo) || input.observations.some((item) => item.demo && item.editorialStatus === "published")),
  };
}
