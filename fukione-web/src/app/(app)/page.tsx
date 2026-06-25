import Link from "next/link";
import { ArrowRight, MapPin, ShieldCheck, Hammer, MessageCircle } from "lucide-react";
import { getProducts, getCollections, getProjects } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";
import { isZaloEnabled } from "@/lib/data/settings.map";
import { formatVnd } from "@/lib/format";
import { BottomActionBar } from "@/components/site/BottomActionBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildLocalBusinessJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";

const REASONS = [
  {
    n: "01",
    title: "Gỗ tuyển, bền theo năm tháng",
    body: "Cốt gỗ HDF chống ẩm, bề mặt chịu xước AC4–AC5. Mỗi tấm ván là một lựa chọn kỹ.",
  },
  {
    n: "02",
    title: "Thợ lắp đặt lành nghề",
    body: "Đội thi công riêng của FUKIONE, đo đạc tận nơi, hoàn thiện phẳng phiu trong 24 giờ.",
  },
  {
    n: "03",
    title: "Minh bạch từ con số đầu tiên",
    body: "Tính chi phí trọn gói ngay trên web. Báo giá rõ ràng, không phát sinh ẩn.",
  },
];

const MARQUEE = [
  "Showroom tại Hà Nội",
  "Khảo sát tận nhà miễn phí",
  "Lắp đặt trọn gói 24h",
  "Bảo hành dài hạn",
  "Tư vấn qua Zalo",
];

export const metadata = {
  title: { absolute: "FUKIONE — Sàn gỗ cao cấp tại Hà Nội, lắp đặt trọn gói" },
  description:
    "Sàn gỗ cao cấp tại Hà Nội: 8 mẫu sàn, tính chi phí nhanh, khảo sát tận nơi, lắp đặt trọn gói. Tư vấn miễn phí qua Zalo.",
  alternates: { canonical: "/" },
};

export const revalidate = 3600;

export default async function HomePage() {
  const [products, allCollections, allProjects, settings] = await Promise.all([
    getProducts(),
    getCollections(),
    getProjects(),
    getSettings(),
  ]);
  const featured = products.slice(0, 3);
  const heroProduct = products[0];
  const collections = allCollections.slice(0, 2);
  const projects = allProjects.slice(0, 4);
  const leadProject = projects[0];

  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={buildLocalBusinessJsonLd(
          { name: settings.nap.name, address: settings.nap.address, phone: settings.nap.phone, hours: settings.hours },
          SITE_URL,
        )}
      />
      {/* Atmosphere: warm glow + film grain */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_70%_-10%,var(--color-cta-soft-from),transparent_60%)] opacity-70"
      />
      <div
        aria-hidden
        className="fk-grain pointer-events-none fixed inset-0 z-[1] opacity-[0.04] mix-blend-multiply"
      />

      {/* ════════════════════ HERO ════════════════════ */}
      <section className="mx-auto max-w-[1280px] px-6 pb-16 pt-10 lg:px-10 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Text column */}
          <div className="lg:col-span-7">
            <p
              className="fk-rise flex items-center gap-2.5 text-[12.5px] font-bold uppercase tracking-[0.22em] text-muted"
              style={{ animationDelay: "0ms" }}
            >
              <span className="h-px w-8 bg-cta" />
              Sàn gỗ cao cấp · Hà Nội
            </p>

            <h1
              className="fk-rise mt-6 font-display text-[2.6rem] font-medium leading-[1.04] tracking-[-0.01em] text-ink sm:text-6xl lg:text-[4.25rem]"
              style={{ animationDelay: "80ms" }}
            >
              Nền nhà đẹp bắt đầu
              <br className="hidden sm:block" /> từ một sàn gỗ{" "}
              <em className="font-display font-semibold italic text-cta-ink">tử tế</em>.
            </h1>

            <p
              className="fk-rise mt-6 max-w-xl text-[15.5px] leading-relaxed text-muted"
              style={{ animationDelay: "160ms" }}
            >
              FUKIONE mang đến sàn gỗ tuyển chọn cùng dịch vụ lắp đặt trọn gói tại
              Hà Nội — tư vấn tận tâm, báo giá nhanh, khảo sát tận nơi.
            </p>

            <div
              className="fk-rise mt-9 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "240ms" }}
            >
              <Link
                href="/bao-gia"
                className="group inline-flex h-13 items-center gap-2 rounded-pill bg-cta px-7 py-3.5 text-[15px] font-bold text-ink shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Tính chi phí ngay
                <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/san-pham"
                className="group relative text-[15px] font-bold text-ink"
              >
                Xem 52 mẫu sàn
                <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-100 bg-wood transition-transform group-hover:scale-x-0" />
                <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-right scale-x-0 bg-cta transition-transform delay-100 group-hover:scale-x-100" />
              </Link>
            </div>

            {/* Stat row */}
            <div
              className="fk-rise mt-12 flex flex-wrap gap-x-10 gap-y-6 border-t border-line pt-8"
              style={{ animationDelay: "320ms" }}
            >
              {[
                { num: "12", unit: "năm", label: "kinh nghiệm nghề sàn" },
                { num: "1.200", unit: "+", label: "công trình tại Hà Nội" },
                { num: "52", unit: "mẫu", label: "sàn gỗ trong bộ sưu tập" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl font-semibold text-ink">
                    {s.num}
                    <span className="text-cta-ink">{s.unit}</span>
                  </p>
                  <p className="mt-1 text-[12.5px] text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image column */}
          <div className="fk-rise lg:col-span-5" style={{ animationDelay: "200ms" }}>
            <div className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-wood-soft to-wood shadow-[0_30px_60px_-20px_rgba(36,31,27,0.45)]">
                <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
                <span className="absolute left-5 top-5 rounded-pill bg-bg/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-wood backdrop-blur">
                  Vân sồi tự nhiên
                </span>
              </div>
              {/* Floating product caption */}
              {heroProduct && (
                <div className="absolute -bottom-6 -left-6 hidden w-60 rounded-2xl border border-line bg-surface/95 p-4 shadow-card backdrop-blur sm:block">
                  <p className="text-[12px] font-medium text-muted">Đang bán chạy</p>
                  <p className="mt-0.5 font-display text-lg font-semibold text-ink">
                    {heroProduct.name}
                  </p>
                  <p className="mt-1 text-[15px] font-extrabold text-cta-ink">
                    {formatVnd(heroProduct.pricePerM2)}
                    <span className="text-[12px] font-medium text-muted">/m²</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ TRUST MARQUEE ════════════════════ */}
      <div className="border-y border-line bg-surface-warm/60">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4 lg:px-10">
          {MARQUEE.map((item) => (
            <span
              key={item}
              className="flex items-center gap-2 text-[13px] font-semibold text-ink/70"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-cta" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ════════════════════ WHY FUKIONE ════════════════════ */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-[12.5px] font-bold uppercase tracking-[0.22em] text-cta-ink">
            Vì sao FUKIONE
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight text-ink lg:text-[2.75rem]">
            Một sàn gỗ tốt là khoản đầu tư cho cả thập kỷ.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
          {REASONS.map((r) => (
            <div key={r.n} className="bg-bg p-8 transition-colors hover:bg-surface-warm/50">
              <p className="font-display text-5xl font-semibold text-wood-soft">{r.n}</p>
              <h3 className="mt-5 text-[17px] font-extrabold text-ink">{r.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-muted">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════ FEATURED PRODUCTS ════════════════════ */}
      <section className="mx-auto max-w-[1280px] px-6 pb-20 lg:px-10 lg:pb-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-[12.5px] font-bold uppercase tracking-[0.22em] text-cta-ink">
              Bán chạy
            </p>
            <h2 className="mt-4 font-display text-3xl font-medium text-ink lg:text-[2.5rem]">
              Những mẫu sàn được chọn nhiều nhất
            </h2>
          </div>
          <Link
            href="/san-pham"
            className="group hidden shrink-0 items-center gap-2 text-[14px] font-bold text-ink sm:inline-flex"
          >
            Xem tất cả
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <Link key={p.id} href={`/san-pham/${p.slug}`} className="group block">
              <div className="relative aspect-[5/6] overflow-hidden rounded-2xl bg-gradient-to-br from-wood-soft to-wood">
                <div className="absolute inset-0 scale-100 bg-gradient-to-t from-ink/25 to-transparent transition-transform duration-700 group-hover:scale-110" />
                {p.waterproof && (
                  <span className="absolute left-4 top-4 rounded-pill bg-trust-soft px-2.5 py-1 text-[11px] font-bold text-trust">
                    ✓ Chống nước
                  </span>
                )}
                <span className="absolute bottom-4 right-4 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-cta text-ink opacity-0 shadow-cta transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl font-semibold text-ink transition-colors group-hover:text-wood">
                  {p.name}
                </h3>
                <p className="shrink-0 text-[15px] font-extrabold text-cta-ink">
                  {formatVnd(p.pricePerM2)}
                  <span className="text-[11px] font-medium text-muted">/m²</span>
                </p>
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {p.surface} · dày {p.thicknessMm}mm
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════ ROOM COLLECTIONS ════════════════════ */}
      <section
        id="bo-suu-tap"
        className="mx-auto max-w-[1280px] scroll-mt-20 px-6 pb-20 lg:px-10 lg:pb-28"
      >
        <p className="text-[12.5px] font-bold uppercase tracking-[0.22em] text-cta-ink">
          Bộ sưu tập
        </p>
        <h2 className="mt-4 max-w-xl font-display text-3xl font-medium text-ink lg:text-[2.5rem]">
          Chọn sàn theo không gian sống
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {collections.map((c, i) => (
            <Link
              key={c.id}
              href="/san-pham"
              className="group relative flex aspect-[16/10] items-end overflow-hidden rounded-3xl p-8"
            >
              <div
                className={`absolute inset-0 transition-transform duration-700 group-hover:scale-105 ${
                  i % 2 === 0
                    ? "bg-gradient-to-br from-wood to-ink"
                    : "bg-gradient-to-br from-wood-soft to-wood"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
              <div className="relative">
                <h3 className="font-display text-2xl font-semibold text-bg lg:text-3xl">
                  {c.name}
                </h3>
                <p className="mt-2 max-w-sm text-[13.5px] text-bg/80">{c.description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-[13.5px] font-bold text-bg">
                  Khám phá
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ════════════════════ PROJECTS (dark walnut) ════════════════════ */}
      <section id="du-an" className="scroll-mt-20 bg-ink text-bg">
        <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-[12.5px] font-bold uppercase tracking-[0.22em] text-cta">
                Công trình thực tế
              </p>
              <h2 className="mt-4 font-display text-3xl font-medium leading-tight text-bg lg:text-[2.75rem]">
                Hàng nghìn ngôi nhà Hà Nội đã chọn FUKIONE
              </h2>
            </div>
            <Link
              href="/du-an"
              className="text-[13px] font-bold text-cta hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            {/* Lead project */}
            {leadProject && (
              <div className="group relative aspect-[16/11] overflow-hidden rounded-3xl lg:col-span-7">
                <div className="absolute inset-0 bg-gradient-to-br from-wood-soft to-wood transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-bg/80">
                    <MapPin className="h-3.5 w-3.5" /> {leadProject.location}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-bg lg:text-3xl">
                    {leadProject.title}
                  </h3>
                  <p className="mt-1 text-[13.5px] text-bg/75">
                    Diện tích {leadProject.areaM2}m²
                  </p>
                </div>
              </div>
            )}

            {/* Secondary projects */}
            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-5">
              {projects.slice(1, 4).map((pr) => (
                <div
                  key={pr.id}
                  className="group relative aspect-[16/10] overflow-hidden rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-wood to-ink transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/65 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <p className="text-[11.5px] font-semibold text-bg/70">{pr.location}</p>
                    <h4 className="mt-0.5 font-display text-[17px] font-semibold text-bg">
                      {pr.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════ CALCULATOR CTA ════════════════════ */}
      <section className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-cta-soft-from to-cta-soft-to px-8 py-14 text-center lg:px-16 lg:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cta/10 blur-3xl"
          />
          <p className="text-[12.5px] font-bold uppercase tracking-[0.22em] text-cta-ink">
            Báo giá nhanh
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-medium leading-tight text-ink lg:text-[2.75rem]">
            Biết trước chi phí trọn gói chỉ trong 30 giây
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] text-muted">
            Nhập diện tích phòng, chọn mẫu sàn — nhận ngay con số tạm tính. Sale gọi
            lại tư vấn miễn phí.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/bao-gia"
              className="group inline-flex h-13 items-center gap-2 rounded-pill bg-cta px-8 py-3.5 text-[15px] font-bold text-ink shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Tính chi phí ngay
              <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
            </Link>
            {isZaloEnabled(settings.zaloUrl) && (
              <a
                href={settings.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[14.5px] font-bold text-trust"
              >
                <MessageCircle className="h-[18px] w-[18px]" />
                Hoặc tư vấn ngay qua Zalo
              </a>
            )}
          </div>

          {/* Trust micro-row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[12.5px] font-semibold text-ink/70">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-trust" /> Showroom Hà Nội
            </span>
            <span className="flex items-center gap-1.5">
              <Hammer className="h-4 w-4 text-trust" /> Lắp đặt trọn gói
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-trust" /> Bảo hành dài hạn
            </span>
          </div>
        </div>
      </section>

      <BottomActionBar primaryLabel="Tính chi phí" primaryHref="/bao-gia" />
    </div>
  );
}
