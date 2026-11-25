import type { Product } from "@/lib/catalog";

/** Keep in sync with backend `src/lib/promotions.js` when present. */
export const SITE_SALE = {
  active: true,
  percentOff: 30,
  code: "BLACKFRIDAY30",
  label: "Black Friday Sale",
  shortLabel: "FLAT 30% OFF",
} as const;

export const SITE_ANNOUNCEMENT_BAR =
  "✦ BLACK FRIDAY — FLAT 30% OFF ON ALL ORDERS ✦ Secure Online Payments ✦";

/** Apply sitewide promo from list/MRP (static catalog or API rows with mrp + price). */
export function applySitePricing(product: Product): Product {
  if (!SITE_SALE.active) return product;
  const original =
    product.mrp != null && product.mrp > product.price ? product.mrp : product.price;
  const offer = Math.round(original * (1 - SITE_SALE.percentOff / 100));
  if (offer >= original) return product;
  return { ...product, mrp: original, price: offer };
}

export function applySitePricingList(products: Product[]): Product[] {
  return products.map(applySitePricing);
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
  return SITE_SALE.active && Boolean(product.mrp && product.mrp > product.price);
}

export function promoSavings(product: Product): number {
  if (!hasPromoDiscount(product)) return 0;
  return getOriginalListPrice(product) - getOfferPrice(product);
}