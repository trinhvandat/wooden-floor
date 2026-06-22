import { MessageCircle } from "lucide-react";
import { SETTINGS } from "@/lib/settings";

interface BottomActionBarProps {
  primaryLabel: string;
  primaryHref: string;
}

export function BottomActionBar({ primaryLabel, primaryHref }: BottomActionBarProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex items-center gap-3 border-t border-line bg-surface/96 px-4 py-3 shadow-bar backdrop-blur md:hidden">
      {/* Primary CTA — full width amber pill */}
      <a
        href={primaryHref}
        className="flex flex-1 items-center justify-center rounded-pill bg-cta py-3 text-sm font-extrabold text-ink shadow-cta"
      >
        {primaryLabel}
      </a>

      {/* Teal circular Zalo button */}
      <a
        href={SETTINGS.zaloUrl}
        aria-label="Chat Zalo"
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-trust text-white"
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}
