import { fetchText, readCache, writeCache, contentHash, sha256 } from "../http.ts";
import { robotsAllows } from "../robots.ts";
import { parseRssItems } from "../rss.ts";
import { sanitizeHttpUrl, stripHtml } from "../../src/lib/sanitize.ts";
import type { CollectorAdapter } from "./types.ts";

export const genericRssAdapter: CollectorAdapter = {
  id: "rss-generic",
  async collect(context) {
    const warnings: string[] = [];
    const skipped: string[] = [];
    if (!context.source.endpoint) {
      return {
        adapter: this.id,
        sourceId: context.source.id,
        drafts: [],
        skipped: ["Source has no endpoint."],
        warnings,
      };
    }
    const robots = await robotsAllows(context.source.endpoint, context.options);
    if (!robots.allowed) {
      return { adapter: this.id, sourceId: context.source.id, drafts: [], skipped: [robots.reason], warnings };
    }
    const cacheDir = `${context.rootDir}/editorial/cache`;
    const cache = await readCache(cacheDir, `${this.id}-${context.source.id}`);
    const headers: Record<string, string> = {};
    if (cache?.etag) headers["If-None-Match"] = cache.etag;
    if (cache?.lastModified) headers["If-Modified-Since"] = cache.lastModified;
    const result = await fetchText(context.source.endpoint, context.options, headers);
    if (!result.ok) {
      warnings.push(`Feed unavailable: ${result.error}`);
      return { adapter: this.id, sourceId: context.source.id, drafts: [], skipped, warnings };
    }
    if (result.notModified) {
      warnings.push("Feed was not modified (HTTP 304).");
      return { adapter: this.id, sourceId: context.source.id, drafts: [], skipped, warnings };
    }
    const collectedAt = context.now.toISOString();
    const drafts = parseRssItems(result.body).flatMap((item) => {
      const url = sanitizeHttpUrl(item.link);
      if (!url) return [];
      const title = stripHtml(item.title, 220);
      const excerpt = stripHtml(item.description ?? "", 280);
      return [{
        id: `draft-${context.source.id}-${sha256(url).slice(0, 12)}`,
        adapter: this.id,
        sourceId: context.source.id,
        canonicalUrl: url,
        title,
        excerpt,
        sourcePublishedAt: item.pubDate && !Number.isNaN(Date.parse(item.pubDate)) ? new Date(item.pubDate).toISOString() : null,
        collectedAt,
        contentHash: contentHash([url, title, excerpt]),
        editorialStatus: "draft" as const,
        demo: false as const,
      }];
    });
    await writeCache(cacheDir, `${this.id}-${context.source.id}`, {
      etag: result.etag,
      lastModified: result.lastModified,
      bodyHash: sha256(result.body),
      fetchedAt: collectedAt,
    });
    return { adapter: this.id, sourceId: context.source.id, drafts, skipped, warnings };
  },
};
