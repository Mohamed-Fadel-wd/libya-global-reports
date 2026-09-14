import type { APIRoute } from "astro";
import { loadBoard } from "../lib/content";
import { escapeHtml } from "../lib/sanitize";

export const GET: APIRoute = () => {
  const board = loadBoard();
  const site = board.settings.siteUrl.replace(/\/$/, "");
  const items = board.rssItems
    .map((article) => {
      const link = `${site}/articles/${article.slug}`;
      return `    <item>
      <title>${escapeHtml(article.title)}</title>
      <link>${escapeHtml(link)}</link>
      <guid>${escapeHtml(link)}</guid>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <description>${escapeHtml(article.summary)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeHtml(board.settings.siteName)}</title>
    <link>${escapeHtml(site)}</link>
    <description>${escapeHtml(board.settings.tagline)} Approved, non-demo articles only.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
};
