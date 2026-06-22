"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { estimateCost } from "@/lib/calculator";
import { SETTINGS } from "@/lib/settings";
import { PRODUCTS } from "@/lib/mock-data";
import { formatVnd } from "@/lib/format";
import { BypassConsult } from "@/components/site/BypassConsult";
import { LeadFormSheet } from "./LeadFormSheet";

interface CalculatorWidgetProps {
  /**
   * When provided (embedded variant): pre-fills and locks the product selector.
   * When omitted (page variant): renders a product <select> over PRODUCTS.
   */
  product?: Product;
  variant: "embedded" | "page";
}

export function CalculatorWidget({ product, variant }: CalculatorWidgetProps) {
  // Active product — locked when `product` prop is provided
  const [selectedId, setSelectedId] = useState<string>(
    product?.id ?? PRODUCTS[0].id,
  );
  const [areaM2, setAreaM2] = useState<number>(25);
  const [withInstall, setWithInstall] = useState<boolean>(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Resolve the active product object
  const activeProduct =
    product ?? PRODUCTS.find((p) => p.id === selectedId) ?? PRODUCTS[0];

  // Live estimate — recomputes on every render triggered by state change
  const estimate = estimateCost(
    { areaM2, pricePerM2: activeProduct.pricePerM2, withInstall },
    SETTINGS,
  );

  const hasResult = areaM2 > 0;

  return (
    <>
      <div className="flex flex-col gap-4 rounded-card bg-surface p-4 shadow-card">
        {/* ── Inputs ─────────────────────────────────────────── */}

        {/* Product select — page variant only */}
        {variant === "page" && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="calc-product"
              className="text-[12.5px] font-bold text-ink"
            >
              Sản phẩm
            </label>
            <select
              id="calc-product"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="h-10 w-full rounded-input border border-line bg-field px-2.5 text-sm text-ink outline-none focus:border-trust focus:ring-2 focus:ring-trust/20"
            >
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {formatVnd(p.pricePerM2)}/m²
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Embedded variant: show locked product name */}
        {variant === "embedded" && (
          <div className="flex items-center justify-between rounded-input border border-line bg-field px-3 py-2">
            <span className="text-[12.5px] font-bold text-ink">
              {activeProduct.name}
            </span>
            <span className="text-[12.5px] text-muted">
              {formatVnd(activeProduct.pricePerM2)}/m²
            </span>
          </div>
        )}

        {/* Area input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="calc-area"
            className="text-[12.5px] font-bold text-ink"
          >
            Diện tích (m²)
          </label>
          <div className="flex items-center gap-2">
            <input
              id="calc-area"
              type="number"
              min={0}
              step={1}
              value={areaM2 === 0 ? "" : areaM2}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setAreaM2(isNaN(val) ? 0 : Math.max(0, val));
              }}
              placeholder="25"
              className="h-10 w-full rounded-input border border-line bg-field px-2.5 text-sm text-ink outline-none focus:border-trust focus:ring-2 focus:ring-trust/20"
            />
            <span className="shrink-0 text-sm font-medium text-muted">m²</span>
          </div>
        </div>

        {/* Install toggle */}
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="text-[13px] font-medium text-ink">
            Bao gồm lắp đặt?
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={withInstall}
            onClick={() => setWithInstall((v) => !v)}
            className={[
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-pill border-2 border-transparent transition-colors",
              withInstall ? "bg-trust" : "bg-line",
            ].join(" ")}
          >
            <span
              className={[
                "pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform",
                withInstall ? "translate-x-5" : "translate-x-0.5",
              ].join(" ")}
            />
          </button>
        </label>

        {/* ── Result box ─────────────────────────────────────── */}
        <div className="rounded-card border border-dashed border-result-border bg-result-bg p-4">
          {!hasResult ? (
            <p className="text-center text-[13px] text-muted">
              Nhập diện tích để xem tạm tính
            </p>
          ) : (
            <>
              {/* Line items */}
              <div className="flex flex-col gap-1.5 text-[13px] text-muted">
                <div className="flex justify-between">
                  <span>Vật liệu</span>
                  <span>{formatVnd(estimate.material)}</span>
                </div>
                {withInstall && (
                  <div className="flex justify-between">
                    <span>Lắp đặt</span>
                    <span>{formatVnd(estimate.install)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Phào nẹp (ước tính)</span>
                  <span>~{formatVnd(estimate.trim)}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="my-2.5 border-t border-line" />

              {/* Total */}
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-bold text-ink">
                  TẠM TÍNH
                </span>
                <span className="text-[15px] font-extrabold text-ink">
                  ~{formatVnd(estimate.total)}
                </span>
              </div>

            </>
          )}
        </div>

        {/* Disclaimer note — always visible */}
        <p className="text-[12px] italic text-muted">
          * giá cuối phụ thuộc khảo sát thực tế
        </p>

        {/* ── CTA ────────────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="h-12 w-full rounded-pill bg-cta text-sm font-bold text-ink shadow-cta transition-opacity hover:opacity-90 active:opacity-80"
        >
          Nhận báo giá
        </button>

        <BypassConsult />
      </div>

      <LeadFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        context={
          hasResult
            ? {
                productName: activeProduct.name,
                areaM2,
                total: estimate.total,
              }
            : undefined
        }
      />
    </>
  );
}
