import { fetchText, type HttpOptions } from "./http.ts";

export async function robotsAllows(url: string, options: HttpOptions): Promise<{ allowed: boolean; reason: string }> {
  const parsed = new URL(url);
  const robotsUrl = `${parsed.origin}/robots.txt`;
  const result = await fetchText(robotsUrl, options);
  if (!result.ok) {
    if (result.status === 404) return { allowed: true, reason: "No robots.txt found; treating path as allowed." };
    return { allowed: false, reason: `Could not read robots.txt (${result.error}).` };
  }
  const pathWithQuery = `${parsed.pathname}${parsed.search}`;
  const groups = parseRobots(result.body);
  const star = groups["*"] ?? { allow: [], disallow: [] };
  if (isDisallowed(pathWithQuery, star.disallow, star.allow)) {
    return { allowed: false, reason: `robots.txt disallows ${pathWithQuery}` };
  }
  return { allowed: true, reason: "robots.txt allows this path." };
}

type RobotsGroup = { allow: string[]; disallow: string[] };

function parseRobots(text: string): Record<string, RobotsGroup> {
  const groups: Record<string, RobotsGroup> = {};
  let current = "*";
  groups[current] = { allow: [], disallow: [] };
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      current = value.toLowerCase() === "*" ? "*" : value.toLowerCase();
      groups[current] ??= { allow: [], disallow: [] };
    } else if (key === "disallow") {
      groups[current].disallow.push(value);
    } else if (key === "allow") {
      groups[current].allow.push(value);
    }
  }
  return groups;
}

function isDisallowed(pathname: string, disallows: string[], allows: string[]): boolean {
  const matchingDisallow = longestMatch(pathname, disallows.filter(Boolean));
  if (!matchingDisallow) return false;
  const matchingAllow = longestMatch(pathname, allows.filter(Boolean));
  if (matchingAllow && matchingAllow.length >= matchingDisallow.length) return false;
  return true;
}

function longestMatch(pathname: string, rules: string[]): string | null {
  let best: string | null = null;
  for (const rule of rules) {
    const prefix = rule.replace(/\$$/, "");
    if (pathname.startsWith(prefix) && (!best || prefix.length > best.length)) {
      best = prefix;
    }
  }
  return best;
}
