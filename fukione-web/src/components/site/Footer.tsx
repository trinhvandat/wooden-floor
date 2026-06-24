import { Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { SETTINGS, ZALO_ENABLED } from "@/lib/settings";

export function Footer() {
  const { nap, hours, zaloUrl } = SETTINGS;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nap.address)}`;

  return (
    <footer className="border-t border-line bg-surface-warm">
      <div className="mx-auto max-w-xl px-4 py-8 space-y-5">
        {/* Brand */}
        <p className="text-lg font-extrabold tracking-tight">
          <span className="text-wood">FUKI</span>
          <span className="text-cta">ONE</span>
        </p>

        {/* NAP */}
        <address className="not-italic space-y-2 text-sm text-muted">
          <p className="font-semibold text-ink">{nap.name}</p>

          <span className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-trust" />
            <span>{nap.address}</span>
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

        {/* Quick links */}
        <div className="flex flex-wrap gap-3">
          {ZALO_ENABLED && (
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-pill border-2 border-trust px-4 py-3 text-sm font-bold text-trust transition-colors hover:bg-trust hover:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Chat Zalo
            </a>
          )}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-pill border-2 border-line px-4 py-3 text-sm font-bold text-muted transition-colors hover:border-trust hover:text-trust"
          >
            <MapPin className="h-4 w-4" />
            Xem bản đồ
          </a>
        </div>

        {/* Legal line */}
        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {nap.name}. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </footer>
  );
}
