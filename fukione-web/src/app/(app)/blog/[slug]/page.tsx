import { notFound } from "next/navigation";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getArticles, getArticleBySlug } from "@/lib/data/articles";
import { getSettings } from "@/lib/data/settings";
import { formatDate } from "@/lib/format";
import { LeadCtaSection } from "@/components/site/LeadCtaSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL, BASE_OPEN_GRAPH } from "@/lib/seo/site";

type PageParams = Promise<{ slug: string }>;

export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.seo.title,
    description: article.seo.description,
    alternates: { canonical: `/tin-tuc/${article.slug}` },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: `${article.seo.title} — FUKIONE`,
      description: article.seo.description,
      ...(article.coverImage ? { images: [{ url: article.coverImage.url, alt: article.coverImage.alt }] } : {}),
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const settings = await getSettings();

  return (
    <div className="bg-bg px-4 pb-12 pt-6">
      <JsonLd
        data={buildArticleJsonLd(
          {
            title: article.title,
            excerpt: article.excerpt,
            slug: article.slug,
            publishedAt: article.publishedAt,
            image: article.coverImage?.url,
          },
          SITE_URL,
        )}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Tin tức", path: "/tin-tuc" },
            { name: article.title, path: `/tin-tuc/${article.slug}` },
          ],
          SITE_URL,
        )}
      />
      <article className="mx-auto flex w-full max-w-[760px] flex-col gap-6">
        <header className="flex flex-col gap-3">
          {article.publishedAt && (
            <p className="text-[12.5px] font-semibold text-muted">{formatDate(article.publishedAt)}</p>
          )}
          <h1 className="font-display text-[26px] font-extrabold leading-tight text-ink">
            {article.title}
          </h1>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((t) => (
                <span key={t} className="rounded-pill bg-field px-2.5 py-1 text-[11.5px] font-semibold text-muted">
                  {t}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-card bg-gradient-to-br from-wood-soft to-wood">
          {article.coverImage && (
            <Image
              src={article.coverImage.url}
              alt={article.coverImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 760px) 100vw, 760px"
              priority
            />
          )}
        </div>

        {/* Lexical body — rendered to JSX by Payload's RichText (no dangerouslySetInnerHTML).
            Typography via Tailwind arbitrary-variant selectors (no @tailwindcss/typography). */}
        <RichText
          data={article.body}
          className="space-y-4 text-[15px] leading-relaxed text-ink [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-[19px] [&_h2]:font-extrabold [&_h2]:text-ink [&_h3]:mt-4 [&_h3]:text-[16px] [&_h3]:font-bold [&_p]:text-muted [&_a]:text-trust [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold [&_strong]:text-ink"
        />

        <LeadCtaSection
          settings={settings}
          title="Cần tư vấn cho không gian của bạn?"
          body="Để lại thông tin — FUKIONE sẽ tư vấn và báo giá miễn phí."
        />
      </article>
    </div>
  );
}
