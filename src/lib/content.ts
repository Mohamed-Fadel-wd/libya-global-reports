import {
  ArticleSchema,
  DailyBriefingSchema,
  IndicatorObservationSchema,
  SettingsSchema,
  SourceSchema,
  WeeklyOutlookSchema,
} from "./schemas";
import { buildBoard, type BoardData } from "./board";
import type { Article } from "./schemas";

const articleModules = import.meta.glob("../../content/articles/*.json", { eager: true, import: "default" });
const briefingModules = import.meta.glob("../../content/briefings/*.json", { eager: true, import: "default" });
const outlookModules = import.meta.glob("../../content/outlooks/*.json", { eager: true, import: "default" });
const observationModules = import.meta.glob("../../content/observations/*.json", { eager: true, import: "default" });
const sourceModule = import.meta.glob("../../content/sources.json", { eager: true, import: "default" });
const settingsModule = import.meta.glob("../../content/settings.json", { eager: true, import: "default" });

export type { BoardData };

export function loadBoard(): BoardData {
  const settingsValues = Object.values(settingsModule);
  const sourceValues = Object.values(sourceModule);
  if (settingsValues.length !== 1) throw new Error("Expected exactly one settings.json file.");
  if (sourceValues.length !== 1) throw new Error("Expected exactly one sources.json file.");
  return buildBoard({
    settings: SettingsSchema.parse(settingsValues[0]),
    sources: SourceSchema.array().parse(sourceValues[0]),
    articles: Object.values(articleModules).map((value) => ArticleSchema.parse(value)),
    briefings: Object.values(briefingModules).map((value) => DailyBriefingSchema.parse(value)),
    outlooks: Object.values(outlookModules).map((value) => WeeklyOutlookSchema.parse(value)),
    observations: Object.values(observationModules).map((value) => IndicatorObservationSchema.parse(value)),
  });
}

export function getArticleBySlug(slug: string): Article | undefined {
  return loadBoard().articles.find((article) => article.slug === slug);
}
