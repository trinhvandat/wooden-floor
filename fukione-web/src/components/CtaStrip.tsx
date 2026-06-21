import { cn } from "@/lib/utils";

interface CtaStripProps {
  heading?: string;
  subCopy?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

/**
 * Amber-soft gradient CTA panel.
 * Discipline rule: one primary amber button per strip, teal outline for secondary.
 */
export function CtaStrip({
  heading = "Cần tư vấn chọn sàn?",
  subCopy = "Tư vấn miễn phí · Báo giá nhanh trong ngày",
  primaryLabel = "Tính chi phí",
  primaryHref = "/bao-gia",
  secondaryLabel = "Chat Zalo",
  secondaryHref = "#",
  className,
}: CtaStripProps) {
  return (
    <section
      className={cn(
        "rounded-card p-5",
        "bg-gradient-to-br from-cta-soft-from to-cta-soft-to",
        className,
      )}
    >
      <h3 className="text-[17px] font-extrabold text-cta-ink">{heading}</h3>
      {subCopy && (
        <p className="mt-1 text-[13px] text-cta-ink/70">{subCopy}</p>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        {/* Primary CTA — amber fill, one per strip */}
        <a
          href={primaryHref}
          className="inline-flex h-11 items-center justify-center rounded-pill bg-cta px-6 text-sm font-bold text-white shadow-cta transition-opacity hover:opacity-90"
        >
          {primaryLabel}
        </a>

        {/* Secondary — teal outline */}
        <a
          href={secondaryHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-pill border-2 border-trust bg-white px-6 text-sm font-bold text-trust transition-colors hover:bg-trust-soft"
        >
          {secondaryLabel}
        </a>
      </div>
    </section>
  );
}
