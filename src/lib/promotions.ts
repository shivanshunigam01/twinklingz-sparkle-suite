import type { Product } from "@/lib/catalog";

/** Keep in sync with backend `src/lib/promotions.js`. */
export const DIWALI_SALE = {
  active: true,
  percentOff: 25,
  code: "DIWALI25",
  label: "Diwali Festive Sale",
  shortLabel: "FLAT 25% OFF",
  bannerSrc: "/promotions/diwali-festive-sale.jpg",
} as const;

export const DIWALI_ANNOUNCEMENT_BAR =
  "✦ DIWALI FESTIVE SALE — FLAT 25% OFF ON ALL ORDERS ✦ Secure Online Payments ✦";

/** Apply promo for static/offline catalog only (live API already returns offer + original). */
export function applyDiwaliPricing(product: Product): Product {
  if (!DIWALI_SALE.active) return product;
  const original = product.price;
  const offer = Math.round(original * (1 - DIWALI_SALE.percentOff / 100));
  if (offer >= original) return product;
  return { ...product, mrp: original, price: offer };
}

export function applyDiwaliPricingList(products: Product[]): Product[] {
  return products.map(applyDiwaliPricing);
}

/** Original catalog price (shown struck through during promo). */
export function getOriginalListPrice(product: Product): number {
  if (product.mrp && product.mrp > product.price) return product.mrp;
  return product.price;
}

export function getOfferPrice(product: Product): number {
  return product.price;
}

export function hasPromoDiscount(product: Product) {
  return DIWALI_SALE.active && Boolean(product.mrp && product.mrp > product.price);
}

export function promoSavings(product: Product): number {
  if (!hasPromoDiscount(product)) return 0;
  return getOriginalListPrice(product) - getOfferPrice(product);
}
