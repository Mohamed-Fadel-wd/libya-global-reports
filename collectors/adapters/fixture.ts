import { readFile } from "node:fs/promises";
import path from "node:path";
import { contentHash } from "../http.ts";
import { parseRssItems } from "../rss.ts";
import { sanitizeHttpUrl, stripHtml } from "../../src/lib/sanitize.ts";
import type { CollectorAdapter } from "./types.ts";

export const fixtureAdapter: CollectorAdapter = {
  id: "fixture-reliefweb",
  async collect(context) {
    const fixturePath = path.join(context.rootDir, "editorial/fixtures/reliefweb-libya.rss.xml");
    const xml = await readFile(fixturePath, "utf8");
    const drafts = parseRssItems(xml).flatMap((item, index) => {
      const url = sanitizeHttpUrl(item.link);
      if (!url) return [];
      const excerpt = stripHtml(item.description ?? "", 280);
      const collectedAt = context.now.toISOString();
      return [{
        id: `draft-fixture-${String(index + 1).padStart(3, "0")}`,
        adapter: "fixture-reliefweb",
        sourceId: context.source.id,
        canonicalUrl: url,
        title: stripHtml(item.title, 220),
        excerpt,
        sourcePublishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        collectedAt,
        contentHash: contentHash([url, item.title, excerpt]),
        editorialStatus: "draft" as const,
        demo: false as const,
        language: "en",
      }];
    });
    return {
      adapter: "fixture-reliefweb",
      sourceId: context.source.id,
      drafts,
      skipped: [],
      warnings: ["Fixture adapter reads local XML only. It does not hit the network."],
    };
  },
};
