import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import path from "node:path";
import type { IncomingHttpHeaders, IncomingMessage, RequestOptions } from "node:http";

export const DEFAULT_COLLECTOR_USER_AGENT =
  "LibyaGlobalReports/0.1 (+https://github.com/Mohamed-Fadel-wd; metadata collector; drafts only)";

const MAX_REDIRECTS = 5;
const MAX_BODY_BYTES = 2_000_000;
const RETRY_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

export type FetchResult =
  | {
      ok: true;
      url: string;
      status: number;
      body: string;
      etag?: string;
      lastModified?: string;
      notModified?: boolean;
      transport: "node-http";
    }
  | {
      ok: false;
      url: string;
      status?: number;
      error: string;
      retryable: boolean;
      transport: "node-http";
    };

export type HttpOptions = {
  userAgent: string;
  timeoutMs: number;
  maxRetries: number;
  minIntervalMs: number;
};

const lastRequestAt = new Map<string, number>();

function hostOf(url: string): string {
  return new URL(url).host;
}

async function wait(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttle(url: string, minIntervalMs: number): Promise<void> {
  const host = hostOf(url);
  const last = lastRequestAt.get(host) ?? 0;
  const waitFor = minIntervalMs - (Date.now() - last);
  await wait(waitFor);
  lastRequestAt.set(host, Date.now());
}

export function isHonestCollectorUserAgent(userAgent: string): boolean {
  const ua = userAgent.trim();
  if (!ua.toLowerCase().includes("libyaglobalreports")) return false;
  return !/mozilla\/|chrome\/|safari\/|applewebkit|firefox\//i.test(ua);
}

export function assertHonestCollectorUserAgent(userAgent: string): void {
  if (!isHonestCollectorUserAgent(userAgent)) {
    throw new Error(
      "Collector User-Agent must identify Libya Global Reports and must not spoof a browser.",
    );
  }
}

function headerValue(headers: IncomingHttpHeaders, name: string): string | undefined {
  const raw = headers[name.toLowerCase()];
  if (Array.isArray(raw)) return raw[0];
  return raw;
}

function resolveRedirect(current: URL, location: string): URL {
  return new URL(location, current);
}

function requestOnce(
  target: URL,
  options: HttpOptions,
  extraHeaders: Record<string, string>,
): Promise<{ status: number; headers: IncomingHttpHeaders; body: string; url: string }> {
  return new Promise((resolve, reject) => {
    const lib = target.protocol === "https:" ? https : http;
    const requestOptions: RequestOptions = {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || undefined,
      path: `${target.pathname}${target.search}`,
      method: "GET",
      headers: {
        Host: target.host,
        "User-Agent": options.userAgent,
        Accept: "application/rss+xml, application/xml, text/xml, application/json, text/plain, */*",
        Connection: "close",
        ...extraHeaders,
      },
    };

    const req = lib.request(requestOptions, (res: IncomingMessage) => {
      const chunks: Buffer[] = [];
      let size = 0;
      res.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > MAX_BODY_BYTES) {
          req.destroy(new Error("Response exceeded 2MB collector limit."));
          return;
        }
        chunks.push(chunk);
      });
      res.on("end", () => {
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers,
          body: Buffer.concat(chunks).toString("utf8"),
          url: target.toString(),
        });
      });
    });

    req.on("error", (error) => reject(error));
    req.setTimeout(options.timeoutMs, () => {
      req.destroy(new Error(`Request timed out after ${options.timeoutMs}ms`));
    });
    req.end();
  });
}

async function fetchFollowingRedirects(
  url: string,
  options: HttpOptions,
  extraHeaders: Record<string, string>,
): Promise<FetchResult> {
  let current = new URL(url);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await requestOnce(current, options, extraHeaders);
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = headerValue(response.headers, "location");
      if (!location) {
        return {
          ok: false,
          url: response.url,
          status: response.status,
          error: `HTTP ${response.status} with no Location`,
          retryable: false,
          transport: "node-http",
        };
      }
      current = resolveRedirect(current, location);
      continue;
    }
    if (response.status === 304) {
      return {
        ok: true,
        url: response.url,
        status: 304,
        body: "",
        notModified: true,
        transport: "node-http",
      };
    }
    if (response.status < 200 || response.status >= 300) {
      return {
        ok: false,
        url: response.url,
        status: response.status,
        error: `HTTP ${response.status}`,
        retryable: response.status >= 500,
        transport: "node-http",
      };
    }
    return {
      ok: true,
      url: response.url,
      status: response.status,
      body: response.body,
      etag: headerValue(response.headers, "etag"),
      lastModified: headerValue(response.headers, "last-modified"),
      transport: "node-http",
    };
  }
  return {
    ok: false,
    url,
    error: "Too many redirects",
    retryable: false,
    transport: "node-http",
  };
}

export async function fetchText(
  url: string,
  options: HttpOptions,
  extraHeaders: Record<string, string> = {},
): Promise<FetchResult> {
  assertHonestCollectorUserAgent(options.userAgent);
  const attempts = Math.max(1, options.maxRetries);
  let lastError: FetchResult | null = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    await throttle(url, options.minIntervalMs);
    try {
      const result = await fetchFollowingRedirects(url, options, extraHeaders);
      if (!result.ok && result.status && RETRY_STATUSES.has(result.status) && attempt < attempts) {
        lastError = { ...result, retryable: true };
        await wait(300 * 2 ** (attempt - 1));
        continue;
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastError = { ok: false, url, error: message, retryable: true, transport: "node-http" };
      if (attempt < attempts) await wait(300 * 2 ** (attempt - 1));
    }
  }
  return lastError ?? { ok: false, url, error: "Unknown fetch error", retryable: false, transport: "node-http" };
}

export type CacheEntry = { etag?: string; lastModified?: string; bodyHash: string; fetchedAt: string };

export async function readCache(cacheDir: string, adapterId: string): Promise<CacheEntry | null> {
  try {
    const raw = await readFile(path.join(cacheDir, `${adapterId}.json`), "utf8");
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

export async function writeCache(cacheDir: string, adapterId: string, entry: CacheEntry): Promise<void> {
  await mkdir(cacheDir, { recursive: true });
  await writeFile(path.join(cacheDir, `${adapterId}.json`), `${JSON.stringify(entry, null, 2)}\n`, "utf8");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function contentHash(parts: Array<string | null | undefined>): string {
  return sha256(parts.map((part) => part ?? "").join("\n"));
}
