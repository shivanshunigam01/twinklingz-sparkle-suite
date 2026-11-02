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

function listPriceBeforePromo(price: number, mrp?: number) {
  const list = mrp && mrp > price ? mrp : price;
  return list;
}

export function applyDiwaliPricing(product: Product): Product {
  if (!DIWALI_SALE.active) return product;
  const list = listPriceBeforePromo(product.price, product.mrp);
  const sale = Math.round(list * (1 - DIWALI_SALE.percentOff / 100));
  if (sale >= list) return product;
  return { ...product, mrp: list, price: sale };
}

export function applyDiwaliPricingList(products: Product[]): Product[] {
  return products.map(applyDiwaliPricing);
}

export function hasPromoDiscount(product: Product) {
  return Boolean(product.mrp && product.mrp > product.price);
}
