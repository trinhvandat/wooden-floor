import Link from "next/link";
import { MessageCircle, Phone } from "lucide-react";
import { SETTINGS } from "@/lib/settings";
import { ConversionTracker } from "@/components/ConversionTracker";

export const metadata = {
  title: "Cảm ơn bạn!",
  description: "Yêu cầu của bạn đã được ghi nhận. Sale FUKIONE sẽ liên hệ trong ~15 phút.",
  robots: { index: false, follow: true },
};

export default function CamOnPage() {
  const { zaloUrl, nap } = SETTINGS;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 bg-bg px-4 py-12 text-center">
      {/* Fire GA4 event on mount */}
      <ConversionTracker event="lead_submitted" />

      {/* ── Success icon ─────────────────────────────────── */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-trust-soft text-4xl">
        ✅
      </div>

      {/* ── Heading & subtext ────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.5px] text-ink">
          Cảm ơn bạn!
        </h1>
        <p className="text-[14px] leading-relaxed text-muted">
          Yêu cầu của bạn đã được ghi nhận.
          <br />
          <span className="font-semibold text-ink">
            Sale FUKIONE sẽ gọi lại trong ~15 phút
          </span>{" "}
          để xác nhận lịch.
        </p>
      </div>

      {/* ── Contact actions ──────────────────────────────── */}
      <div className="flex w-full max-w-xs flex-col gap-3">
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-pill bg-trust text-sm font-bold text-white shadow-cta transition-opacity hover:opacity-90 active:opacity-80"
        >
          <MessageCircle className="h-4 w-4" />
          Chat Zalo ngay
        </a>
        <a
          href={`tel:${nap.phone.replace(/\s/g, "")}`}
          className="flex h-12 items-center justify-center gap-2 rounded-pill border-2 border-trust text-sm font-bold text-trust transition-colors hover:bg-trust-soft"
        >
          <Phone className="h-4 w-4" />
          Gọi {nap.phone}
        </a>
      </div>

      {/* ── Keep visitor on-site ─────────────────────────── */}
      <div className="flex flex-col gap-1.5 text-[13px]">
        <p className="font-semibold text-ink">Trong khi chờ đợi:</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/#du-an"
            className="font-bold text-trust hover:underline"
          >
            Xem dự án thực tế →
          </Link>
          <Link
            href="/san-pham"
            className="font-bold text-trust hover:underline"
          >
            Xem thêm sản phẩm →
          </Link>
        </div>
      </div>
    </div>
  );
}
