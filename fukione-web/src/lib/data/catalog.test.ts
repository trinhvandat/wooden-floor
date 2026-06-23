import { describe, it, expect, vi, beforeEach } from "vitest";

const { findMock } = vi.hoisted(() => ({ findMock: vi.fn() }));
vi.mock("@payload-config", () => ({ default: {} }));
vi.mock("payload", () => ({ getPayload: vi.fn(async () => ({ find: findMock })) }));

import { getProducts, getProductBySlug, getCollections, getProjects } from "./catalog";

beforeEach(() => findMock.mockReset());

const productDoc = {
  id: 1, slug: "a", name: "A", pricePerM2: 100, thicknessMm: "8", collectionRef: 10,
};

describe("getProducts", () => {
  it("queries published products and maps them", async () => {
    findMock.mockResolvedValue({ docs: [productDoc] });
    const result = await getProducts();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
    expect(result[0].thicknessMm).toBe(8);
    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "products", where: { status: { equals: "published" } } }),
    );
  });
});

describe("getProductBySlug", () => {
  it("returns null when no product matches", async () => {
    findMock.mockResolvedValue({ docs: [] });
    expect(await getProductBySlug("missing")).toBeNull();
  });

  it("maps the first matching doc", async () => {
    findMock.mockResolvedValue({ docs: [productDoc] });
    const p = await getProductBySlug("a");
    expect(p?.slug).toBe("a");
  });
});

describe("getCollections", () => {
  it("builds productIds from the inverse collectionRef", async () => {
    findMock
      .mockResolvedValueOnce({ docs: [{ id: 10, slug: "c", name: "C", description: "d" }] })
      .mockResolvedValueOnce({ docs: [productDoc] });
    const cols = await getCollections();
    expect(cols[0].productIds).toEqual(["1"]);
  });
});

describe("getProjects", () => {
  it("maps project docs", async () => {
    findMock.mockResolvedValue({ docs: [{ id: 7, slug: "p", title: "P", productRefs: [10] }] });
    const projects = await getProjects();
    expect(projects[0].productId).toBe("10");
  });
});
