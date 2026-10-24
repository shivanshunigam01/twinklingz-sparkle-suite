type CategorisedProduct = { category: string };

/** Primary catalogue categories (admin + shop filters + collections). */
export const STOREFRONT_CATEGORIES = [
  "Necklaces",
  "Earrings",
  "Bracelets",
  "Rings",
  "Jewellery Sets",
  "Traditional Wear",
] as const;

/** Homepage “Shop by category” row (includes editorial New Arrivals). */
export const categoryNames = [...STOREFRONT_CATEGORIES, "New Arrivals"] as const;

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
  "traditional-wear": "Traditional Wear",
  traditional: "Traditional Wear",
  "traditional-wears": "Traditional Wear",
  "traditional-wear-jewellery": "Traditional Wear",
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

export function productMatchesCategorySlug(product: CategorisedProduct, slug: string): boolean {
  const want = slug.trim().toLowerCase();
  return categoryToSlug(product.category) === want;
}

export function productMatchesCategoryLabels(product: CategorisedProduct, labels: string[]): boolean {
  if (!labels.length) return true;
  const productSlug = categoryToSlug(product.category);
  return labels.some((label) => categoryToSlug(label) === productSlug);
}

export type ShopCategoryOption = { name: string; count: number };

/** Categories for shop filters, ordered like the homepage. */
export function shopCategoryOptions(products: CategorisedProduct[]): ShopCategoryOption[] {
  const counts = new Map<string, number>();
  for (const p of products) {
    const name = displayCategoryLabel(p.category);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const preferred = [...STOREFRONT_CATEGORIES];
  const seen = new Set<string>();
  const ordered: string[] = [];

  for (const name of preferred) {
    ordered.push(name);
    seen.add(name);
  }
  for (const name of [...counts.keys()].sort((a, b) => a.localeCompare(b))) {
    if (!seen.has(name)) ordered.push(name);
  }

  return ordered.map((name) => ({ name, count: counts.get(name) ?? 0 }));
}

/** Collection page title from URL slug (e.g. traditional-wear → Traditional Wear). */
export function collectionTitleFromSlug(slug: string): string {
  const key = slug.trim().toLowerCase();
  return CANONICAL_BY_SLUG[key] ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function categoriesFromProducts(list: CategorisedProduct[]): string[] {
  return shopCategoryOptions(list).map((o) => o.name);
}

/** Resolve URL/search slug to a display label if we have products in that category. */
export function categoryLabelFromSlug(slug: string, products: CategorisedProduct[]): string | null {
  const want = slug.trim().toLowerCase();
  const match = shopCategoryOptions(products).find((o) => categoryToSlug(o.name) === want);
  if (match) return match.name;
  const fromCanonical = CANONICAL_BY_SLUG[want];
  if (fromCanonical && products.some((p) => categoryToSlug(p.category) === want)) return fromCanonical;
  return null;
}
