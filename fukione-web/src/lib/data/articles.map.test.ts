import { describe, it, expect } from "vitest";
import { mapArticleSummary, mapArticle } from "./articles.map";
import type { ArticleDoc } from "./articles.map";
import type { RichTextContent } from "@/lib/types";

const body: RichTextContent = { root: { type: "root", children: [], direction: "ltr", format: "", indent: 0, version: 1 } };

const fullDoc: ArticleDoc = {
  id: 5,
  slug: "san-go-cho-phong-tam",
  title: "Sàn gỗ cho phòng tắm",
  excerpt: "Chọn sàn chống nước đúng cách.",
  coverImage: { id: 1, url: "/m/a.jpg", alt: "Phòng tắm" },
  tags: ["chống nước", "mẹo"],
  publishedAt: "2026-06-12T00:00:00.000Z",
  body,
  seoMeta: { title: "SEO title", description: "SEO desc" },
};

describe("mapArticleSummary", () => {
  it("maps cover to {url, alt}, defaults, and tags", () => {
    const a = mapArticleSummary(fullDoc);
    expect(a.id).toBe("5");
    expect(a.coverImage).toEqual({ url: "/m/a.jpg", alt: "Phòng tắm" });
    expect(a.tags).toEqual(["chống nước", "mẹo"]);
    expect(a.publishedAt).toBe("2026-06-12T00:00:00.000Z");
  });

  it("nulls a url-less cover and defaults missing fields", () => {
    const a = mapArticleSummary({ id: 6, slug: "x", title: "X", coverImage: { id: 2 } });
    expect(a.coverImage).toBeNull();
    expect(a.excerpt).toBe("");
    expect(a.tags).toEqual([]);
    expect(a.publishedAt).toBe("");
  });
});

describe("mapArticle", () => {
  it("passes body through and derives seo from seoMeta", () => {
    const a = mapArticle(fullDoc);
    expect(a.body).toBe(body);
    expect(a.seo).toEqual({ title: "SEO title", description: "SEO desc" });
  });

  it("falls back seo to title/excerpt when seoMeta is empty", () => {
    const a = mapArticle({ ...fullDoc, seoMeta: undefined });
    expect(a.seo.title).toBe("Sàn gỗ cho phòng tắm");
    expect(a.seo.description).toBe("Chọn sàn chống nước đúng cách.");
  });
});
