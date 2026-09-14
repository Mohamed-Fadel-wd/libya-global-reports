import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { describe, expect, it } from "vitest";
import {
  assertHonestCollectorUserAgent,
  fetchText,
  isHonestCollectorUserAgent,
  type HttpOptions,
} from "../collectors/http";

const options: HttpOptions = {
  userAgent: "LibyaGlobalReports/0.1 (+https://example.org; metadata collector; drafts only)",
  timeoutMs: 2000,
  maxRetries: 1,
  minIntervalMs: 0,
};

function listen(
  handler: (req: IncomingMessage, res: ServerResponse) => void,
): Promise<{ origin: string; close: () => Promise<void> }> {
  const server = createServer(handler);
  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("Expected a TCP address"));
        return;
      }
      resolve({
        origin: `http://127.0.0.1:${addr.port}`,
        close: () =>
          new Promise((done, fail) => {
            server.close((error) => (error ? fail(error) : done()));
          }),
      });
    });
  });
}

describe("collector HTTP identity", () => {
  it("accepts an identifying Libya Global Reports User-Agent", () => {
    expect(isHonestCollectorUserAgent(options.userAgent)).toBe(true);
    expect(() => assertHonestCollectorUserAgent(options.userAgent)).not.toThrow();
  });

  it("rejects a browser-spoofed User-Agent", () => {
    const spoof = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Safari/537.36";
    expect(isHonestCollectorUserAgent(spoof)).toBe(false);
    expect(() => assertHonestCollectorUserAgent(spoof)).toThrow(/must not spoof/);
  });

  it("fetches text over node:http without using undici fetch", async () => {
    const seen: string[] = [];
    const { origin, close } = await listen((req, res) => {
      seen.push(String(req.headers["user-agent"]));
      res.writeHead(200, { "Content-Type": "application/xml" });
      res.end("<rss><channel><title>ok</title></channel></rss>");
    });
    try {
      const result = await fetchText(`${origin}/feed.xml`, options);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.transport).toBe("node-http");
        expect(result.body).toContain("<rss>");
      }
      expect(seen[0]).toContain("LibyaGlobalReports");
    } finally {
      await close();
    }
  });

  it("follows a single redirect and records 304 as not-modified", async () => {
    const { origin, close } = await listen((req, res) => {
      if (req.url === "/go") {
        res.writeHead(302, { Location: "/dest" });
        res.end();
        return;
      }
      if (req.url === "/dest") {
        res.writeHead(200, { ETag: '"abc"' });
        res.end("hello");
        return;
      }
      if (req.url === "/fresh") {
        res.writeHead(304);
        res.end();
        return;
      }
      res.writeHead(404);
      res.end();
    });
    try {
      const redirected = await fetchText(`${origin}/go`, options);
      expect(redirected.ok).toBe(true);
      if (redirected.ok) expect(redirected.body).toBe("hello");

      const cached = await fetchText(`${origin}/fresh`, options);
      expect(cached.ok).toBe(true);
      if (cached.ok) expect(cached.notModified).toBe(true);
    } finally {
      await close();
    }
  });
});
