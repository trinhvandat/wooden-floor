import Link from "next/link";
import { PRODUCTS, COLLECTIONS, PROJECTS } from "@/lib/mock-data";
import { SETTINGS } from "@/lib/settings";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaStrip } from "@/components/CtaStrip";
import { BottomActionBar } from "@/components/site/BottomActionBar";
import { TrustStrip } from "@/components/site/TrustStrip";

const REASONS = [
  {
    icon: "🏠",
    title: "Showroom thực tế tại Hà Nội",
    desc: "Xem và chọn hàng trực tiếp — không mua mèo trong bao.",
  },
  {
    icon: "🔧",
    title: "Lắp đặt trọn gói, bảo hành dài hạn",
    desc: "Đội thi công chuyên nghiệp, cam kết tiến độ và chất lượng.",
  },
  {
    icon: "💬",
    title: "Tư vấn miễn phí, báo giá trong ngày",
    desc: "Chuyên gia sàn gỗ tư vấn 1-1, không mất phí tư vấn.",
  },
];

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 4);
  const project = PROJECTS[0];

  return (
    <div className="flex flex-col gap-8 bg-bg pb-8">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-wood-soft to-bg px-4 py-10">
        <h1 className="text-[25px] font-extrabold leading-tight tracking-[-0.5px] text-ink">
          Sàn gỗ cao cấp tại Hà Nội
          <br />
          Tư vấn &amp; Báo giá nhanh
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          FUKIONE — Showroom sàn gỗ Hà Nội. Lắp đặt trọn gói, bảo hành chính hãng.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="/bao-gia"
            className="inline-flex h-12 items-center justify-center rounded-pill bg-cta px-7 text-sm font-extrabold text-white shadow-cta transition-opacity hover:opacity-90 active:opacity-80"
          >
            🧮 Tính chi phí
          </a>
          <Link
            href="/san-pham"
            className="inline-flex h-11 items-center justify-center rounded-pill border-2 border-trust px-6 text-sm font-bold text-trust transition-colors hover:bg-trust-soft"
          >
            Xem sản phẩm
          </Link>
        </div>

        <div className="mt-5">
          <TrustStrip
            items={["Showroom tại Hà Nội", "Lắp đặt trọn gói", "Tư vấn miễn phí"]}
          />
        </div>
      </section>

      {/* ── Vì sao FUKIONE ───────────────────────────────────── */}
      <section className="px-4">
        <SectionHeading withUnderline>Vì sao chọn FUKIONE?</SectionHeading>
        <div className="mt-4 flex flex-col gap-3">
          {REASONS.map((r) => (
            <div
              key={r.title}
              className="flex gap-3 rounded-card border border-line bg-surface p-4 shadow-card"
            >
              <span className="text-2xl leading-none">{r.icon}</span>
              <div>
                <p className="text-[13.5px] font-extrabold leading-snug text-ink">
                  {r.title}
                </p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted">
                  {r.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sản phẩm nổi bật — horizontal scroll carousel ─── */}
      <section className="px-4">
        <div className="flex items-center justify-between">
          <SectionHeading>Sản phẩm nổi bật</SectionHeading>
          <Link
            href="/san-pham"
            className="text-[12.5px] font-bold text-trust hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-webkit-overflow-scrolling:touch]">
          {featured.map((p) => (
            <div key={p.id} className="w-44 shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Bộ sưu tập ───────────────────────────────────────── */}
      <section className="px-4">
        <SectionHeading>Bộ sưu tập</SectionHeading>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {COLLECTIONS.map((c) => (
            <Link
              key={c.id}
              href={`/bo-suu-tap/${c.slug}`}
              className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,.1)]"
            >
              {/* Cover image placeholder */}
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-wood-soft to-wood" />
              <div className="p-3">
                <p className="text-[12.5px] font-extrabold leading-snug text-ink">
                  {c.name}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted">
                  {c.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Dự án thực tế ─────────────────────────────────────── */}
      {project && (
        <section className="px-4">
          <SectionHeading>Dự án thực tế</SectionHeading>
          <Link
            href={`/du-an/${project.slug}`}
            className="mt-4 flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,.1)]"
          >
            <div className="aspect-video w-full bg-gradient-to-br from-wood-soft to-wood" />
            <div className="p-4">
              <p className="text-[14px] font-extrabold text-ink">{project.title}</p>
              <p className="mt-1 text-[12.5px] text-muted">
                📍 {project.location} · {project.areaM2} m²
              </p>
            </div>
          </Link>
        </section>
      )}

      {/* ── CTA strip ─────────────────────────────────────────── */}
      <section className="px-4">
        <CtaStrip
          heading="Cần tư vấn chọn sàn?"
          subCopy="Tư vấn miễn phí · Khảo sát tận nơi · Báo giá trong ngày"
          secondaryHref={SETTINGS.zaloUrl}
        />
      </section>

      <BottomActionBar primaryLabel="Tính chi phí" primaryHref="/bao-gia" />
    </div>
  );
}
