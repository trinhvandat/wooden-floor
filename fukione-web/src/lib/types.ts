// Domain types for FUKIONE wooden-floor website
// Mirrors future Payload CMS collection shapes

export type Product = {
  id: string;
  slug: string;
  /** Vietnamese product name */
  name: string;
  pricePerM2: number;
  thicknessMm: 8 | 12;
  waterproof: boolean;
  /** Vietnamese color label */
  color: string;
  /** Vietnamese surface finish label */
  surface: string;
  roomTypes: string[];
  images: string[];
  specs: { k: string; v: string }[];
};

export type Collection = {
  id: string;
  slug: string;
  /** Vietnamese collection name */
  name: string;
  description: string;
  coverImage: string;
  productIds: string[];
};

export type ProjectImage = { url: string; alt: string };

export type Project = {
  id: string;
  slug: string;
  /** Vietnamese project title */
  title: string;
  description: string;
  location: string;
  areaM2: number;
  productIds: string[];
  images: ProjectImage[];
};

export type Article = {
  id: string;
  slug: string;
  /** Vietnamese article title */
  title: string;
  summary: string;
  coverImage: string;
  publishedAt: string;
  body: string;
};

export type Settings = {
  installPricePerM2: number;
  trimEstimate: number;
  nap: { name: string; address: string; phone: string };
  hours: string;
  zaloUrl: string;
  showroomAddress: string;
  mapEmbed: string;
};
