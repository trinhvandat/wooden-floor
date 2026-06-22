import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SpecChipProps {
  children: ReactNode;
  className?: string;
}

export function SpecChip({ children, className }: SpecChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border border-trust-soft-border bg-trust-soft px-2.5 py-0.5 text-[11px] font-bold text-trust",
        className,
      )}
    >
      {children}
    </span>
  );
}
