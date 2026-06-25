// Pure mappers: Payload collection docs -> frontend domain types.
// No Payload runtime import, so these unit-test without a DB.
import type { Product, Collection, Project, ProjectImage } from "@/lib/types";

export interface ProductDoc {
  id: number | string;
  slug: string;
  name: string;
  pricePerM2: number;
  thicknessMm: string; // Payload select stores '8' | '12'
  waterproof?: boolean | null;
  color?: string | null;
  surface?: string | null;
  roomTypes?: string[] | null;
  specs?: { k: string; v: string }[] | null;
  collectionRef?: number | string | { id: number | string } | null;
}

export interface CollectionDoc {
  id: number | string;
  slug: string;
  name: string;
  description?: string | null;
}

export interface MediaDoc {
  id: number | string;
  url?: string | null;
  alt?: string | null;
}

export interface ProjectDoc {
  id: number | string;
  slug: string;
  title: string;
  description?: string | null;
  location?: string | null;
  areaM2?: number | null;
  productRefs?: (number | string | { id: number | string })[] | null;
  images?: (number | string | MediaDoc)[] | null;
}

function refId(
  ref: number | string | { id: number | string } | null | undefined,
): string | null {
  if (ref == null) return null;
  return typeof ref === "object" ? String(ref.id) : String(ref);
}

export function mapProduct(doc: ProductDoc): Product {
  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    pricePerM2: doc.pricePerM2,
    thicknessMm: Number(doc.thicknessMm) === 12 ? 12 : 8,
    waterproof: Boolean(doc.waterproof),
    color: doc.color ?? "",
    surface: doc.surface ?? "",
    roomTypes: doc.roomTypes ?? [],
    images: [],
    specs: (doc.specs ?? []).map((s) => ({ k: s.k, v: s.v })),
  };
}

export function mapCollection(doc: CollectionDoc, productDocs: ProductDoc[]): Collection {
  const productIds = productDocs
    .filter((p) => refId(p.collectionRef) === String(doc.id))
    .map((p) => String(p.id));
  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    description: doc.description ?? "",
    coverImage: "",
    productIds,
  };
}

export function mapProject(doc: ProjectDoc): Project {
  const refs = doc.productRefs ?? [];
  const productIds = refs
    .map(refId)
    .filter((id): id is string => id !== null);
  const images = (doc.images ?? [])
    .map((img): ProjectImage | null =>
      typeof img === "object" && img !== null && "url" in img && img.url
        ? { url: img.url, alt: img.alt ?? "" }
        : null,
    )
    .filter((i): i is ProjectImage => i !== null);
  return {
    id: String(doc.id),
    slug: doc.slug,
    title: doc.title,
    description: doc.description ?? "",
    location: doc.location ?? "",
    areaM2: doc.areaM2 ?? 0,
    productIds,
    images,
  };
}
