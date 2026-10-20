import type { ApiProduct } from "@/lib/api";

export const PRODUCT_CATEGORIES = ["Necklaces", "Earrings", "Bracelets"] as const;
export const PRODUCT_BADGES = ["", "NEW", "BESTSELLER"] as const;

export type ProductFormState = {
  name: string;
  sku: string;
  slug: string;
  category: string;
  price: string;
  mrp: string;
  badge: "" | "NEW" | "BESTSELLER";
  description: string;
  published: boolean;
  inStock: boolean;
  featured: boolean;
};

export const emptyProductForm: ProductFormState = {
  name: "",
  sku: "",
  slug: "",
  category: "Necklaces",
  price: "",
  mrp: "",
  badge: "",
  description: "",
  published: true,
  inStock: true,
  featured: false,
};

export function productToForm(p: ApiProduct): ProductFormState {
  return {
    name: p.name,
    sku: p.sku,
    slug: p.slug,
    category: p.category,
    price: String(p.price),
    mrp: p.mrp ? String(p.mrp) : "",
    badge: (p.badge as ProductFormState["badge"]) || "",
    description: p.description || "",
    published: p.published !== false,
    inStock: p.inStock !== false,
    featured: Boolean(p.featured),
  };
}

export function formToApiBody(form: ProductFormState): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: form.name,
    sku: form.sku,
    slug: form.slug || undefined,
    category: form.category,
    description: form.description,
    price: Number(form.price),
    published: form.published,
    inStock: form.inStock,
    featured: form.featured,
  };
  if (form.mrp) body.mrp = Number(form.mrp);
  body.badge = form.badge || null;
  return body;
}
