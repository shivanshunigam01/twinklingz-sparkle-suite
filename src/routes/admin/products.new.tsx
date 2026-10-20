import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ProductForm } from "@/components/admin/product-form";
import { emptyProductForm } from "@/lib/admin-product-form";
import type { ApiProduct } from "@/lib/api";

export const Route = createFileRoute("/admin/products/new")({
  head: () => ({ meta: [{ title: "Add product | Twinklingz Admin" }] }),
  component: NewProductPage,
});

function NewProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyProductForm);

  function onSaved(product: ApiProduct) {
    const id = product._id || product.id;
    if (id) {
      navigate({ to: "/admin/products/$id", params: { id: String(id) } });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-4xl">Add product</h2>
        <p className="mt-2 text-muted-foreground">Create a new catalogue item. You can upload images on the next screen.</p>
      </div>
      <section className="border border-border bg-background p-6">
        <ProductForm mode="create" form={form} onFormChange={setForm} onSaved={onSaved} />
      </section>
    </div>
  );
}
