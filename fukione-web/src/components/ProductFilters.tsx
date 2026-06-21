"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { PRODUCTS } from "@/lib/mock-data";
import { formatVnd } from "@/lib/format";
import { ProductCard } from "@/components/ProductCard";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ── Derived filter options ─────────────────────────────────────────────────
const ALL_COLORS = Array.from(new Set(PRODUCTS.map((p) => p.color)));
const ALL_ROOMS = Array.from(
  new Set(PRODUCTS.flatMap((p) => p.roomTypes)),
).sort();
const PRICE_OPTIONS = [
  { label: `≤ ${formatVnd(400_000)}/m²`, value: 400_000 },
  { label: `≤ ${formatVnd(500_000)}/m²`, value: 500_000 },
  { label: `≤ ${formatVnd(600_000)}/m²`, value: 600_000 },
];

// ── Types ──────────────────────────────────────────────────────────────────
type SortOrder = "default" | "price-asc" | "price-desc";

interface FilterState {
  color: string | null;
  thicknessMm: 8 | 12 | null;
  waterproof: boolean | null;
  room: string | null;
  maxPrice: number | null;
}

const EMPTY_FILTERS: FilterState = {
  color: null,
  thicknessMm: null,
  waterproof: null,
  room: null,
  maxPrice: null,
};

// ── Helper: apply filters to PRODUCTS ─────────────────────────────────────
function applyFilters(f: FilterState) {
  return PRODUCTS.filter((p) => {
    if (f.color && p.color !== f.color) return false;
    if (f.thicknessMm !== null && p.thicknessMm !== f.thicknessMm) return false;
    if (f.waterproof !== null && p.waterproof !== f.waterproof) return false;
    if (f.room && !p.roomTypes.includes(f.room)) return false;
    if (f.maxPrice !== null && p.pricePerM2 > f.maxPrice) return false;
    return true;
  });
}

// ── Toggle button used in the filter sheet ─────────────────────────────────
function FilterToggle({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-pill border px-3 py-1.5 text-[12px] font-bold transition-colors",
        active
          ? "border-trust bg-trust text-white"
          : "border-line bg-surface text-ink hover:border-trust hover:text-trust",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export function ProductFilters() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOrder>("default");
  const [sheetOpen, setSheetOpen] = useState(false);
  // Draft state — only committed when "Áp dụng" is tapped
  const [draft, setDraft] = useState<FilterState>(EMPTY_FILTERS);

  // Filtered + sorted products
  const filtered = useMemo(() => {
    const results = applyFilters(filters);
    if (sort === "price-asc") return [...results].sort((a, b) => a.pricePerM2 - b.pricePerM2);
    if (sort === "price-desc") return [...results].sort((a, b) => b.pricePerM2 - a.pricePerM2);
    return results;
  }, [filters, sort]);

  // Preview count for the "Áp dụng" button
  const draftCount = useMemo(() => applyFilters(draft).length, [draft]);

  const activeCount = Object.values(filters).filter((v) => v !== null).length;

  // Active filter chips for the filter bar
  const activeChips: { key: keyof FilterState; label: string }[] = [];
  if (filters.color) activeChips.push({ key: "color", label: filters.color });
  if (filters.thicknessMm !== null)
    activeChips.push({ key: "thicknessMm", label: `${filters.thicknessMm}mm` });
  if (filters.waterproof !== null)
    activeChips.push({
      key: "waterproof",
      label: filters.waterproof ? "Chống nước" : "Không chống nước",
    });
  if (filters.room) activeChips.push({ key: "room", label: filters.room });
  if (filters.maxPrice !== null)
    activeChips.push({
      key: "maxPrice",
      label: `≤ ${formatVnd(filters.maxPrice)}/m²`,
    });

  function openSheet() {
    setDraft(filters); // sync draft with applied filters
    setSheetOpen(true);
  }

  function applyDraft() {
    setFilters(draft);
    setSheetOpen(false);
  }

  function removeFilter(key: keyof FilterState) {
    setFilters((prev) => ({ ...prev, [key]: null }));
  }

  function clearAll() {
    setFilters(EMPTY_FILTERS);
  }

  function toggleSort() {
    setSort((prev) => {
      if (prev === "default") return "price-asc";
      if (prev === "price-asc") return "price-desc";
      return "default";
    });
  }

  const sortLabel =
    sort === "price-asc"
      ? "Giá tăng dần"
      : sort === "price-desc"
        ? "Giá giảm dần"
        : "Sắp xếp";

  return (
    <>
      {/* ── Sticky filter bar ──────────────────────────────────── */}
      <div className="sticky top-14 z-40 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur">
        {/* Row 1: count + sort */}
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] font-extrabold text-ink">
            Sản phẩm ({filtered.length})
          </span>
          <button
            type="button"
            onClick={toggleSort}
            className="flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12.5px] font-bold text-ink transition-colors hover:border-trust hover:text-trust"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {sortLabel}
          </button>
        </div>

        {/* Row 2: filter button + active chips */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openSheet}
            className="flex items-center gap-1.5 rounded-pill border border-line bg-surface px-3 py-1.5 text-[12.5px] font-bold text-ink transition-colors hover:border-trust hover:text-trust"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Lọc{activeCount > 0 ? ` (${activeCount})` : ""}
          </button>

          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeFilter(chip.key)}
              className="flex items-center gap-1 rounded-pill border border-trust-soft-border bg-trust-soft px-2.5 py-1 text-[11px] font-bold text-trust"
            >
              {chip.label}
              <X className="h-3 w-3" />
            </button>
          ))}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11.5px] font-bold text-muted hover:text-ink"
            >
              Xóa tất cả
            </button>
          )}
        </div>
      </div>

      {/* ── Product grid ────────────────────────────────────────── */}
      <div className="px-4 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-4xl">🪵</span>
            <p className="text-[14px] font-bold text-ink">
              Không tìm thấy sản phẩm phù hợp
            </p>
            <p className="text-[13px] text-muted">Thử bỏ bớt điều kiện lọc</p>
            <button
              type="button"
              onClick={clearAll}
              className="mt-2 rounded-pill border-2 border-trust px-5 py-2 text-[13px] font-bold text-trust hover:bg-trust-soft"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      {/* ── Filter bottom sheet ──────────────────────────────────── */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton
          className="flex max-h-[85vh] flex-col gap-0 overflow-hidden rounded-t-[22px] px-0 pb-0"
        >
          <SheetHeader className="shrink-0 border-b border-line px-5 pb-4">
            <SheetTitle className="text-[17px] font-extrabold text-ink">
              Bộ lọc
            </SheetTitle>
          </SheetHeader>

          {/* Scrollable filter options */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-6 px-5 py-5">
              {/* Màu sắc */}
              <div>
                <p className="mb-2.5 text-[12.5px] font-bold text-ink">Màu sắc</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_COLORS.map((c) => (
                    <FilterToggle
                      key={c}
                      active={draft.color === c}
                      onClick={() =>
                        setDraft((d) => ({ ...d, color: d.color === c ? null : c }))
                      }
                    >
                      {c}
                    </FilterToggle>
                  ))}
                </div>
              </div>

              {/* Độ dày */}
              <div>
                <p className="mb-2.5 text-[12.5px] font-bold text-ink">Độ dày</p>
                <div className="flex gap-2">
                  {([8, 12] as const).map((mm) => (
                    <FilterToggle
                      key={mm}
                      active={draft.thicknessMm === mm}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          thicknessMm: d.thicknessMm === mm ? null : mm,
                        }))
                      }
                    >
                      {mm} mm
                    </FilterToggle>
                  ))}
                </div>
              </div>

              {/* Chống nước */}
              <div>
                <p className="mb-2.5 text-[12.5px] font-bold text-ink">Chống nước</p>
                <div className="flex gap-2">
                  {(
                    [
                      { label: "Có", value: true },
                      { label: "Không", value: false },
                    ] as const
                  ).map(({ label, value }) => (
                    <FilterToggle
                      key={label}
                      active={draft.waterproof === value}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          waterproof: d.waterproof === value ? null : value,
                        }))
                      }
                    >
                      {label}
                    </FilterToggle>
                  ))}
                </div>
              </div>

              {/* Loại phòng */}
              <div>
                <p className="mb-2.5 text-[12.5px] font-bold text-ink">Loại phòng</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_ROOMS.map((r) => (
                    <FilterToggle
                      key={r}
                      active={draft.room === r}
                      onClick={() =>
                        setDraft((d) => ({ ...d, room: d.room === r ? null : r }))
                      }
                    >
                      {r}
                    </FilterToggle>
                  ))}
                </div>
              </div>

              {/* Giá tối đa */}
              <div>
                <p className="mb-2.5 text-[12.5px] font-bold text-ink">Giá tối đa</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_OPTIONS.map(({ label, value }) => (
                    <FilterToggle
                      key={value}
                      active={draft.maxPrice === value}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          maxPrice: d.maxPrice === value ? null : value,
                        }))
                      }
                    >
                      {label}
                    </FilterToggle>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Fixed footer */}
          <div className="shrink-0 flex gap-3 border-t border-line px-5 py-4">
            <button
              type="button"
              onClick={() => setDraft(EMPTY_FILTERS)}
              className="flex-1 rounded-pill border-2 border-line py-2.5 text-[13px] font-bold text-ink hover:border-trust hover:text-trust"
            >
              Đặt lại
            </button>
            <button
              type="button"
              onClick={applyDraft}
              className="flex-1 rounded-pill bg-cta py-2.5 text-[13px] font-bold text-white shadow-cta transition-opacity hover:opacity-90"
            >
              Áp dụng ({draftCount})
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
