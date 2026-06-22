import { SurveyForm } from "@/components/SurveyForm";
import { BottomActionBar } from "@/components/site/BottomActionBar";

export const metadata = {
  title: "Đặt lịch khảo sát | FUKIONE",
  description:
    "Đặt lịch khảo sát miễn phí tại nhà — đo thực tế, tư vấn sàn gỗ phù hợp, báo giá trọn gói trong ngày.",
};

export default function DatLichKhaoSatPage() {
  return (
    <div className="flex flex-col gap-6 bg-bg pb-24 px-4 pt-6">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-ink">
          Đặt lịch khảo sát
        </h1>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Chuyên gia đến tận nơi đo đạc &amp; tư vấn.
          <br />
          Miễn phí, không ràng buộc.
        </p>
      </div>

      <SurveyForm />

      <BottomActionBar
        primaryLabel="Đặt lịch khảo sát"
        primaryHref="/dat-lich-khao-sat"
      />
    </div>
  );
}
