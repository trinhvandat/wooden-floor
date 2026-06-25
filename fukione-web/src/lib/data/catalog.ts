import { getPayload } from "payload";
import config from "@payload-config";
import type { Product, Collection, Project } from "@/lib/types";
import {
  mapProduct,
  mapCollection,
  mapProject,
  type ProductDoc,
  type CollectionDoc,
  type ProjectDoc,
} from "./catalog.map";

const PUBLISHED = { status: { equals: "published" } } as const;

export async function getProducts(): Promise<Product[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "products",
    where: PUBLISHED,
    limit: 200,
    depth: 0,
  });
  return (res.docs as unknown as ProductDoc[]).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "products",
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    limit: 1,
    depth: 0,
  });
  const doc = res.docs[0] as unknown as ProductDoc | undefined;
  return doc ? mapProduct(doc) : null;
}

export async function getCollections(): Promise<Collection[]> {
  const payload = await getPayload({ config });
  const [cols, prods] = await Promise.all([
    payload.find({ collection: "collections", limit: 100, depth: 0 }),
    payload.find({ collection: "products", where: PUBLISHED, limit: 200, depth: 0 }),
  ]);
  const productDocs = prods.docs as unknown as ProductDoc[];
  return (cols.docs as unknown as CollectionDoc[]).map((c) => mapCollection(c, productDocs));
}

export async function getProjects(): Promise<Project[]> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "projects",
    where: PUBLISHED,
    limit: 100,
    depth: 1,
  });
  return (res.docs as unknown as ProjectDoc[]).map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const payload = await getPayload({ config });
  const res = await payload.find({
    collection: "projects",
    where: { and: [PUBLISHED, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  });
  const doc = res.docs[0] as unknown as ProjectDoc | undefined;
  return doc ? mapProject(doc) : null;
}
