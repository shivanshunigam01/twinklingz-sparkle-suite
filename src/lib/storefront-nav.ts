import { STOREFRONT_CATEGORIES, categoryToSlug } from "@/lib/product-categories";

export type StorefrontNavItem =
  | { kind: "link"; label: string; to: "/new-arrivals" | "/shop" | "/bestsellers" | "/collections" | "/about" }
  | { kind: "collection"; label: string; slug: string };

const categoryItems: StorefrontNavItem[] = STOREFRONT_CATEGORIES.map((name) => ({
  kind: "collection",
  label: name.toUpperCase(),
  slug: categoryToSlug(name),
}));

/** Header + mobile menu links (all product categories included). */
export const storefrontNav: StorefrontNavItem[] = [
  { kind: "link", label: "NEW IN", to: "/new-arrivals" },
  ...categoryItems,
  { kind: "link", label: "SHOP ALL", to: "/shop" },
  { kind: "link", label: "BESTSELLERS", to: "/bestsellers" },
  { kind: "link", label: "COLLECTIONS", to: "/collections" },
  { kind: "link", label: "ABOUT", to: "/about" },
];
