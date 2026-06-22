import { notFound } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, COLLECTIONS } from "@/lib/mock-data";
import { formatVnd } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import { SpecChip } from "@/components/SpecChip";
import { SectionHeading } from "@/components/SectionHeading";
import { CalculatorWidget } from "@/components/CalculatorWidget";
import { BottomActionBar } from "@/components/site/BottomActionBar";

// Next.js 16: params is a Promise
type PageParams = Promise<{ slug: string }>;

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return {};
  return {
    title: `${product.name} — FUKIONE`,
    description: `${product.name} — ${formatVnd(product.pricePerM2)}/m². Sàn gỗ cao cấp tại Hà Nội, lắp đặt trọn gói.`,
  };
}

export default async function ProductDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  // Related: prefer products in the same collection, fall back to other products
  const collection = COLLECTIONS.find((c) => c.productIds.includes(product.id));
  const related = (
    collection
      ? PRODUCTS.filter(
          (p) => collection.productIds.includes(p.id) && p.id !== product.id,
        )
      : PRODUCTS.filter((p) => p.id !== product.id)
  ).slice(0, 4);

  return (
    <div className="flex flex-col gap-6 bg-bg pb-8">
      {/* ── Gallery placeholder ────────────────────────────────── */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-wood-soft to-wood" />

      {/* ── Product header ─────────────────────────────────────── */}
      <section className="px-4">
        <h1 className="text-[21px] font-extrabold leading-tight text-ink">
          {product.name}
        </h1>
        <p className="mt-1.5 text-[20px] font-extrabold text-cta">
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
      <section className="px-4" id="tinh-chi-phi">
        <SectionHeading className="mb-4">Tính chi phí</SectionHeading>
        <CalculatorWidget variant="embedded" product={product} />
      </section>

      {/* ── Thông số kỹ thuật ──────────────────────────────────── */}
      <section className="px-4">
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
        <section className="px-4">
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

      {/* primaryHref anchors to the embedded calculator */}
      <BottomActionBar primaryLabel="Nhận báo giá" primaryHref="#tinh-chi-phi" />
    </div>
  );
}
