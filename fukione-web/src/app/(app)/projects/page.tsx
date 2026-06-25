import { getProjects } from "@/lib/data/catalog";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 3600;

export const metadata = {
  title: "Dự án",
  description: "Công trình sàn gỗ FUKIONE đã hoàn thiện tại Hà Nội và lân cận.",
  alternates: { canonical: "/du-an" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="bg-bg px-4 pb-12 pt-6">
      <JsonLd
        data={buildBreadcrumbJsonLd(
          [
            { name: "Trang chủ", path: "/" },
            { name: "Dự án", path: "/du-an" },
          ],
          SITE_URL,
        )}
      />
      <div className="mx-auto w-full max-w-[1180px]">
        <SectionHeading withUnderline>Dự án thực tế</SectionHeading>
        {projects.length === 0 ? (
          <p className="mt-8 text-[14px] text-muted">
            Các công trình tiêu biểu sẽ sớm được cập nhật.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
