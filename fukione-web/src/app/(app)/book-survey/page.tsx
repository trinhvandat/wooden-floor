import { SurveyForm } from "@/components/SurveyForm";

export const metadata = {
  title: "Đặt lịch khảo sát",
  description:
    "Đặt lịch khảo sát miễn phí tại nhà — đo thực tế, tư vấn sàn gỗ phù hợp, báo giá trọn gói trong ngày.",
  alternates: { canonical: "/dat-lich-khao-sat" },
};

export default function DatLichKhaoSatPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 bg-bg px-4 pt-6">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-ink">
          Đặt lịch khảo sát
        </h1>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Chuyên gia đến tận nơi đo đạc &amp; tư vấn.
          <br />
          Miễn phí, không ràng buộc.
        </p>
      </div>

      <SurveyForm />
    </div>
  );
}
