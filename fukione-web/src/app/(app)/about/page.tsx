import { MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { isZaloEnabled } from "@/lib/data/settings.map";
import { extractMapSrc } from "@/lib/maps";
import { SectionHeading } from "@/components/SectionHeading";
import { LeadCtaSection } from "@/components/site/LeadCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildLocalBusinessJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL, BASE_OPEN_GRAPH } from "@/lib/seo/site";

export const revalidate = 3600;

export const metadata = {
  title: "Giới thiệu",
  description:
    "FUKIONE — sàn gỗ cao cấp, lắp đặt trọn gói tại Hà Nội. Câu chuyện, cam kết và showroom của chúng tôi.",
  alternates: { canonical: "/gioi-thieu" },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title: "Giới thiệu — FUKIONE",
    description: "Sàn gỗ cao cấp, lắp đặt trọn gói tại Hà Nội.",
  },
};

const TRUST = [
  { stat: "8+", label: "năm kinh nghiệm" },
  { stat: "1.000+", label: "công trình đã thi công" },
  { stat: "12 tháng", label: "bảo hành thi công" },
  { stat: "Trọn gói", label: "khảo sát · thi công · vệ sinh" },
];

export default async function AboutPage() {
  const settings = await getSettings();
  const { nap, hours, zaloUrl, showroomAddress } = settings;
  const zaloOn = isZaloEnabled(zaloUrl);
  const mapSrc = extractMapSrc(settings.mapEmbed);
  const address = showroomAddress || nap.address;
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="bg-bg px-4 pb-12 pt-6">
      <JsonLd
        data={buildLocalBusinessJsonLd(
          { name: nap.name, address: nap.address, phone: nap.phone, hours },
          SITE_URL,
        )}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Giới thiệu", path: "/gioi-thieu" },
          ],
          SITE_URL,
        )}
      />

      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-10">
        {/* Hero / story */}
        <section className="max-w-2xl">
          <SectionHeading as="h1" withUnderline>
            Về FUKIONE
          </SectionHeading>
          <p className="mt-4 text-[14px] leading-relaxed text-muted">
            FUKIONE là thương hiệu sàn gỗ cao cấp tại Hà Nội, chuyên cung cấp và lắp đặt trọn gói
            cho căn hộ, nhà phố và biệt thự. Chúng tôi chọn lọc vật liệu bền đẹp, thi công bởi đội
            ngũ tay nghề cao và đồng hành cùng khách hàng từ khảo sát đến bàn giao — để mỗi sàn nhà
            là một không gian đáng tự hào.
          </p>
        </section>

        {/* Trust block */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TRUST.map((t) => (
            <div
              key={t.label}
              className="rounded-card border border-line bg-surface p-4 text-center"
            >
              <p className="font-display text-[22px] font-extrabold text-cta-ink">{t.stat}</p>
              <p className="mt-1 text-[12.5px] leading-snug text-muted">{t.label}</p>
            </div>
          ))}
        </section>

        {/* Map + contact */}
        <section className={mapSrc ? "grid gap-6 lg:grid-cols-2" : ""}>
          <div>
            <SectionHeading withUnderline>Showroom</SectionHeading>
            <address className="not-italic mt-4 space-y-2 text-sm text-muted">
              <p className="font-semibold text-ink">{nap.name}</p>
              <span className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-trust" />
                <span>{address}</span>
              </span>
              <a
                href={`tel:${nap.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 hover:text-trust"
              >
                <Phone className="h-4 w-4 shrink-0 text-trust" />
                <span>{nap.phone}</span>
              </a>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-trust" />
                <span>{hours}</span>
              </span>
            </address>
            <div className="mt-4 flex flex-wrap gap-3">
              {zaloOn && (
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-pill border-2 border-trust px-4 py-2.5 text-sm font-bold text-trust transition-colors hover:bg-trust hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat Zalo
                </a>
              )}
              {!mapSrc && (
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-pill border-2 border-line px-4 py-2.5 text-sm font-bold text-muted transition-colors hover:border-trust hover:text-trust"
                >
                  <MapPin className="h-4 w-4" />
                  Xem bản đồ
                </a>
              )}
            </div>
          </div>
          {mapSrc && (
            <div className="overflow-hidden rounded-card border border-line">
              <iframe
                src={mapSrc}
                title="Bản đồ showroom FUKIONE"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="aspect-[4/3] w-full"
              />
            </div>
          )}
        </section>

        {/* Lead CTA */}
        <LeadCtaSection
          settings={settings}
          title="Sẵn sàng làm mới sàn nhà bạn?"
          body="Để lại thông tin — FUKIONE sẽ tư vấn và báo giá miễn phí cho không gian của bạn."
        />
      </div>
    </div>
  );
}
