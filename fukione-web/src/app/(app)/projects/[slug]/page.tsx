import { notFound } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { getProjects, getProjectBySlug, getProducts } from "@/lib/data/catalog";
import { ProductCard } from "@/components/ProductCard";
import { SpecChip } from "@/components/SpecChip";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL, BASE_OPEN_GRAPH } from "@/lib/seo/site";
import { getSettings } from "@/lib/data/settings";
import { ProjectQuoteCta } from "@/components/site/ProjectQuoteCta";
import { BottomActionBar } from "@/components/site/BottomActionBar";

// Next.js 16: params is a Promise
type PageParams = Promise<{ slug: string }>;

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: PageParams }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  const description =
    project.description || `Công trình sàn gỗ FUKIONE tại ${project.location || "Hà Nội"}.`;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/du-an/${project.slug}` },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: `${project.title} — FUKIONE`,
      description,
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: PageParams }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [all, settings] = await Promise.all([getProducts(), getSettings()]);
  const usedProducts: Product[] = all.filter((p) => project.productIds.includes(p.id));

  return (
    <div className="bg-bg px-4 pb-12 pt-6">
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Dự án", path: "/du-an" },
            { name: project.title, path: `/du-an/${project.slug}` },
          ],
          SITE_URL,
        )}
      />
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6">
        {/* Header */}
        <section>
          <h1 className="font-display text-[22px] font-extrabold leading-tight text-ink">
            {project.title}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.location && <SpecChip>{project.location}</SpecChip>}
            {project.areaM2 > 0 && <SpecChip>{project.areaM2}m²</SpecChip>}
          </div>
          {project.description && (
            <p className="mt-4 text-[14px] leading-relaxed text-muted">{project.description}</p>
          )}
        </section>

        {/* Gallery — real photos, or a single gradient placeholder */}
        <section>
          {project.images.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {project.images.map((img, i) => (
                <div
                  key={img.url}
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-gradient-to-br from-wood-soft to-wood"
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    priority={i === 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="aspect-[16/9] w-full overflow-hidden rounded-card bg-gradient-to-br from-wood-soft to-wood" />
          )}
        </section>

        {/* Products used — cross-link back into the catalog */}
        {usedProducts.length > 0 && (
          <section>
            <SectionHeading withUnderline>Sản phẩm trong dự án</SectionHeading>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {usedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
        <ProjectQuoteCta settings={settings} />
      </div>
      <BottomActionBar primaryLabel="Nhận báo giá" primaryHref="#nhan-bao-gia" />
    </div>
  );
}
