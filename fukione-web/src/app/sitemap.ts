import type { MetadataRoute } from "next";
import { getProducts, getProjects } from "@/lib/data/catalog";
import { absoluteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/san-pham", "/bao-gia", "/dat-lich-khao-sat", "/du-an", "/gioi-thieu"];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: absoluteUrl(p),
    changeFrequency: "weekly",
    priority: p === "/" ? 1 : 0.8,
  }));

  const products = await getProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: absoluteUrl(`/san-pham/${p.slug}`),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const projects = await getProjects();
  const projectEntries: MetadataRoute.Sitemap = projects.map((p) => ({
    url: absoluteUrl(`/du-an/${p.slug}`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...productEntries, ...projectEntries];
}
