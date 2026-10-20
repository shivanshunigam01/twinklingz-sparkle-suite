import type { Product } from "@/lib/catalog";
import { productMatchesCategoryLabels } from "@/lib/product-categories";

export type PriceBracketId = "under-500" | "500-999" | "1000-1999" | "2000-2999" | "3000-plus";

export type PriceBracket = { id: PriceBracketId; label: string; min: number; max: number | null };

export const PRICE_BRACKETS: PriceBracket[] = [
  { id: "under-500", label: "Under ₹500", min: 0, max: 499 },
  { id: "500-999", label: "₹500 – ₹999", min: 500, max: 999 },
  { id: "1000-1999", label: "₹1,000 – ₹1,999", min: 1000, max: 1999 },
  { id: "2000-2999", label: "₹2,000 – ₹2,999", min: 2000, max: 2999 },
  { id: "3000-plus", label: "₹3,000 & above", min: 3000, max: null },
];

export type MaterialTag = "gold" | "silver" | "rose-gold" | "pearl" | "kundan" | "diamond";

export const MATERIAL_TAGS: { id: MaterialTag; label: string; keywords: string[] }[] = [
  { id: "gold", label: "Gold tone", keywords: ["gold", "golden", "antique gold"] },
  { id: "silver", label: "Silver / oxidised", keywords: ["silver", "oxidised", "oxidized", "antique silver"] },
  { id: "rose-gold", label: "Rose gold", keywords: ["rose gold", "rosegold", "copper"] },
  { id: "pearl", label: "Pearl", keywords: ["pearl", "pearls"] },
  { id: "kundan", label: "Kundan / polki", keywords: ["kundan", "polki", "meenakari", "meena"] },
  { id: "diamond", label: "American diamond", keywords: ["diamond", "ad ", "cz ", "cubic"] },
];

export type OccasionTag = "daily" | "party" | "bridal" | "office";

export const OCCASION_TAGS: { id: OccasionTag; label: string; keywords: string[] }[] = [
  { id: "daily", label: "Everyday", keywords: ["daily", "minimal", "lightweight", "simple", "delicate"] },
  { id: "party", label: "Party & evening", keywords: ["party", "statement", "chandelier", "bold", "glam"] },
  { id: "bridal", label: "Bridal & wedding", keywords: ["bridal", "wedding", "bride", "maang", "tikka"] },
  { id: "office", label: "Work & office", keywords: ["office", "work", "subtle", "stud"] },
];

export type ShopFilterState = {
  categories: string[];
  priceBrackets: PriceBracketId[];
  inStockOnly: boolean;
  badges: Array<"NEW" | "BESTSELLER">;
  featuredOnly: boolean;
  onSaleOnly: boolean;
  minRating: number | null;
  materials: MaterialTag[];
  occasions: OccasionTag[];
};

export const emptyShopFilters = (): ShopFilterState => ({
  categories: [],
  priceBrackets: [],
  inStockOnly: false,
  badges: [],
  featuredOnly: false,
  onSaleOnly: false,
  minRating: null,
  materials: [],
  occasions: [],
});

function haystack(product: Product) {
  return `${product.name} ${product.category} ${product.sku}`.toLowerCase();
}

export function productMaterialTags(product: Product): MaterialTag[] {
  const text = haystack(product);
  return MATERIAL_TAGS.filter((m) => m.keywords.some((k) => text.includes(k))).map((m) => m.id);
}

export function productOccasionTags(product: Product): OccasionTag[] {
  const text = haystack(product);
  return OCCASION_TAGS.filter((o) => o.keywords.some((k) => text.includes(k))).map((o) => o.id);
}

export function priceMatchesBracket(price: number, bracket: PriceBracket): boolean {
  if (bracket.max === null) return price >= bracket.min;
  return price >= bracket.min && price <= bracket.max;
}

function matchesPrice(product: Product, brackets: PriceBracketId[]) {
  if (!brackets?.length) return true;
  return brackets.some((id) => {
    const b = PRICE_BRACKETS.find((x) => x.id === id);
    if (!b) return false;
    return priceMatchesBracket(product.price, b);
  });
}

/** Only show price tiers that contain at least one product in the current catalogue. */
export function priceBracketsForProducts(products: Product[]): PriceBracket[] {
  return PRICE_BRACKETS.filter((b) => products.some((p) => priceMatchesBracket(p.price, b)));
}

export function countProductsInBracket(products: Product[], bracket: PriceBracket): number {
  return products.filter((p) => priceMatchesBracket(p.price, bracket)).length;
}

function matchesMaterials(product: Product, materials: MaterialTag[]) {
  if (!materials.length) return true;
  const tags = productMaterialTags(product);
  return materials.some((m) => tags.includes(m));
}

function matchesOccasions(product: Product, occasions: OccasionTag[]) {
  if (!occasions.length) return true;
  const tags = productOccasionTags(product);
  if (!tags.length) return false;
  return occasions.some((o) => tags.includes(o));
}

export function filterShopProducts(products: Product[], filters: ShopFilterState): Product[] {
  const categories = filters.categories ?? [];
  const priceBrackets = filters.priceBrackets ?? [];
  const badges = filters.badges ?? [];
  const materials = filters.materials ?? [];
  const occasions = filters.occasions ?? [];

  return products.filter((p) => {
    if (!productMatchesCategoryLabels(p, categories)) return false;
    if (!matchesPrice(p, priceBrackets)) return false;
    if (filters.inStockOnly && p.inStock === false) return false;
    if (badges.length && (!p.badge || !badges.includes(p.badge))) return false;
    if (filters.featuredOnly && !p.featured) return false;
    if (filters.onSaleOnly) {
      const mrp = p.mrp ?? 0;
      if (!(mrp > p.price)) return false;
    }
    if (filters.minRating != null && p.rating < filters.minRating) return false;
    if (!matchesMaterials(p, materials)) return false;
    if (!matchesOccasions(p, occasions)) return false;
    return true;
  });
}

export function countActiveFilters(filters: ShopFilterState): number {
  let n = 0;
  if (filters.categories.length) n += filters.categories.length;
  if (filters.priceBrackets.length) n += filters.priceBrackets.length;
  if (filters.inStockOnly) n += 1;
  if (filters.badges.length) n += filters.badges.length;
  if (filters.featuredOnly) n += 1;
  if (filters.onSaleOnly) n += 1;
  if (filters.minRating != null) n += 1;
  if (filters.materials.length) n += filters.materials.length;
  if (filters.occasions.length) n += filters.occasions.length;
  return n;
}

export type ActiveFilterChip = { key: string; label: string; clear: () => Partial<ShopFilterState> };

export function activeFilterChips(
  filters: ShopFilterState,
  onPatch: (patch: Partial<ShopFilterState>) => void,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  for (const c of filters.categories) {
    chips.push({
      key: `cat-${c}`,
      label: c,
      clear: () => ({ categories: filters.categories.filter((x) => x !== c) }),
    });
  }
  for (const id of filters.priceBrackets) {
    const b = PRICE_BRACKETS.find((x) => x.id === id);
    chips.push({
      key: `price-${id}`,
      label: b?.label ?? id,
      clear: () => ({ priceBrackets: filters.priceBrackets.filter((x) => x !== id) }),
    });
  }
  if (filters.inStockOnly) {
    chips.push({ key: "stock", label: "In stock", clear: () => ({ inStockOnly: false }) });
  }
  for (const b of filters.badges) {
    chips.push({
      key: `badge-${b}`,
      label: b === "NEW" ? "New arrivals" : "Bestsellers",
      clear: () => ({ badges: filters.badges.filter((x) => x !== b) }),
    });
  }
  if (filters.featuredOnly) {
    chips.push({ key: "featured", label: "Featured", clear: () => ({ featuredOnly: false }) });
  }
  if (filters.onSaleOnly) {
    chips.push({ key: "sale", label: "On sale", clear: () => ({ onSaleOnly: false }) });
  }
  if (filters.minRating != null) {
    chips.push({
      key: "rating",
      label: `${filters.minRating}+ stars`,
      clear: () => ({ minRating: null }),
    });
  }
  for (const m of filters.materials) {
    const tag = MATERIAL_TAGS.find((x) => x.id === m);
    chips.push({
      key: `mat-${m}`,
      label: tag?.label ?? m,
      clear: () => ({ materials: filters.materials.filter((x) => x !== m) }),
    });
  }
  for (const o of filters.occasions) {
    const tag = OCCASION_TAGS.find((x) => x.id === o);
    chips.push({
      key: `occ-${o}`,
      label: tag?.label ?? o,
      clear: () => ({ occasions: filters.occasions.filter((x) => x !== o) }),
    });
  }
  return chips.map((chip) => ({
    ...chip,
    clear: () => onPatch(chip.clear()),
  }));
}
