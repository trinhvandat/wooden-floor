import { ProductFilters } from "@/components/ProductFilters";
import { BottomActionBar } from "@/components/site/BottomActionBar";

export const metadata = {
  title: "Sản phẩm — FUKIONE",
  description: "Xem toàn bộ sàn gỗ FUKIONE. Lọc theo màu sắc, độ dày, chống nước, phòng và giá.",
};

export default function CatalogPage() {
  return (
    <>
      <ProductFilters />
      <BottomActionBar primaryLabel="Tính chi phí" primaryHref="/bao-gia" />
    </>
  );
}
