import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <Link
      href={`/tin-tuc/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,.1)]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-wood-soft to-wood">
        {article.coverImage && (
          <Image
            src={article.coverImage.url}
            alt={article.coverImage.alt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
      </div>
      <div className="flex flex-col gap-1.5 p-4">
        {article.publishedAt && (
          <p className="text-[12px] font-semibold text-muted">{formatDate(article.publishedAt)}</p>
        )}
        <p className="line-clamp-2 text-[15px] font-extrabold leading-snug text-ink">
          {article.title}
        </p>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted">{article.excerpt}</p>
        {article.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {article.tags.map((t) => (
              <span key={t} className="rounded-pill bg-field px-2 py-0.5 text-[11px] font-semibold text-muted">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
