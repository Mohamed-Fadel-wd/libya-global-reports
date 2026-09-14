import { readFile } from "node:fs/promises";
import path from "node:path";
import { SourceSchema, type Source } from "../src/lib/schemas.ts";
import { mergeWithExisting } from "./dedupe.ts";
import { readQueue, writeDrafts } from "./queue.ts";
import { DEFAULT_COLLECTOR_USER_AGENT, type HttpOptions } from "./http.ts";
import { fixtureAdapter } from "./adapters/fixture.ts";
import { reliefwebLibyaAdapter } from "./adapters/reliefweb-libya.ts";
import { genericRssAdapter } from "./adapters/rss-generic.ts";
import { reliefwebApiAdapter } from "./adapters/reliefweb-api.ts";
import type { CollectorAdapter } from "./adapters/types.ts";

const adapters: CollectorAdapter[] = [
  fixtureAdapter,
  reliefwebLibyaAdapter,
  genericRssAdapter,
  reliefwebApiAdapter,
];

export function adapterById(id: string): CollectorAdapter | undefined {
  return adapters.find((adapter) => adapter.id === id);
}

export async function loadSourceRegister(rootDir: string): Promise<Source[]> {
  const raw = JSON.parse(await readFile(path.join(rootDir, "content/sources.json"), "utf8"));
  return SourceSchema.array().parse(raw);
}

export function enabledSources(sources: Source[]): Source[] {
  return sources.filter((source) => source.enabled && source.reviewStatus === "reviewed" && Boolean(source.adapter));
}

export function httpOptionsFromEnv(): HttpOptions {
  return {
    userAgent: process.env.LGR_HTTP_USER_AGENT || DEFAULT_COLLECTOR_USER_AGENT,
    timeoutMs: Number(process.env.LGR_HTTP_TIMEOUT_MS || 15000),
    maxRetries: Number(process.env.LGR_HTTP_MAX_RETRIES || 3),
    minIntervalMs: Number(process.env.LGR_HTTP_MIN_INTERVAL_MS || 1500),
  };
}

export async function runCollection(rootDir: string, adapterIds?: string[]): Promise<void> {
  const sources = await loadSourceRegister(rootDir);
  const selected = enabledSources(sources).filter((source) => {
    if (!adapterIds?.length) return true;
    return adapterIds.includes(source.adapter || "");
  });

  if (!selected.length) {
    console.log("No enabled, reviewed sources matched the requested adapters.");
    return;
  }

  const queueDir = path.join(rootDir, "editorial/drafts/queue");
  const existing = await readQueue(queueDir);
  const options = httpOptionsFromEnv();
  const now = new Date();

  for (const source of selected) {
    const adapter = adapterById(source.adapter || "");
    if (!adapter) {
      console.warn(`No adapter registered for ${source.id} (${source.adapter}).`);
      continue;
    }
    console.log(`Collecting ${source.id} via ${adapter.id}…`);
    try {
      const result = await adapter.collect({ source, options, rootDir, now });
      for (const warning of result.warnings) console.warn(`  warning: ${warning}`);
      for (const skipped of result.skipped) console.warn(`  skipped: ${skipped}`);
      const merged = mergeWithExisting(existing, result.drafts);
      existing.splice(0, existing.length, ...merged.next);
      console.log(
        `  drafts fetched: ${result.drafts.length}; added: ${merged.added}; duplicates skipped: ${Math.max(merged.skipped, 0)}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`  failed: ${message}`);
    }
  }

  await writeDrafts(queueDir, existing);
  console.log(`Queue now has ${existing.length} draft(s) in ${queueDir}`);
  console.log("Drafts are not published. An editor must copy reviewed facts into content/articles.");
}
