import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, type ApiProduct } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products | Twinklingz Admin" }] }),
  component: ProductsPage,
});

const emptyForm = {
  name: "",
  sku: "",
  slug: "",
  category: "Necklaces",
  price: "",
  description: "",
  published: true,
  inStock: true,
  featured: false,
};

function ProductsPage() {
  const token = getAdminToken();
  const qc = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => apiFetch<{ products: ApiProduct[] }>("/admin/products", { token }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
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
      if (editId) {
        return apiFetch(`/admin/products/${editId}`, { method: "PUT", body: JSON.stringify(body), token });
      }
      return apiFetch("/admin/products", { method: "POST", body: JSON.stringify(body), token });
    },
    onSuccess: () => {
      toast.success(editId ? "Product updated" : "Product created");
      setForm(emptyForm);
      setEditId(null);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/products/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  async function uploadImages(id: string, files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("images", f));
    const base = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, "") || "http://localhost:5000/api";
    const res = await fetch(`${base}/admin/products/${id}/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Upload failed");
    toast.success("Images uploaded");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    setUploadId(null);
  }

  function startEdit(p: ApiProduct) {
    const id = p._id || p.id!;
    setEditId(id);
    setForm({
      name: p.name,
      sku: p.sku,
      slug: p.slug,
      category: p.category,
      price: String(p.price),
      description: p.description || "",
      published: p.published !== false,
      inStock: p.inStock !== false,
      featured: Boolean(p.featured),
    });
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-4xl">Products</h2>
        <p className="mt-2 text-muted-foreground">Create catalogue items and upload images to Cloudinary.</p>
      </div>

      <section className="border border-border bg-background p-6">
        <h3 className="font-display text-2xl">{editId ? "Edit product" : "Add product"}</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="SKU" value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} />
          <Field label="Slug (optional)" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
          <Field label="Price (₹)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" />
        </div>
        <Label className="mt-4 block text-xs">Description</Label>
        <Textarea
          className="mt-1"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="mt-4 flex flex-wrap gap-6">
          <Toggle label="Published" checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
          <Toggle label="In stock" checked={form.inStock} onCheckedChange={(v) => setForm({ ...form, inStock: v })} />
          <Toggle label="Featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
        </div>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {editId ? "Save changes" : "Create product"}
          </Button>
          {editId && (
            <Button
              variant="outline"
              onClick={() => {
                setEditId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </section>

      <section>
        <h3 className="font-display text-2xl">Catalogue</h3>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
        <ul className="mt-4 divide-y divide-border border border-border bg-background">
          {(data?.products ?? []).map((p) => {
            const id = p._id || p.id!;
            return (
              <li key={id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="flex shrink-0 gap-1">
                    {(p.images?.length ? p.images : [p.image]).filter(Boolean).slice(0, 4).map((src, i) => (
                      <img
                        key={`${id}-img-${i}`}
                        src={src}
                        alt=""
                        className="size-12 border border-border object-cover"
                        loading="lazy"
                      />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.sku} · {p.category} · ₹{p.price} · {(p.images?.length ?? 0) || 1} image(s) ·{" "}
                      {p.published === false ? "Draft" : "Live"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setUploadId(uploadId === id ? null : id)}>
                    Images
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(id)}>
                    Delete
                  </Button>
                </div>
                {uploadId === id && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="w-full text-sm sm:col-span-2"
                    onChange={(e) => uploadImages(id, e.target.files).catch((err) => toast.error(err.message))}
                  />
                )}
              </li>
            );
          })}
          {!isLoading && !data?.products?.length && (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">No products yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input className="mt-1" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={label !== "Slug (optional)"} />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
  );
}
