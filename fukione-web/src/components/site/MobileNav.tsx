"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Phone, MessageCircle } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { Settings } from "@/lib/types";
import { isZaloEnabled } from "@/lib/data/settings.map";

const NAV = [
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Bộ sưu tập", href: "/#bo-suu-tap" },
  { label: "Dự án", href: "/#du-an" },
  { label: "Báo giá", href: "/bao-gia" },
];

export function MobileNav({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false);
  const tel = `tel:${settings.nap.phone.replace(/\s/g, "")}`;
  const zaloOn = isZaloEnabled(settings.zaloUrl);

  return (
    <>
      <button
        aria-label="Mở menu"
        onClick={() => setOpen(true)}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-line"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={true}
          className="flex flex-col gap-0 p-0"
        >
          <nav className="flex flex-col gap-1 px-4 pt-8 pb-4">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[16px] font-semibold text-ink transition-colors hover:bg-surface-warm"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 border-t border-line px-4 py-6">
            <a
              href={tel}
              className="flex items-center gap-2 text-[14px] font-semibold text-ink"
            >
              <Phone className="h-4 w-4 text-trust" />
              {settings.nap.phone}
            </a>
            {zaloOn && (
              <a
                href={settings.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[14px] font-semibold text-ink"
              >
                <MessageCircle className="h-4 w-4 text-trust" />
                Zalo tư vấn
              </a>
            )}
            <Link
              href="/bao-gia"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex h-12 items-center justify-center rounded-pill bg-cta px-6 text-[15px] font-bold text-ink shadow-cta"
            >
              Tính chi phí
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
