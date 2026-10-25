import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ExternalLink, Star, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch, apiUploadForm, type ApiProduct } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import {
  PRODUCT_BADGES,
  adminCategoryOptions,
  type ProductFormState,
  formToApiBody,
} from "@/lib/admin-product-form";
import { categoryToSlug } from "@/lib/product-categories";
import { isCloudinaryUrl } from "@/lib/product-images";
import { toast } from "sonner";

type ProductFormProps = {
  mode: "create" | "edit";
  productId?: string;
  product?: ApiProduct | null;
  form: ProductFormState;
  onFormChange: (form: ProductFormState) => void;
  onSaved?: (product: ApiProduct) => void;
};

export function ProductForm({
  mode,
  productId,
  product,
  form,
  onFormChange,
  onSaved,
}: ProductFormProps) {
  const token = getAdminToken();
  const qc = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = formToApiBody(form);
      if (mode === "edit" && productId) {
        return apiFetch<{ product: ApiProduct }>(`/admin/products/${productId}`, {
          method: "PUT",
          body: JSON.stringify(body),
          token,
        });
      }
      return apiFetch<{ product: ApiProduct }>("/admin/products", {
        method: "POST",
        body: JSON.stringify(body),
        token,
      });
    },
    onSuccess: (res) => {
      toast.success(mode === "edit" ? "Product updated" : "Product created");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["public", "products"] });
      if (productId) qc.invalidateQueries({ queryKey: ["admin", "product", productId] });
      if (res.product) onSaved?.(res.product);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function uploadImages(files: FileList | null) {
    if (!productId || !files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("images", f));
    await apiUploadForm<{ product: ApiProduct }>(`/admin/products/${productId}/images`, fd, { token });
    toast.success("Uploaded to Cloudinary");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["admin", "product", productId] });
    qc.invalidateQueries({ queryKey: ["public", "products"] });
  }

  async function removeImage(index: number) {
    if (!productId) return;
    await apiFetch(`/admin/products/${productId}/images/${index}`, { method: "DELETE", token });
    toast.success("Image removed");
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["admin", "product", productId] });
    qc.invalidateQueries({ queryKey: ["public", "products"] });
  }

  async function saveImageOrder(reordered: string[]) {
    if (!productId || !reordered.length) return;
    const cover = reordered[0];
    await apiFetch(`/admin/products/${productId}/images`, {
      method: "PUT",
      body: JSON.stringify({
        images: reordered,
        image: cover,
        altImage: reordered[1] || cover,
      }),
      token,
    });
    qc.invalidateQueries({ queryKey: ["admin", "products"] });
    qc.invalidateQueries({ queryKey: ["admin", "product", productId] });
    qc.invalidateQueries({ queryKey: ["public", "products"] });
  }

  async function setCover(url: string, images: string[]) {
    const rest = images.filter((u) => u !== url);
    await saveImageOrder([url, ...rest]);
    toast.success("Primary image updated (position 1)");
  }

  async function moveImage(index: number, direction: -1 | 1, images: string[]) {
    const next = index + direction;
    if (next < 0 || next >= images.length) return;
    const copy = [...images];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    await saveImageOrder(copy);
    toast.success(`Image moved to position ${next + 1}`);
  }

  const gallery = (product?.images?.length ? product.images : [product?.image]).filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" value={form.name} onChange={(v) => onFormChange({ ...form, name: v })} />
        <Field label="SKU" value={form.sku} onChange={(v) => onFormChange({ ...form, sku: v })} />
        <Field label="Slug" value={form.slug} onChange={(v) => onFormChange({ ...form, slug: v })} />
        <div className="sm:col-span-2">
          <Label className="text-xs">Storefront category</Label>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Controls shop filters and collection URL (e.g. Traditional Wear → /collections/traditional-wear).
          </p>
          <select
            className="mt-2 w-full max-w-md border border-input bg-background px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => onFormChange({ ...form, category: e.target.value })}
          >
            {adminCategoryOptions(form.category).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Collection: /collections/{categoryToSlug(form.category || "Necklaces")}
          </p>
        </div>
        <Field
          label="Price (₹)"
          value={form.price}
          onChange={(v) => onFormChange({ ...form, price: v })}
          type="number"
        />
        <Field
          label="MRP (₹, optional)"
          value={form.mrp}
          onChange={(v) => onFormChange({ ...form, mrp: v })}
          type="number"
        />
        <div>
          <Label className="text-xs">Badge</Label>
          <select
            className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm"
            value={form.badge}
            onChange={(e) => onFormChange({ ...form, badge: e.target.value as ProductFormState["badge"] })}
          >
            {PRODUCT_BADGES.map((b) => (
              <option key={b || "none"} value={b}>{b || "None"}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea
          className="mt-1"
          value={form.description}
          onChange={(e) => onFormChange({ ...form, description: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap gap-6">
        <Toggle
          label="Published"
          checked={form.published}
          onCheckedChange={(v) => onFormChange({ ...form, published: v })}
        />
        <Toggle
          label="In stock"
          checked={form.inStock}
          onCheckedChange={(v) => onFormChange({ ...form, inStock: v })}
        />
        <Toggle
          label="Featured"
          checked={form.featured}
          onCheckedChange={(v) => onFormChange({ ...form, featured: v })}
        />
      </div>

      {mode === "edit" && productId && product && (
        <div className="border-t border-border pt-6">
          <h4 className="font-display text-xl">Photo order ({gallery.length})</h4>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Image <strong>1</strong> is the shop thumbnail and first photo on the product page. Use the arrows to
            change order, or <strong>Make #1</strong> to jump a photo to the front.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {gallery.map((src, i) => (
              <div key={`${src}-${i}`} className="relative w-32 border border-border bg-muted">
                <span className="absolute left-1 top-1 z-10 rounded bg-background/95 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums shadow-sm">
                  #{i + 1}
                </span>
                <LazyImage src={src} alt="" optimizeWidth={224} className="aspect-square w-full object-cover" />
                {i === 0 && (
                  <span className="absolute right-1 top-1 bg-primary px-1.5 py-0.5 text-[9px] text-primary-foreground">
                    PRIMARY
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
                    className="h-8 px-1.5"
                    disabled={i === 0}
                    aria-label="Move earlier"
                    onClick={() => moveImage(i, -1, gallery).catch((e) => toast.error(e.message))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 px-1.5"
                    disabled={i === gallery.length - 1}
                    aria-label="Move later"
                    onClick={() => moveImage(i, 1, gallery).catch((e) => toast.error(e.message))}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 flex-1 text-[10px]"
                    disabled={i === 0}
                    onClick={() => setCover(src, gallery).catch((e) => toast.error(e.message))}
                  >
                    <Star className="mr-0.5 size-3" /> #1
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-destructive"
                    onClick={() => removeImage(i).catch((e) => toast.error(e.message))}
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
            onChange={(e) => uploadImages(e.target.files).catch((err) => toast.error(err.message))}
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-t border-border pt-6">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          {mode === "edit" ? "Save changes" : "Create product"}
        </Button>
        <Button variant="outline" asChild>
          <Link to="/admin/products">Back to list</Link>
        </Button>
      </div>
      {mode === "create" && (
        <p className="text-xs text-muted-foreground">
          After creating, you’ll be taken to the edit page to upload photos.
        </p>
      )}
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
