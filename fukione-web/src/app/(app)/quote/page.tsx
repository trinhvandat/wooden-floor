import { CalculatorWidget } from "@/components/CalculatorWidget";
import { getProducts } from "@/lib/data/catalog";
import { getSettings } from "@/lib/data/settings";

export const revalidate = 3600;

export const metadata = {
  title: "Tính chi phí sàn gỗ",
  description:
    "Tính nhanh chi phí sàn gỗ theo diện tích — vật liệu, lắp đặt, phào nẹp. Nhận báo giá trong ngày.",
  alternates: { canonical: "/bao-gia" },
};

export default async function BaoGiaPage() {
  const [products, settings] = await Promise.all([getProducts(), getSettings()]);
  return (
    <div className="bg-bg px-4 pt-6 pb-8">
      {/* Mobile: single centered column. Desktop: intro left, calculator right. */}
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 lg:grid lg:max-w-[960px] lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-12 lg:pt-6">
        <div className="flex flex-col gap-1.5 lg:gap-3 lg:self-start lg:sticky lg:top-6">
          <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-ink lg:text-[30px]">
            Tính chi phí sàn gỗ
          </h1>
          <p className="text-[13.5px] leading-relaxed text-muted lg:text-[15px]">
            Nhập diện tích và chọn sản phẩm — tạm tính ngay lập tức.
            <br />
            Báo giá chính xác sau khi khảo sát thực tế.
          </p>
        </div>

        <CalculatorWidget variant="page" products={products} settings={settings} />
      </div>
    </div>
  );
}
