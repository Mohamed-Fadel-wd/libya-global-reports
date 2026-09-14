import type { APIRoute } from "astro";

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /
Disallow: /404

Sitemap: ${new URL("sitemap.xml", import.meta.env.SITE || "http://localhost:4321").toString()}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
