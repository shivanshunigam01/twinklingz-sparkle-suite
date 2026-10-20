import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ExternalLink, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, apiUploadForm, type ApiProduct } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { isCloudinaryUrl } from "@/lib/product-images";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products | Twinklingz Admin" }] }),
  component: ProductsPage,
});

const CATEGORIES = ["Necklaces", "Earrings", "Bracelets"] as const;
const BADGES = ["", "NEW", "BESTSELLER"] as const;

const emptyForm = {
  name: "",
  sku: "",
  slug: "",
  category: "Necklaces",
  price: "",
  mrp: "",
  badge: "" as "" | "NEW" | "BESTSELLER",
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
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", search],
    queryFn: () =>
      apiFetch<{ products: ApiProduct[] }>(
        search ? `/admin/products?q=${encodeURIComponent(search)}` : "/admin/products",
        { token },
      ),
  });

  const editingProduct = useMemo(
    () => (data?.products ?? []).find((p) => (p._id || p.id) === editId),
    [data?.products, editId],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
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
      if (editId) {
        return apiFetch(`/admin/products/${editId}`, { method: "PUT", body: JSON.stringify(body), token });
      }
      return apiFetch("/admin/products", { method: "POST", body: JSON.stringify(body), token });
    },
    onSuccess: () => {
      toast.success(editId ? "Product updated" : "Product created");
      if (!editId) {
        setForm(emptyForm);
      }
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["public", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/products/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      toast.success("Deleted");
      setEditId(null);
      setForm(emptyForm);
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["public", "products"] });
    },
  });

  async function uploadImages(id: string, files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("images", f));
    await apiUploadForm<{ product: ApiProduct }>(`/admin/products/${id}/images`, fd, { token });
    toast.success("Uploaded to Cloudinary");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["public", "products"] });
  }

  async function removeImage(productId: string, index: number) {
    await apiFetch(`/admin/products/${productId}/images/${index}`, { method: "DELETE", token });
    toast.success("Image removed");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["public", "products"] });
  }

  async function setCover(productId: string, url: string, images: string[]) {
    const rest = images.filter((u) => u !== url);
    const reordered = [url, ...rest];
    await apiFetch(`/admin/products/${productId}/images`, {
      method: "PUT",
      body: JSON.stringify({ images: reordered, image: url, altImage: reordered[1] || url }),
      token,
    });
    toast.success("Cover image updated");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["public", "products"] });
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
      mrp: p.mrp ? String(p.mrp) : "",
      badge: (p.badge as typeof form.badge) || "",
      description: p.description || "",
      published: p.published !== false,
      inStock: p.inStock !== false,
      featured: Boolean(p.featured),
    });
  }

  const gallery = (editingProduct?.images?.length ? editingProduct.images : [editingProduct?.image])
    .filter(Boolean) as string[];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display text-4xl">Products</h2>
        <p className="mt-2 text-muted-foreground">
          Manage catalogue, pricing, and photos. All images are stored on Cloudinary and served from there on the shop.
        </p>
      </div>

      <section className="border border-border bg-background p-6">
        <h3 className="font-display text-2xl">{editId ? "Edit product" : "Add product"}</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="SKU" value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} />
          <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <div>
            <Label className="text-xs">Category</Label>
            <select
              className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <Field label="Price (₹)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" />
          <Field label="MRP (₹, optional)" value={form.mrp} onChange={(v) => setForm({ ...form, mrp: v })} type="number" />
          <div>
            <Label className="text-xs">Badge</Label>
            <select
              className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm"
              value={form.badge}
              onChange={(e) => setForm({ ...form, badge: e.target.value as typeof form.badge })}
            >
              {BADGES.map((b) => (
                <option key={b || "none"} value={b}>{b || "None"}</option>
              ))}
            </select>
          </div>
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

        {editId && editingProduct && (
          <div className="mt-8 border-t border-border pt-6">
            <h4 className="font-display text-xl">Cloudinary gallery ({gallery.length})</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload adds files to Cloudinary. “Set cover” chooses the main shop image.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {gallery.map((src, i) => (
                <div key={`${src}-${i}`} className="relative w-28 border border-border bg-muted">
                  <img src={src} alt="" className="aspect-square w-full object-cover" />
                  {editingProduct.image === src && (
                    <span className="absolute left-1 top-1 bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">
                      COVER
                    </span>
                  )}
                  {!isCloudinaryUrl(src) && (
                    <span className="absolute inset-0 flex items-center justify-center bg-destructive/80 text-[10px] text-white">
                      Not Cloudinary
                    </span>
                  )}
                  <div className="flex border-t border-border">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 flex-1 text-[10px]"
                      onClick={() => setCover(editId, src, gallery)}
                    >
                      <Star className="mr-1 size-3" /> Cover
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-destructive"
                      onClick={() => removeImage(editId, i).catch((e) => toast.error(e.message))}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                  <a
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute right-1 top-1 rounded bg-background/90 p-1"
                    aria-label="Open in Cloudinary"
                  >
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              ))}
            </div>
            <Label className="mt-4 block text-xs">Add images (uploads to Cloudinary)</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              className="mt-1 max-w-md"
              onChange={(e) =>
                uploadImages(editId, e.target.files).catch((err) => toast.error(err.message))
              }
            />
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
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
        {!editId && (
          <p className="mt-3 text-xs text-muted-foreground">
            After creating a product, click Edit in the list below to upload Cloudinary photos.
          </p>
        )}
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="font-display text-2xl">Catalogue</h3>
          <Input
            placeholder="Search name, SKU, slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
        <ul className="mt-4 divide-y divide-border border border-border bg-background">
          {(data?.products ?? []).map((p) => {
            const id = p._id || p.id!;
            const imgs = (p.images?.length ? p.images : [p.image]).filter(Boolean);
            const cloudCount = imgs.filter(isCloudinaryUrl).length;
            return (
              <li key={id} className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="flex shrink-0 gap-1">
                    {imgs.slice(0, 5).map((src, i) => (
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
                      {p.sku} · {p.category} · ₹{p.price} · {cloudCount}/{imgs.length} Cloudinary ·{" "}
                      {p.published === false ? "Draft" : "Live"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(id)}>
                    Delete
                  </Button>
                </div>
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
      <Input
        className="mt-1"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={!label.includes("optional") && label !== "Slug"}
      />
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
