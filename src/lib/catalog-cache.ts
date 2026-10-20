import type { Product } from "@/lib/catalog";

const CACHE_KEY = "twinklingz-public-products-v1";
const MAX_AGE_MS = 30 * 60_000;

export function readCatalogCache(): Product[] | undefined {
  if (typeof sessionStorage === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { at: number; products: Product[] };
    if (!parsed.products?.length || Date.now() - parsed.at > MAX_AGE_MS) return undefined;
    return parsed.products;
  } catch {
    return undefined;
  }
}

export function writeCatalogCache(products: Product[]) {
  if (typeof sessionStorage === "undefined" || !products.length) return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), products }));
  } catch {
    /* quota */
  }
}
