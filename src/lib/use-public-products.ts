import { useQuery } from "@tanstack/react-query";
import { apiFetch, type ApiProduct } from "@/lib/api";
import { products as staticProducts, type Product } from "@/lib/catalog";
import { readCatalogCache, writeCatalogCache } from "@/lib/catalog-cache";
import { collectImageUrls, isCloudinaryUrl } from "@/lib/product-images";
import {
  categoriesFromProducts,
  categoryToSlug,
  displayCategoryLabel,
  productMatchesCategorySlug,
} from "@/lib/product-categories";

export { categoriesFromProducts, categoryToSlug, productMatchesCategorySlug };

const prefersRemoteApi = Boolean((import.meta.env.VITE_API_URL as string | undefined)?.trim());

function mapApiProduct(p: ApiProduct): Product {
  const id = p.id || p._id || p.slug;
  const images = collectImageUrls(p);
  const primary = images[0] || "";
  const secondary = images[1] || primary;
  return {
    id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    category: displayCategoryLabel(p.category),
    price: p.price,
    mrp: p.mrp,
    badge: p.badge ?? undefined,
    rating: p.rating ?? 4.8,
    reviews: p.reviews ?? 0,
    image: isCloudinaryUrl(p.image) ? p.image : primary,
    altImage: isCloudinaryUrl(p.altImage) ? p.altImage : secondary,
    images,
    inStock: p.inStock ?? true,
    featured: p.featured ?? false,
  };
}

function normalizeCatalogKey(slug: string, sku?: string) {
  const base = (sku || slug).trim().toLowerCase();
  return base.replace(/^style-/, "");
}

function mergeCatalog(apiList: ApiProduct[]): Product[] {
  const fromApi = apiList.map(mapApiProduct).filter((p) => p.images.length > 0 || p.image);
  if (fromApi.length > 0) return fromApi;
  if (prefersRemoteApi) return [];
  return staticProducts;
}

export type ProductSort = "featured" | "new" | "low" | "high" | "best";

export function sortPublicProducts(list: Product[], sort: ProductSort): Product[] {
  const copy = [...list];
  switch (sort) {
    case "low":
      return copy.sort((a, b) => a.price - b.price);
    case "high":
      return copy.sort((a, b) => b.price - a.price);
    case "new":
      return copy.sort((a, b) => b.slug.localeCompare(a.slug));
    case "best":
      return copy.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0) || b.rating - a.rating);
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export async function fetchPublicProducts(): Promise<Product[]> {
  try {
    const res = await apiFetch<{ products: ApiProduct[] }>("/products");
    const merged = mergeCatalog(res.products);
    if (merged.length) writeCatalogCache(merged);
    return merged;
  } catch {
    const cached = readCatalogCache();
    if (cached?.length) return cached;
    if (prefersRemoteApi) return [];
    return staticProducts;
  }
}

export function usePublicProducts() {
  const cached = readCatalogCache();
  const placeholder = cached ?? (prefersRemoteApi ? undefined : staticProducts);

  return useQuery({
    queryKey: ["public", "products"],
    queryFn: fetchPublicProducts,
    placeholderData: placeholder,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

export async function fetchProductBySlug(slug: string): Promise<Product | undefined> {
  const normalized = normalizeCatalogKey(slug);
  try {
    const res = await apiFetch<{ product: ApiProduct }>(`/products/${encodeURIComponent(slug)}`);
    return mapApiProduct(res.product);
  } catch {
    try {
      if (slug !== normalized) {
        const res = await apiFetch<{ product: ApiProduct }>(
          `/products/${encodeURIComponent(normalized)}`,
        );
        return mapApiProduct(res.product);
      }
    } catch {
      /* fall through to static catalog */
    }
    if (!prefersRemoteApi) {
      return staticProducts.find(
        (p) => p.slug === slug || normalizeCatalogKey(p.slug, p.sku) === normalized,
      );
    }
    return undefined;
  }
}
