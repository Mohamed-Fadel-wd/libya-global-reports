import type { APIRoute } from "astro";
import { loadBoard } from "../lib/content";

export const GET: APIRoute = () => {
  const board = loadBoard();
  const site = board.settings.siteUrl.replace(/\/$/, "");
  const urls = [
    "/",
    "/weekly",
    "/sources",
    "/methodology",
    ...board.articles.map((article) => `/articles/${article.slug}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (path) => `  <url><loc>${site}${path === "/" ? "" : path}</loc></url>`,
  )
  .join("\n")}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
