"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BypassConsult } from "@/components/site/BypassConsult";
import type { Settings } from "@/lib/types";

const TIME_SLOTS = ["Sáng (8:00–12:00)", "Chiều (13:00–18:00)"] as const;

const SURVEY_INCLUDES = [
  {
    icon: "📐",
    title: "Đo đạc & tư vấn chọn sàn",
    desc: "Chuyên gia đến tận nơi đo thực tế và tư vấn sản phẩm phù hợp.",
  },
  {
    icon: "💰",
    title: "Báo giá trọn gói, minh bạch",
    desc: "Vật liệu + lắp đặt + phào nẹp — không phát sinh chi phí ẩn.",
  },
  {
    icon: "🤝",
    title: "Hoàn toàn miễn phí",
    desc: "Khảo sát và tư vấn không mất phí, không ràng buộc.",
  },
] as const;

export function SurveyForm({ settings }: { settings: Settings }) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "survey",
          name,
          phone,
          address,
          preferredTime: timeSlot,
          message: note,
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
    <div className="flex flex-col gap-6">
      {/* ── "Khảo sát gồm gì?" reassurance ─────────────── */}
      <div className="rounded-card border border-trust-soft-border bg-trust-soft px-4 py-4">
        <p className="mb-3 text-[13px] font-extrabold text-ink">
          Khảo sát gồm gì?
        </p>
        <div className="flex flex-col gap-3">
          {SURVEY_INCLUDES.map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="mt-0.5 shrink-0 text-xl leading-none">
                {item.icon}
              </span>
              <div>
                <p className="text-[12.5px] font-bold text-ink">{item.title}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Booking form ─────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Tên */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sf-name" className="text-[12.5px] font-bold text-ink">
            Họ tên <span className="text-cta-ink">*</span>
          </Label>
          <Input
            id="sf-name"
            type="text"
            required
            placeholder="Nguyễn Văn A"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onInvalid={(e) => e.currentTarget.setCustomValidity("Vui lòng điền thông tin này")}
            onInput={(e) => e.currentTarget.setCustomValidity("")}
            className="rounded-input border-line bg-field text-ink placeholder:text-muted/60 focus-visible:border-trust focus-visible:ring-trust/20"
          />
        </div>

        {/* SĐT */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="sf-phone"
            className="text-[12.5px] font-bold text-ink"
          >
            Số điện thoại <span className="text-cta-ink">*</span>
          </Label>
          <Input
            id="sf-phone"
            type="tel"
            required
            placeholder="0900 000 000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onInvalid={(e) => e.currentTarget.setCustomValidity("Vui lòng điền thông tin này")}
            onInput={(e) => e.currentTarget.setCustomValidity("")}
            className="rounded-input border-line bg-field text-ink placeholder:text-muted/60 focus-visible:border-trust focus-visible:ring-trust/20"
          />
        </div>

        {/* Địa chỉ */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="sf-address"
            className="text-[12.5px] font-bold text-ink"
          >
            Địa chỉ khảo sát <span className="text-cta-ink">*</span>
          </Label>
          <Input
            id="sf-address"
            type="text"
            required
            placeholder="Số nhà, đường, quận/huyện, thành phố"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onInvalid={(e) => e.currentTarget.setCustomValidity("Vui lòng điền thông tin này")}
            onInput={(e) => e.currentTarget.setCustomValidity("")}
            className="rounded-input border-line bg-field text-ink placeholder:text-muted/60 focus-visible:border-trust focus-visible:ring-trust/20"
          />
        </div>

        {/* Khung giờ */}
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="sf-time"
            className="text-[12.5px] font-bold text-ink"
          >
            Khung giờ mong muốn
          </Label>
          <select
            id="sf-time"
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="h-10 w-full rounded-input border border-line bg-field px-2.5 text-sm text-ink outline-none focus:border-trust focus:ring-2 focus:ring-trust/20"
          >
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </div>

        {/* Ghi chú */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sf-note" className="text-[12.5px] font-bold text-ink">
            Ghi chú{" "}
            <span className="font-normal text-muted">(không bắt buộc)</span>
          </Label>
          <textarea
            id="sf-note"
            rows={2}
            placeholder="Yêu cầu hoặc lưu ý thêm..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full resize-none rounded-input border border-line bg-field px-2.5 py-2 text-sm text-ink outline-none placeholder:text-muted/60 focus-visible:border-trust focus-visible:ring-2 focus-visible:ring-trust/20"
          />
        </div>

        {/* Honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
          autoComplete="off"
        />

        {error && (
          <p className="text-[12.5px] font-semibold text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-pill bg-cta text-sm font-bold text-ink shadow-cta transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-60"
        >
          {loading ? "Đang gửi..." : "Đặt lịch khảo sát"}
        </button>

        <BypassConsult settings={settings} />
      </form>
    </div>
  );
}
