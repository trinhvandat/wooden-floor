"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BypassConsult } from "@/components/site/BypassConsult";
import { FieldError } from "@/components/site/FieldError";
import { formatVnd } from "@/lib/format";
import { quoteFormSchema, collectFieldErrors, validateField } from "@/lib/leads/forms";
import type { Settings } from "@/lib/types";

export interface LeadContext {
  productId?: string;
  productName: string;
  areaM2: number;
  total: number;
}

interface LeadFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: LeadContext;
  settings: Settings;
}

export function LeadFormSheet({
  open,
  onOpenChange,
  context,
  settings,
}: LeadFormSheetProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset transient state when the sheet closes so reopening shows a clean slate.
  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setLoading(false);
      setError(null);
      setErrors({});
    }
    onOpenChange(nextOpen);
  }

  // Validate one field on blur and merge/clear its inline error.
  function handleBlur(field: "name" | "phone" | "email", value: string) {
    const message = validateField(quoteFormSchema.shape[field], value);
    setErrors((prev) => ({ ...prev, [field]: message ?? "" }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const website = String(new FormData(e.currentTarget).get("website") ?? "");

    // Inline Zod validation — block submit and surface per-field errors.
    const parsed = quoteFormSchema.safeParse({ name, phone, email });
    if (!parsed.success) {
      setErrors(collectFieldErrors(parsed.error));
      return;
    }
    setErrors({});

    setLoading(true);
    setError(null);
    try {
      const productLine = context ? `Sản phẩm quan tâm: ${context.productName}` : "";
      const composedMessage = [productLine, note].filter(Boolean).join("\n");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: context ? "calculator" : "quote",
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email,
          message: composedMessage,
          productId: context?.productId,
          area: context?.areaM2,
          estimatedCost: context?.total,
          website,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error ?? "Gửi không thành công, vui lòng thử lại.");
      }
      router.push("/cam-on");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra, vui lòng thử lại.");
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={true}
        className="rounded-t-[22px] shadow-sheet px-0 pb-8"
      >
        <SheetHeader className="border-b border-line px-5 pb-4">
          {/* Soft amber step badge */}
          <span className="mb-1 inline-flex w-fit items-center rounded-pill bg-cta-soft-from px-3 py-0.5 text-[11px] font-bold text-cta-ink">
            Bước cuối
          </span>

          <SheetTitle className="text-[18px] font-extrabold text-ink">
            Nhận báo giá chính xác
          </SheetTitle>
          <SheetDescription className="text-[13px] text-muted">
            Sale FUKIONE sẽ gọi lại trong ~15 phút
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4">
          {/* Tên */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lf-name" className="text-[12.5px] font-bold text-ink">
              Họ tên <span className="text-cta-ink">*</span>
            </Label>
            <Input
              id="lf-name"
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={(e) => handleBlur("name", e.target.value)}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "lf-name-error" : undefined}
              className="rounded-input border-line bg-field text-ink placeholder:text-muted/60 focus-visible:border-trust focus-visible:ring-trust/20 aria-[invalid=true]:border-red-500"
            />
            <FieldError id="lf-name-error" message={errors.name} />
          </div>

          {/* SĐT */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lf-phone" className="text-[12.5px] font-bold text-ink">
              Số điện thoại <span className="text-cta-ink">*</span>
            </Label>
            <Input
              id="lf-phone"
              type="tel"
              inputMode="tel"
              placeholder="0900 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={(e) => handleBlur("phone", e.target.value)}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "lf-phone-error" : undefined}
              className="rounded-input border-line bg-field text-ink placeholder:text-muted/60 focus-visible:border-trust focus-visible:ring-trust/20 aria-[invalid=true]:border-red-500"
            />
            <FieldError id="lf-phone-error" message={errors.phone} />
          </div>

          {/* Email (optional) */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lf-email" className="text-[12.5px] font-bold text-ink">
              Email{" "}
              <span className="font-normal text-muted">(không bắt buộc)</span>
            </Label>
            <Input
              id="lf-email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => handleBlur("email", e.target.value)}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "lf-email-error" : undefined}
              className="rounded-input border-line bg-field text-ink placeholder:text-muted/60 focus-visible:border-trust focus-visible:ring-trust/20 aria-[invalid=true]:border-red-500"
            />
            <FieldError id="lf-email-error" message={errors.email} />
          </div>

          {/* Ghi chú */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lf-note" className="text-[12.5px] font-bold text-ink">
              Ghi chú{" "}
              <span className="font-normal text-muted">(không bắt buộc)</span>
            </Label>
            <textarea
              id="lf-note"
              rows={2}
              placeholder="Thông tin thêm về yêu cầu của bạn..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full resize-none rounded-input border border-line bg-field px-2.5 py-2 text-sm text-ink outline-none placeholder:text-muted/60 focus-visible:border-trust focus-visible:ring-2 focus-visible:ring-trust/20"
            />
          </div>

          {/* Context block — teal "đã đính kèm" */}
          {context && (
            <div className="flex items-start gap-2 rounded-[10px] border border-trust-soft-border bg-trust-soft px-3 py-2.5 text-[12.5px] text-trust">
              <span className="shrink-0">📎</span>
              <span>
                <span className="font-bold">Đã đính kèm:</span>{" "}
                {context.productName} · {context.areaM2}m² ·{" "}
                <span className="font-bold">{formatVnd(context.total)}</span>
              </span>
            </div>
          )}

          {/* Honeypot (anti-spam) */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            autoComplete="off"
          />

          <SheetFooter className="mt-2 flex flex-col gap-3 p-0">
            {error && (
              <p className="text-[12.5px] font-semibold text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-pill bg-cta text-sm font-bold text-ink shadow-cta transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
            <BypassConsult settings={settings} />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
