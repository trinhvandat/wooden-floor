import type { Product } from "@/lib/types";

export interface BusinessInfo {
  name: string;
  address?: string;
  phone?: string;
  hours?: string;
}

export function buildLocalBusinessJsonLd(biz: BusinessInfo, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: biz.name,
    url: siteUrl,
    areaServed: "Hà Nội",
    priceRange: "$$",
    ...(biz.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: biz.address,
            addressLocality: "Hà Nội",
            addressCountry: "VN",
          },
        }
      : {}),
    ...(biz.phone ? { telephone: biz.phone } : {}),
    ...(biz.hours ? { openingHours: biz.hours } : {}),
  };
}

export function buildProductJsonLd(product: Product, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: `${product.name} — sàn gỗ ${product.surface}, dày ${product.thicknessMm}mm${product.waterproof ? ", chống nước" : ""}. Lắp đặt trọn gói tại Hà Nội.`,
    brand: { "@type": "Brand", name: "FUKIONE" },
    ...(product.images.length ? { image: product.images } : {}),
    offers: {
      "@type": "Offer",
      price: product.pricePerM2,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
      url: new URL(`/san-pham/${product.slug}`, siteUrl).toString(),
    },
  };
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path: string }[],
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: new URL(it.path, siteUrl).toString(),
    })),
  };
}
