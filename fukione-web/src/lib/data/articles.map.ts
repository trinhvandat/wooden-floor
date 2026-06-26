import type { Article, ArticleSummary, RichTextContent } from "@/lib/types";

interface MediaRef {
  id: number | string;
  url?: string | null;
  alt?: string | null;
}

export interface ArticleSummaryDoc {
  id: number | string;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: number | string | MediaRef | null;
  tags?: (string | null)[] | null;
  publishedAt?: string | null;
}

export interface ArticleDoc extends ArticleSummaryDoc {
  body?: RichTextContent | null;
  seoMeta?: { title?: string | null; description?: string | null } | null;
}

function mapCover(cover: ArticleSummaryDoc["coverImage"]): { url: string; alt: string } | null {
  if (cover && typeof cover === "object" && "url" in cover && cover.url) {
    return { url: cover.url, alt: cover.alt ?? "" };
  }
  return null;
}

const EMPTY_BODY: RichTextContent = {
  root: { type: "root", children: [], direction: "ltr", format: "", indent: 0, version: 1 },
};

export function mapArticleSummary(doc: ArticleSummaryDoc): ArticleSummary {
  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt ?? "",
    coverImage: mapCover(doc.coverImage),
    publishedAt: doc.publishedAt ?? "",
    tags: (doc.tags ?? []).filter((t): t is string => typeof t === "string"),
  };
}

export function mapArticle(doc: ArticleDoc): Article {
  return {
    ...mapArticleSummary(doc),
    body: doc.body ?? EMPTY_BODY,
    seo: {
      title: doc.seoMeta?.title || doc.title,
      description: doc.seoMeta?.description || doc.excerpt || "",
    },
  };
}
