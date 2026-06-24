import { CalculatorWidget } from "@/components/CalculatorWidget";
import { getProducts } from "@/lib/data/catalog";

export const revalidate = 3600;

export const metadata = {
  title: "Tính chi phí sàn gỗ",
  description:
    "Tính nhanh chi phí sàn gỗ theo diện tích — vật liệu, lắp đặt, phào nẹp. Nhận báo giá trong ngày.",
  alternates: { canonical: "/bao-gia" },
};

export default async function BaoGiaPage() {
  const products = await getProducts();
  return (
    <div className="flex flex-col gap-6 bg-bg px-4 pt-6 max-w-xl mx-auto">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-[-0.4px] text-ink">
          Tính chi phí sàn gỗ
        </h1>
        <p className="text-[13.5px] leading-relaxed text-muted">
          Nhập diện tích và chọn sản phẩm — tạm tính ngay lập tức.
          <br />
          Báo giá chính xác sau khi khảo sát thực tế.
        </p>
      </div>

      <CalculatorWidget variant="page" products={products} />
    </div>
  );
}
