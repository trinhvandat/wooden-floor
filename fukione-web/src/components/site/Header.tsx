import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/data/settings";
import { isZaloEnabled } from "@/lib/data/settings.map";
import { MobileNav } from "@/components/site/MobileNav";

const NAV = [
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Bộ sưu tập", href: "/#bo-suu-tap" },
  { label: "Dự án", href: "/du-an" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Báo giá", href: "/bao-gia" },
];

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="FUKIONE — trang chủ"
      className={`text-xl font-extrabold tracking-tight ${className}`}
    >
      <span className="text-wood">FUKI</span>
      <span className="text-cta">ONE</span>
    </Link>
  );
}

export async function Header() {
  const settings = await getSettings();
  const tel = `tel:${settings.nap.phone.replace(/\s/g, "")}`;
  const zaloOn = isZaloEnabled(settings.zaloUrl);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
      {/* ── Mobile chrome (hamburger · logo · icons) ───────────────── */}
      <div className="flex h-14 items-center px-4 md:hidden">
        <MobileNav settings={settings} />
        <Wordmark className="flex flex-1 items-center justify-center" />
        <div className="flex items-center gap-1">
          <a
            href={tel}
            aria-label="Gọi điện"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-trust transition-colors hover:bg-line"
          >
            <Phone className="h-5 w-5" />
          </a>
          {zaloOn && (
            <a
              href={settings.zaloUrl}
              aria-label="Chat Zalo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-lg text-trust transition-colors hover:bg-line"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {/* ── Desktop chrome (logo · nav · CTA) ──────────────────────── */}
      <div className="mx-auto hidden h-16 max-w-[1280px] items-center gap-8 px-6 md:flex lg:px-10">
        <Wordmark />

        <nav className="flex items-center gap-7">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-1 text-[14px] font-semibold text-ink/80 transition-colors hover:text-ink"
            >
              {item.label}
              <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 bg-cta transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={tel}
            aria-label="Gọi điện"
            className="flex h-10 w-10 items-center justify-center rounded-full text-trust transition-colors hover:bg-trust-soft"
          >
            <Phone className="h-[18px] w-[18px]" />
          </a>
          {zaloOn && (
            <a
              href={settings.zaloUrl}
              aria-label="Chat Zalo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full text-trust transition-colors hover:bg-trust-soft"
            >
              <MessageCircle className="h-[18px] w-[18px]" />
            </a>
          )}
          <Link
            href="/bao-gia"
            className="ml-1 inline-flex h-10 items-center rounded-pill bg-cta px-5 text-[13.5px] font-bold text-ink shadow-cta transition-opacity hover:opacity-90"
          >
            Tính chi phí
          </Link>
        </div>
      </div>
    </header>
  );
}
