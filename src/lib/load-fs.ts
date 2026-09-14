import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  ArticleSchema,
  DailyBriefingSchema,
  IndicatorObservationSchema,
  SettingsSchema,
  SourceSchema,
  WeeklyOutlookSchema,
} from "./schemas";
import { buildBoard, type BoardData } from "./board";

export async function loadBoardFromFs(rootDir: string): Promise<BoardData> {
  const contentDir = path.join(rootDir, "content");
  const settings = SettingsSchema.parse(JSON.parse(await readFile(path.join(contentDir, "settings.json"), "utf8")));
  const sources = SourceSchema.array().parse(JSON.parse(await readFile(path.join(contentDir, "sources.json"), "utf8")));
  const articles = await readJsonDir(path.join(contentDir, "articles"), (value) => ArticleSchema.parse(value));
  const briefings = await readJsonDir(path.join(contentDir, "briefings"), (value) => DailyBriefingSchema.parse(value));
  const outlooks = await readJsonDir(path.join(contentDir, "outlooks"), (value) => WeeklyOutlookSchema.parse(value));
  const observations = await readJsonDir(path.join(contentDir, "observations"), (value) =>
    IndicatorObservationSchema.parse(value),
  );
  return buildBoard({ settings, sources, articles, briefings, outlooks, observations });
}

async function readJsonDir<T>(dir: string, parse: (value: unknown) => T): Promise<T[]> {
  const names = (await readdir(dir)).filter((name) => name.endsWith(".json"));
  const values: T[] = [];
  for (const name of names) {
    values.push(parse(JSON.parse(await readFile(path.join(dir, name), "utf8"))));
  }
  return values;
}
