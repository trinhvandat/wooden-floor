"use client";

import { useState } from "react";
import { LeadFormSheet } from "@/components/LeadFormSheet";
import { BypassConsult } from "@/components/site/BypassConsult";
import type { Settings } from "@/lib/types";

/** Lead CTA for the project detail page — opens the shared quote sheet (source: "quote"). */
export function ProjectQuoteCta({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false);
  return (
    <section
      id="nhan-bao-gia"
      className="scroll-mt-20 rounded-card border border-line bg-surface p-6 text-center"
    >
      <h2 className="font-display text-[19px] font-extrabold leading-tight text-ink">
        Muốn một công trình tương tự?
      </h2>
      <p className="mx-auto mt-1.5 max-w-md text-[13.5px] leading-relaxed text-muted">
        Để lại thông tin — FUKIONE sẽ tư vấn và báo giá cho không gian của bạn.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center justify-center rounded-pill bg-cta px-6 py-3 text-sm font-extrabold text-ink shadow-cta"
      >
        Nhận báo giá
      </button>
      <div className="mt-3">
        <BypassConsult settings={settings} />
      </div>
      <LeadFormSheet open={open} onOpenChange={setOpen} settings={settings} />
    </section>
  );
}
