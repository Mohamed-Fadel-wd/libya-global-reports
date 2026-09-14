import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadBoardFromFs } from "../src/lib/load-fs";

describe("repository content", () => {
  it("does not publish draft articles or draft observations from the content tree", async () => {
    const board = await loadBoardFromFs(path.resolve("."));
    expect(board.allArticles.some((article) => article.editorialStatus === "draft")).toBe(true);
    expect(board.articles.every((article) => article.editorialStatus === "published")).toBe(true);
    expect(board.articles.some((article) => article.slug === "unpublished-collector-draft-sample")).toBe(false);
    expect(board.observations.every((item) => item.editorialStatus === "published")).toBe(true);
    expect(board.observations.some((item) => item.location === "Should not appear")).toBe(false);
  });

  it("hides demo samples from the site while keeping them in the tree and out of RSS", async () => {
    const board = await loadBoardFromFs(path.resolve("."));
    expect(board.settings.showDemoContent).toBe(false);
    expect(board.allArticles.some((article) => article.demo)).toBe(true);
    expect(board.articles.length).toBeGreaterThan(0);
    expect(board.articles.every((article) => article.demo === false)).toBe(true);
    expect(board.rssItems).toHaveLength(7);
    expect(board.rssItems.every((article) => article.demo === false && article.editorialStatus === "published")).toBe(
      true,
    );
  });
});
