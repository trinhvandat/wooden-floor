import { describe, it, expect, vi, beforeEach } from "vitest";

const { findMock } = vi.hoisted(() => ({ findMock: vi.fn() }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => ({ find: findMock })) }));

import { getArticles, getArticleBySlug } from "./articles";

beforeEach(() => findMock.mockReset());

describe("getArticles", () => {
  it("queries published articles sorted by -publishedAt and maps them", async () => {
    findMock.mockResolvedValue({ docs: [{ id: 7, slug: "p", title: "P" }] });
    const res = await getArticles();
    expect(res[0].id).toBe("7");
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "articles",
        where: { status: { equals: "published" } },
        sort: "-publishedAt",
      }),
    );
  });
});

describe("getArticleBySlug", () => {
  it("returns the mapped article when found", async () => {
    findMock.mockResolvedValue({ docs: [{ id: 7, slug: "villa", title: "Villa" }] });
    const a = await getArticleBySlug("villa");
    expect(a?.slug).toBe("villa");
  });
  it("returns null when not found", async () => {
    findMock.mockResolvedValue({ docs: [] });
    expect(await getArticleBySlug("nope")).toBeNull();
  });
});
