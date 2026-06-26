import { getPayload } from "payload";
import config from "@payload-config";
import type { Article, ArticleSummary } from "@/lib/types";
import {
  mapArticleSummary,
  mapArticle,
  type ArticleSummaryDoc,
  type ArticleDoc,
} from "./articles.map";

const PUBLISHED = { status: { equals: "published" } } as const;

export async function getArticles(): Promise<ArticleSummary[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "articles",
    where: PUBLISHED,
    sort: "-publishedAt",
    limit: 100,
    depth: 1,
  });
  return (res.docs as unknown as ArticleSummaryDoc[]).map(mapArticleSummary);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "articles",
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  });
  const doc = res.docs[0] as unknown as ArticleDoc | undefined;
  return doc ? mapArticle(doc) : null;
}
