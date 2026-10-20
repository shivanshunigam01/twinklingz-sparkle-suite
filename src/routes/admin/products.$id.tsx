import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { productToForm, type ProductFormState } from "@/lib/admin-product-form";
import { apiFetch, type ApiProduct } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/products/$id")({
  head: () => ({ meta: [{ title: "Edit product | Twinklingz Admin" }] }),
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();
  const token = getAdminToken();
  const [form, setForm] = useState<ProductFormState | null>(null);
  const formInitialized = useRef(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "product", id],
    queryFn: () => apiFetch<{ product: ApiProduct }>(`/admin/products/${id}`, { token }),
  });

  const product = data?.product;

  useEffect(() => {
    formInitialized.current = false;
    setForm(null);
  }, [id]);

  useEffect(() => {
    if (product && !formInitialized.current) {
      setForm(productToForm(product));
      formInitialized.current = true;
    }
  }, [product]);

  if (isLoading || !form) {
    return <p className="text-muted-foreground">Loading product…</p>;
  }

  if (isError || !product) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Product not found.</p>
        <Button asChild variant="outline">
          <Link to="/admin/products">Back to products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-4xl">Edit product</h2>
          <p className="mt-2 text-muted-foreground">{product.name} · {product.sku}</p>
        </div>
        {product.slug && (
          <Button asChild variant="outline" size="sm">
            <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer">
              View on storefront
            </a>
          </Button>
        )}
      </div>
      <section className="border border-border bg-background p-6">
        <ProductForm
          mode="edit"
          productId={id}
          product={product}
          form={form}
          onFormChange={setForm}
        />
      </section>
    </div>
  );
}
