import { Menu, Phone, MessageCircle } from "lucide-react";
import { SETTINGS } from "@/lib/settings";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur">
      <div className="flex h-14 items-center px-4">
        {/* Hamburger — mobile nav trigger (state lives in a future drawer) */}
        <button
          aria-label="Mở menu"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo wordmark — centered */}
        <a
          href="/"
          aria-label="FUKIONE — trang chủ"
          className="flex flex-1 items-center justify-center text-xl font-extrabold tracking-tight"
        >
          <span className="text-wood">FUKI</span>
          <span className="text-cta">ONE</span>
        </a>

        {/* Quick-contact icons */}
        <div className="flex items-center gap-1">
          <a
            href={`tel:${SETTINGS.nap.phone.replace(/\s/g, "")}`}
            aria-label="Gọi điện"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-trust transition-colors hover:bg-line"
          >
            <Phone className="h-5 w-5" />
          </a>
          <a
            href={SETTINGS.zaloUrl}
            aria-label="Chat Zalo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-trust transition-colors hover:bg-line"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
