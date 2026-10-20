import type { Product } from "@/lib/catalog";
import { categoryNames } from "@/lib/catalog";

const CANONICAL_BY_SLUG: Record<string, string> = {
  necklaces: "Necklaces",
  necklace: "Necklaces",
  earrings: "Earrings",
  earring: "Earrings",
  bracelets: "Bracelets",
  bracelet: "Bracelets",
  bangles: "Bracelets",
  bangle: "Bracelets",
  rings: "Rings",
  ring: "Rings",
  "jewellery-sets": "Jewellery Sets",
  "jewelry-sets": "Jewellery Sets",
  sets: "Jewellery Sets",
};

/** Stable slug for URLs and filter matching (e.g. "Necklaces" → "necklaces"). */
export function categoryToSlug(category: string): string {
  const raw = category.trim().toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-");
  const singular = raw.replace(/s$/, "");
  const canonical = CANONICAL_BY_SLUG[raw] ?? CANONICAL_BY_SLUG[singular];
  if (canonical) return canonical.toLowerCase().replace(/\s+/g, "-");
  return raw;
}

/** Storefront label for a product/API category string. */
export function displayCategoryLabel(category: string): string {
  const trimmed = category.trim();
  if (!trimmed) return "Necklaces";
  const slug = categoryToSlug(trimmed);
  return CANONICAL_BY_SLUG[slug] ?? trimmed.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function productMatchesCategorySlug(product: Product, slug: string): boolean {
  const want = slug.trim().toLowerCase();
  return categoryToSlug(product.category) === want;
}

export function productMatchesCategoryLabels(product: Product, labels: string[]): boolean {
  if (!labels.length) return true;
  const productSlug = categoryToSlug(product.category);
  return labels.some((label) => categoryToSlug(label) === productSlug);
}

export type ShopCategoryOption = { name: string; count: number };

/** Categories for shop filters, ordered like the homepage. */
export function shopCategoryOptions(products: Product[]): ShopCategoryOption[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const name = displayCategoryLabel(p.category);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const preferred = categoryNames.filter((n) => n !== "New Arrivals");
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const name of preferred) {
    if ((counts.get(name) ?? 0) > 0) {
      ordered.push(name);
      seen.add(name);
    }
  }
  for (const name of [...counts.keys()].sort((a, b) => a.localeCompare(b))) {
    if (!seen.has(name) && (counts.get(name) ?? 0) > 0) ordered.push(name);
  }

  return ordered.map((name) => ({ name, count: counts.get(name) ?? 0 }));
}

export function categoriesFromProducts(list: Product[]): string[] {
  return shopCategoryOptions(list).map((o) => o.name);
}

/** Resolve URL/search slug to a display label if we have products in that category. */
export function categoryLabelFromSlug(slug: string, products: Product[]): string | null {
  const want = slug.trim().toLowerCase();
  const match = shopCategoryOptions(products).find((o) => categoryToSlug(o.name) === want);
  if (match) return match.name;
  const fromCanonical = CANONICAL_BY_SLUG[want];
  if (fromCanonical && products.some((p) => categoryToSlug(p.category) === want)) return fromCanonical;
  return null;
}
