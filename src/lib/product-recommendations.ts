import type { Product } from "@/lib/catalog";

function isOther(p: Product, current: Product) {
  return p.slug !== current.slug && p.id !== current.id;
}

/** Same category, closest price first. */
export function similarProducts(catalog: Product[], current: Product, limit = 4): Product[] {
  return catalog
    .filter((p) => isOther(p, current) && p.category === current.category)
    .sort((a, b) => Math.abs(a.price - current.price) - Math.abs(b.price - current.price))
    .slice(0, limit);
}

/** Cross-category and trending picks; avoids duplicating similar section. */
export function peopleAlsoSee(
  catalog: Product[],
  current: Product,
  excludeSlugs: string[],
  limit = 4,
): Product[] {
  const exclude = new Set([current.slug, ...excludeSlugs]);
  const score = (p: Product) => {
    let s = 0;
    if (p.badge === "BESTSELLER") s += 3;
    if (p.badge === "NEW") s += 2;
    if (p.category !== current.category) s += 2;
    return s;
  };

  return catalog
    .filter((p) => !exclude.has(p.slug))
    .sort((a, b) => score(b) - score(a) || b.reviews - a.reviews)
    .slice(0, limit);
}
