import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  children: ReactNode;
  /** Renders a short walnut underline beneath the heading (one touch of premium per page) */
  withUnderline?: boolean;
  className?: string;
}

export function SectionHeading({
  children,
  withUnderline = false,
  className,
}: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "text-[17px] font-extrabold leading-tight text-ink",
        withUnderline &&
          "relative pb-2.5 after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-10 after:rounded-full after:bg-wood",
        className,
      )}
    >
      {children}
    </h2>
  );
}
