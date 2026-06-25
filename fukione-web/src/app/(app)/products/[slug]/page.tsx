import { notFound } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { getProducts, getProductBySlug, getCollections } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { formatVnd } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { SpecChip } from "@/components/SpecChip";
import { SectionHeading } from "@/components/SectionHeading";
import { CalculatorWidget } from "@/components/CalculatorWidget";
import { BottomActionBar } from "@/components/site/BottomActionBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildProductJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL, BASE_OPEN_GRAPH } from "@/lib/seo/site";

// Next.js 16: params is a Promise
type PageParams = Promise<{ slug: string }>;

export const revalidate = 3600;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.name} — ${formatVnd(product.pricePerM2)}/m². Sàn gỗ cao cấp tại Hà Nội, lắp đặt trọn gói.`,
    alternates: { canonical: `/san-pham/${product.slug}` },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: `${product.name} — FUKIONE`,
      description: `${product.name} — ${formatVnd(product.pricePerM2)}/m². Lắp đặt trọn gói tại Hà Nội.`,
    },
  };
}

export default async function ProductDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [collections, all, settings] = await Promise.all([getCollections(), getProducts(), getSettings()]);
  const collection = collections.find((c) => c.productIds.includes(product.id));
  const related: Product[] = (
    collection
      ? all.filter((p) => collection.productIds.includes(p.id) && p.id !== product.id)
      : all.filter((p) => p.id !== product.id)
  ).slice(0, 4);

  return (
    <div className="bg-bg pb-8">
      <JsonLd data={buildProductJsonLd(product, SITE_URL)} />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Sản phẩm", path: "/san-pham" },
            { name: product.name, path: `/san-pham/${product.slug}` },
          ],
          SITE_URL,
        )}
      />

      {/* Width-capped, centered shell so the page doesn't stretch edge-to-edge on desktop */}
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 lg:gap-8">
        {/* ── Top region: gallery + header/calculator (two-column on desktop) ── */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:px-6 lg:pt-6">
          {/* Gallery placeholder — sticky alongside the info column on desktop */}
          <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-wood-soft to-wood lg:sticky lg:top-6 lg:overflow-hidden lg:rounded-card" />

          {/* Info column: header + embedded calculator */}
          <div className="flex flex-col gap-6">
            {/* ── Product header ─────────────────────────────────────── */}
            <section className="px-4 lg:px-0">
              <h1 className="font-display text-[21px] font-extrabold leading-tight text-ink">
                {product.name}
              </h1>
              <p className="mt-1.5 text-[20px] font-extrabold text-cta-ink">
                {formatVnd(product.pricePerM2)}
                <span className="ml-0.5 text-[14px] font-medium text-muted">/m²</span>
              </p>

              {/* Spec chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {product.waterproof && <SpecChip>✓ Chống nước</SpecChip>}
                <SpecChip>✓ {product.thicknessMm}mm</SpecChip>
                <SpecChip>{product.surface}</SpecChip>
                {product.roomTypes.slice(0, 2).map((r) => (
                  <SpecChip key={r}>{r}</SpecChip>
                ))}
              </div>
            </section>

            {/* ── Embedded calculator ─────────────────────────────────── */}
            {/* id="tinh-chi-phi" so BottomActionBar's anchor scrolls here */}
            <section className="px-4 lg:px-0" id="tinh-chi-phi">
              <SectionHeading className="mb-4">Tính chi phí</SectionHeading>
              <CalculatorWidget variant="embedded" product={product} settings={settings} />
            </section>
          </div>
        </div>

        {/* ── Thông số kỹ thuật ──────────────────────────────────── */}
        <section className="px-4 lg:px-6">
          <SectionHeading withUnderline>Thông số kỹ thuật</SectionHeading>
          <div className="mt-4 overflow-hidden rounded-card border border-line">
            {product.specs.map((spec, i) => (
              <div
                key={spec.k}
                className={[
                  "flex justify-between px-4 py-2.5 text-[13px]",
                  i < product.specs.length - 1 ? "border-b border-line" : "",
                ].join(" ")}
              >
                <span className="font-bold text-ink">{spec.k}</span>
                <span className="text-muted">{spec.v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sản phẩm liên quan ──────────────────────────────────── */}
        {related.length > 0 && (
          <section className="px-4 lg:px-6">
            <div className="flex items-center justify-between">
              <SectionHeading>Sản phẩm liên quan</SectionHeading>
              <Link
                href="/san-pham"
                className="text-[12.5px] font-bold text-trust hover:underline"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
              {related.map((p) => (
                <div key={p.id} className="w-44 shrink-0 snap-start">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* primaryHref anchors to the embedded calculator; label distinguishes it
          from the calculator's own "Nhận báo giá" (quote-request) button */}
      <BottomActionBar primaryLabel="Tính chi phí" primaryHref="#tinh-chi-phi" />
    </div>
  );
}
