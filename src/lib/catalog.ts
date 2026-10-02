import { catalogEntries } from "@/lib/catalog-data.generated";

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  mrp?: number;
  badge?: "NEW" | "BESTSELLER";
  rating: number;
  reviews: number;
  image: string;
  altImage: string;
  images: readonly string[];
};

export const products: Product[] = catalogEntries.map((entry, i) => ({
  id: `p${i + 1}`,
  slug: entry.slug,
  sku: entry.sku,
  name: entry.name,
  category: entry.category,
  price: entry.price,
  mrp: entry.mrp,
  badge: entry.badge,
  rating: entry.rating,
  reviews: entry.reviews,
  image: entry.images[0] ?? "/catalog/57165/1.png",
  altImage: entry.images[1] ?? entry.images[0] ?? "/catalog/57165/1.png",
  images: entry.images,
}));

const pick = (sku: string, n = 1) => {
  const entry = catalogEntries.find((e) => e.sku === sku);
  return entry?.images[n - 1] ?? entry?.images[0] ?? products[0]?.image ?? "";
};

export const media = {
  heroImage: pick("57165", 1),
  categoriesImage: pick("57165-1", 1),
  campaignImage: pick("53655", 1),
  lookImage: pick("04", 1),
  storyImage: pick("54155", 2),
};

/** Frames for scroll-scrub hero when no hero video is uploaded yet. */
export const heroScrollFrames: string[] = [
  pick("57165", 1),
  pick("57165", 2),
  pick("57165", 3),
  pick("57165", 4),
  pick("57165-1", 1),
  pick("57165-1", 2),
  pick("53655", 1),
  pick("04", 1),
].filter(Boolean);

/** Every catalog photo for grids, social, and editorial sections. */
export const allCatalogImages: string[] = catalogEntries.flatMap((e) => [...e.images]);

export const galleryImages: string[] = allCatalogImages.slice(0, 24);

export function categoryHeroImage(category: string): string {
  const match = products.find((p) => p.category === category);
  return match?.image ?? media.categoriesImage;
}

export const categoryNames = [
  "Necklaces",
  "Earrings",
  "Bracelets",
  "Rings",
  "Jewellery Sets",
  "New Arrivals",
] as const;

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    price,
  );
