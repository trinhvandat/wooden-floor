import { describe, it, expect } from "vitest";
import {
  buildLocalBusinessJsonLd,
  buildProductJsonLd,
  buildBreadcrumbJsonLd,
} from "./jsonld";
import type { Product } from "@/lib/types";

const SITE = "https://fukione.vn";

const product: Product = {
  id: "3",
  slug: "san-go-walnut",
  name: "Sàn Gỗ Walnut",
  pricePerM2: 610000,
  thicknessMm: 12,
  waterproof: true,
  color: "Nâu Đậm",
  surface: "Vân gỗ óc chó",
  roomTypes: ["phòng khách"],
  images: [],
  specs: [],
};

describe("buildLocalBusinessJsonLd", () => {
  it("emits a HomeAndConstructionBusiness with NAP and area served", () => {
    const ld = buildLocalBusinessJsonLd(
      { name: "FUKIONE", address: "Số 12, Cầu Giấy, Hà Nội", phone: "0900 000 000", hours: "8:00–18:00" },
      SITE,
    ) as Record<string, unknown>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("HomeAndConstructionBusiness");
    expect(ld.name).toBe("FUKIONE");
    expect(ld.telephone).toBe("0900 000 000");
    expect(ld.areaServed).toBe("Hà Nội");
    expect((ld.address as Record<string, unknown>)["@type"]).toBe("PostalAddress");
  });

  it("omits telephone when phone is missing", () => {
    const ld = buildLocalBusinessJsonLd({ name: "FUKIONE" }, SITE) as Record<string, unknown>;
    expect("telephone" in ld).toBe(false);
  });
});

describe("buildProductJsonLd", () => {
  it("emits a Product with a VND offer at the product URL", () => {
    const ld = buildProductJsonLd(product, SITE) as Record<string, unknown>;
    expect(ld["@type"]).toBe("Product");
    expect(ld.name).toBe("Sàn Gỗ Walnut");
    const offer = ld.offers as Record<string, unknown>;
    expect(offer.price).toBe(610000);
    expect(offer.priceCurrency).toBe("VND");
    expect(offer.url).toBe("https://fukione.vn/san-pham/san-go-walnut");
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("numbers items from 1 and resolves absolute item URLs", () => {
    const ld = buildBreadcrumbJsonLd(
      [{ name: "Trang chủ", path: "/" }, { name: "Sản phẩm", path: "/san-pham" }],
      SITE,
    ) as Record<string, unknown>;
    expect(ld["@type"]).toBe("BreadcrumbList");
    const items = ld.itemListElement as Record<string, unknown>[];
    expect(items).toHaveLength(2);
    expect(items[0].position).toBe(1);
    expect(items[1].item).toBe("https://fukione.vn/san-pham");
  });
});
