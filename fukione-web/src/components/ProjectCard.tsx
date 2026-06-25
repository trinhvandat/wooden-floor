import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const cover = project.images[0];
  return (
    <Link
      href={`/du-an/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,.1)]"
    >
      {/* Image block — wood-tone gradient placeholder when no real photo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-wood-soft to-wood">
        {cover && (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        )}
      </div>
      {/* Body */}
      <div className="flex flex-col gap-1 p-3">
        <p className="line-clamp-1 text-[14px] font-extrabold leading-snug text-ink">
          {project.title}
        </p>
        <p className="text-[12.5px] text-muted">{project.location}</p>
        {project.areaM2 > 0 && (
          <p className="text-[12.5px] font-semibold text-cta-ink">{project.areaM2}m²</p>
        )}
      </div>
    </Link>
  );
}
