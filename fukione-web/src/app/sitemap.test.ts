import { describe, it, expect, vi, beforeEach } from "vitest";

const { getProductsMock } = vi.hoisted(() => ({ getProductsMock: vi.fn() }));
vi.mock("@/lib/data/catalog", () => ({ getProducts: getProductsMock }));

import sitemap from "./sitemap";
import { absoluteUrl } from "@/lib/seo/site";

beforeEach(() => getProductsMock.mockReset());

describe("sitemap", () => {
  it("includes the static VN routes and one entry per product, and excludes /cam-on", async () => {
    getProductsMock.mockResolvedValue([{ slug: "san-go-walnut" }, { slug: "san-go-o-soi" }]);
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain(absoluteUrl("/"));
    expect(urls).toContain(absoluteUrl("/san-pham"));
    expect(urls).toContain(absoluteUrl("/bao-gia"));
    expect(urls).toContain(absoluteUrl("/dat-lich-khao-sat"));
    expect(urls).toContain(absoluteUrl("/san-pham/san-go-walnut"));
    expect(urls).toContain(absoluteUrl("/san-pham/san-go-o-soi"));
    expect(urls).not.toContain(absoluteUrl("/cam-on"));
  });
});
