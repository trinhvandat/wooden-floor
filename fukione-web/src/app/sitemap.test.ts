import { describe, it, expect, vi, beforeEach } from "vitest";

const { getProductsMock, getProjectsMock, getArticlesMock } = vi.hoisted(() => ({
  getProductsMock: vi.fn(),
  getProjectsMock: vi.fn(),
  getArticlesMock: vi.fn(),
}));
vi.mock("@/lib/data/catalog", () => ({
  getProducts: getProductsMock,
  getProjects: getProjectsMock,
}));
vi.mock("@/lib/data/articles", () => ({
  getArticles: getArticlesMock,
}));

import sitemap from "./sitemap";
import { absoluteUrl } from "@/lib/seo/site";

beforeEach(() => {
  getProductsMock.mockReset();
  getProjectsMock.mockReset();
  getArticlesMock.mockReset();
});

describe("sitemap", () => {
  it("includes the static VN routes and one entry per product, and excludes /cam-on", async () => {
    getProductsMock.mockResolvedValue([{ slug: "san-go-walnut" }, { slug: "san-go-o-soi" }]);
    getProjectsMock.mockResolvedValue([{ slug: "villa-ecopark" }]);
    getArticlesMock.mockResolvedValue([{ slug: "kinh-nghiem-chon-san-go" }]);
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(absoluteUrl("/"));
    expect(urls).toContain(absoluteUrl("/san-pham"));
    expect(urls).toContain(absoluteUrl("/bao-gia"));
    expect(urls).toContain(absoluteUrl("/dat-lich-khao-sat"));
    expect(urls).toContain(absoluteUrl("/du-an"));
    expect(urls).toContain(absoluteUrl("/tin-tuc"));
    expect(urls).toContain(absoluteUrl("/san-pham/san-go-walnut"));
    expect(urls).toContain(absoluteUrl("/san-pham/san-go-o-soi"));
    expect(urls).toContain(absoluteUrl("/du-an/villa-ecopark"));
    expect(urls).toContain(absoluteUrl("/tin-tuc/kinh-nghiem-chon-san-go"));
    expect(urls).not.toContain(absoluteUrl("/cam-on"));
  });
});
