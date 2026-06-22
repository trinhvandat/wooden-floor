import { CalculatorWidget } from "@/components/CalculatorWidget";
import { BottomActionBar } from "@/components/site/BottomActionBar";

export const metadata = {
  title: "Tính chi phí sàn gỗ | FUKIONE",
  description:
    "Tính nhanh chi phí sàn gỗ theo diện tích — vật liệu, lắp đặt, phào nẹp. Nhận báo giá trong ngày.",
};

export default function BaoGiaPage() {
  return (
    <div className="flex flex-col gap-6 bg-bg pb-24 px-4 pt-6">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-ink">
          Tính chi phí sàn gỗ
        </h1>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Nhập diện tích và chọn sản phẩm — tạm tính ngay lập tức.
          <br />
          Báo giá chính xác sau khi khảo sát thực tế.
        </p>
      </div>

      {/* ── Calculator ──────────────────────────────────── */}
      <CalculatorWidget variant="page" />

      <BottomActionBar primaryLabel="Tính chi phí" primaryHref="/bao-gia" />
    </div>
  );
}
