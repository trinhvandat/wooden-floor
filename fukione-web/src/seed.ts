import { getPayload } from "payload";
import config from "../payload.config";
import { PRODUCTS, COLLECTIONS, PROJECTS } from "./lib/mock-data";

// Idempotent: every entity is upserted by its unique `slug`, so re-running
// never creates duplicates. Order matters for relationships:
// collections -> products (collectionRef) -> projects (productRefs).
async function seed() {
  const payload = await getPayload({ config });

  // 1. Collections
  const collectionIdBySlug = new Map<string, number | string>();
  for (const c of COLLECTIONS) {
    const data = { name: c.name, slug: c.slug, description: c.description };
    const existing = await payload.find({
      collection: "collections",
      where: { slug: { equals: c.slug } },
      limit: 1,
    });
    const id = existing.docs.length
      ? (await payload.update({ collection: "collections", id: existing.docs[0].id, data })).id
      : (await payload.create({ collection: "collections", data })).id;
    collectionIdBySlug.set(c.slug, id);
  }

  // Invert the collection->productIds mock relation into product mock-id -> collection slug.
  const collectionSlugByProductMockId = new Map<string, string>();
  for (const c of COLLECTIONS) {
    for (const pid of c.productIds) collectionSlugByProductMockId.set(pid, c.slug);
  }

  // 2. Products
  const productIdByMockId = new Map<string, number | string>();
  for (const p of PRODUCTS) {
    const colSlug = collectionSlugByProductMockId.get(p.id);
    const collectionRef = colSlug ? collectionIdBySlug.get(colSlug) : undefined;
    const data = {
      name: p.name,
      slug: p.slug,
      pricePerM2: p.pricePerM2,
      thicknessMm: String(p.thicknessMm), // select expects '8' | '12'
      waterproof: p.waterproof,
      color: p.color,
      surface: p.surface,
      roomTypes: p.roomTypes,
      specs: p.specs,
      status: "published",
      ...(collectionRef ? { collectionRef } : {}),
    };
    const existing = await payload.find({
      collection: "products",
      where: { slug: { equals: p.slug } },
      limit: 1,
    });
    const id = existing.docs.length
      ? (await payload.update({ collection: "products", id: existing.docs[0].id, data })).id
      : (await payload.create({ collection: "products", data })).id;
    productIdByMockId.set(p.id, id);
  }

  // 3. Projects
  for (const j of PROJECTS) {
    const productRef = productIdByMockId.get(j.productId);
    const data = {
      title: j.title,
      slug: j.slug,
      location: j.location,
      areaM2: j.areaM2,
      ...(productRef ? { productRefs: [productRef] } : {}),
    };
    const existing = await payload.find({
      collection: "projects",
      where: { slug: { equals: j.slug } },
      limit: 1,
    });
    if (existing.docs.length) {
      await payload.update({ collection: "projects", id: existing.docs[0].id, data });
    } else {
      await payload.create({ collection: "projects", data });
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${COLLECTIONS.length} collections, ${PRODUCTS.length} products, ${PROJECTS.length} projects.`,
  );
  process.exit(0);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", err);
  process.exit(1);
});
