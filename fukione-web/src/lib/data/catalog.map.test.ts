import { describe, it, expect } from "vitest";
import { mapProduct, mapCollection, mapProject } from "./catalog.map";
import type { ProductDoc, CollectionDoc, ProjectDoc } from "./catalog.map";

const productDoc: ProductDoc = {
  id: 3,
  slug: "san-go-walnut",
  name: "Sàn Gỗ Walnut",
  pricePerM2: 610_000,
  thicknessMm: "12",
  waterproof: true,
  color: "Nâu Đậm",
  surface: "Vân gỗ óc chó",
  roomTypes: ["phòng khách"],
  specs: [{ k: "Độ dày", v: "12 mm" }],
  collectionRef: 1,
};

describe("mapProduct", () => {
  it("converts thicknessMm string to a number and stringifies the id", () => {
    const p = mapProduct(productDoc);
    expect(p.id).toBe("3");
    expect(p.thicknessMm).toBe(12);
    expect(p.waterproof).toBe(true);
    expect(p.images).toEqual([]);
    expect(p.specs).toEqual([{ k: "Độ dày", v: "12 mm" }]);
  });

  it("defaults nullable text fields to empty values", () => {
    const p = mapProduct({ id: 9, slug: "x", name: "X", pricePerM2: 1, thicknessMm: "8" });
    expect(p.thicknessMm).toBe(8);
    expect(p.color).toBe("");
    expect(p.roomTypes).toEqual([]);
  });
});

describe("mapCollection", () => {
  it("derives productIds from the inverse collectionRef on product docs", () => {
    const colDoc: CollectionDoc = { id: 1, slug: "cao-cap", name: "Cao Cấp", description: "d" };
    const others: ProductDoc[] = [
      productDoc,
      { id: 4, slug: "y", name: "Y", pricePerM2: 1, thicknessMm: "8", collectionRef: { id: 2 } },
      { id: 5, slug: "z", name: "Z", pricePerM2: 1, thicknessMm: "8", collectionRef: 1 },
    ];
    const c = mapCollection(colDoc, others);
    expect(c.id).toBe("1");
    expect(c.productIds).toEqual(["3", "5"]);
  });
});

describe("mapProject", () => {
  it("maps all productRefs to productIds and populated images to {url, alt}", () => {
    const doc: ProjectDoc = {
      id: 7,
      slug: "villa",
      title: "Villa",
      description: "desc",
      location: "HN",
      areaM2: 220,
      productRefs: [{ id: 3 }, 5],
      images: [
        { id: 1, url: "/m/a.jpg", alt: "A" },
        { id: 2, url: "/m/b.jpg", alt: "" },
      ],
    };
    const j = mapProject(doc);
    expect(j.productIds).toEqual(["3", "5"]);
    expect(j.images).toEqual([
      { url: "/m/a.jpg", alt: "A" },
      { url: "/m/b.jpg", alt: "" },
    ]);
    expect(j.description).toBe("desc");
    expect(j.areaM2).toBe(220);
  });

  it("defaults to empty arrays/strings and skips images without a url", () => {
    const j = mapProject({ id: 8, slug: "s", title: "S", images: [3, { id: 4 }] });
    expect(j.productIds).toEqual([]);
    expect(j.images).toEqual([]);
    expect(j.description).toBe("");
    expect(j.location).toBe("");
  });
});
