import { fetchText, readCache, writeCache, contentHash, sha256 } from "../http.ts";
import { robotsAllows } from "../robots.ts";
import { parseRssItems } from "../rss.ts";
import { sanitizeHttpUrl, stripHtml } from "../../src/lib/sanitize.ts";
import type { CollectorAdapter } from "./types.ts";

export const RELIEFWEB_LIBYA_RSS =
  "https://reliefweb.int/updates/rss.xml?advanced-search=%28PC140%29";

export const reliefwebLibyaAdapter: CollectorAdapter = {
  id: "reliefweb-libya-rss",
  async collect(context) {
    const warnings: string[] = [];
    const skipped: string[] = [];
    const endpoint = context.source.endpoint || RELIEFWEB_LIBYA_RSS;
    const robots = await robotsAllows(endpoint, context.options);
    if (!robots.allowed) {
      return {
        adapter: this.id,
        sourceId: context.source.id,
        drafts: [],
        skipped: [robots.reason],
        warnings,
      };
    }

    const cacheDir = `${context.rootDir}/editorial/cache`;
    const cache = await readCache(cacheDir, this.id);
    const headers: Record<string, string> = {};
    if (cache?.etag) headers["If-None-Match"] = cache.etag;
    if (cache?.lastModified) headers["If-Modified-Since"] = cache.lastModified;

    const result = await fetchText(endpoint, context.options, headers);
    if (!result.ok) {
      warnings.push(`ReliefWeb RSS unavailable: ${result.error}`);
      return { adapter: this.id, sourceId: context.source.id, drafts: [], skipped, warnings };
    }
    if (result.notModified) {
      warnings.push("Feed was not modified since the last collection (HTTP 304).");
      return { adapter: this.id, sourceId: context.source.id, drafts: [], skipped, warnings };
    }

    const items = parseRssItems(result.body);
    const collectedAt = context.now.toISOString();
    const drafts = items.flatMap((item) => {
      const url = sanitizeHttpUrl(item.link);
      if (!url) {
        skipped.push(`Dropped item with invalid URL: ${item.link}`);
        return [];
      }
      const title = stripHtml(item.title, 220);
      const excerpt = stripHtml(item.description ?? "", 280);
      let sourcePublishedAt: string | null = null;
      if (item.pubDate) {
        const parsed = new Date(item.pubDate);
        if (!Number.isNaN(parsed.getTime())) sourcePublishedAt = parsed.toISOString();
      }
      return [{
        id: `draft-rw-${sha256(url).slice(0, 12)}`,
        adapter: this.id,
        sourceId: context.source.id,
        canonicalUrl: url,
        title,
        excerpt,
        sourcePublishedAt,
        collectedAt,
        contentHash: contentHash([url, title, excerpt]),
        editorialStatus: "draft" as const,
        demo: false as const,
        language: "en",
      }];
    });

    await writeCache(cacheDir, this.id, {
      etag: result.etag,
      lastModified: result.lastModified,
      bodyHash: sha256(result.body),
      fetchedAt: collectedAt,
    });

    warnings.push(
      "Collected titles, links and short excerpts only. Full reports stay on ReliefWeb. Nothing is published until an editor approves a draft.",
    );

    return { adapter: this.id, sourceId: context.source.id, drafts, skipped, warnings };
  },
};
