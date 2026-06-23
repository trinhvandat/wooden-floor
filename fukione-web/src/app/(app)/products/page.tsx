import { ProductFilters } from "@/components/ProductFilters";
import { BottomActionBar } from "@/components/site/BottomActionBar";
import { getProducts } from "@/lib/data/catalog";

export const revalidate = 3600;

export const metadata = {
  title: "Sản phẩm — FUKIONE",
  description: "Xem toàn bộ sàn gỗ FUKIONE. Lọc theo màu sắc, độ dày, chống nước, phòng và giá.",
};

export default async function CatalogPage() {
  const products = await getProducts();
  return (
    <>
      <ProductFilters products={products} />
      <BottomActionBar primaryLabel="Tính chi phí" primaryHref="/bao-gia" />
    </>
  );
}
