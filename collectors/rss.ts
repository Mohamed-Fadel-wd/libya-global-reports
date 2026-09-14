export type RssItem = {
  title: string;
  link: string;
  guid?: string;
  pubDate?: string;
  description?: string;
};

export function parseRssItems(xml: string): RssItem[] {
  const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? [];
  return items.map((block) => ({
    title: decode(inner(block, "title")),
    link: inner(block, "link") || inner(block, "guid"),
    guid: inner(block, "guid") || undefined,
    pubDate: inner(block, "pubDate") || undefined,
    description: decode(inner(block, "description")) || undefined,
  })).filter((item) => item.title && item.link);
}

function inner(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return "";
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
}

function decode(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}
