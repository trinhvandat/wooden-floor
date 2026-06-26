import { getArticles } from "@/lib/data/articles";
import { ArticleCard } from "@/components/site/ArticleCard";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 3600;

export const metadata = {
  title: "Tin tức",
  description: "Kinh nghiệm chọn, thi công và bảo dưỡng sàn gỗ từ FUKIONE.",
  alternates: { canonical: "/tin-tuc" },
};

export default async function BlogPage() {
  const articles = await getArticles();
  return (
    <div className="bg-bg px-4 pb-12 pt-6">
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Tin tức", path: "/tin-tuc" },
          ],
          SITE_URL,
        )}
      />
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeading as="h1" withUnderline>Tin tức</SectionHeading>
        {articles.length === 0 ? (
          <p className="mt-8 text-[14px] text-muted">Bài viết sẽ sớm được cập nhật.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
