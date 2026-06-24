import { ProductFilters } from "@/components/ProductFilters";
import { BottomActionBar } from "@/components/site/BottomActionBar";
import { getProducts } from "@/lib/data/catalog";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 3600;

export const metadata = {
  title: "Sản phẩm",
  description: "Xem toàn bộ sàn gỗ FUKIONE. Lọc theo màu sắc, độ dày, chống nước, phòng và giá.",
  alternates: { canonical: "/san-pham" },
};

export default async function CatalogPage() {
  const products = await getProducts();
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [{ name: "Trang chủ", path: "/" }, { name: "Sản phẩm", path: "/san-pham" }],
          SITE_URL,
        )}
      />
      <ProductFilters products={products} />
      <BottomActionBar primaryLabel="Tính chi phí" primaryHref="/bao-gia" />
    </>
  );
}
