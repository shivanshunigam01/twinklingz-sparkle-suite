import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { Input } from "@/components/ui/input";
import { apiFetch, type ApiProduct } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { isCloudinaryUrl } from "@/lib/product-images";
import { ProductsSubnav } from "@/components/admin/products-subnav";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products/")({
  head: () => ({ meta: [{ title: "Products | Twinklingz Admin" }] }),
  component: ProductsListPage,
});

function ProductsListPage() {
  const token = getAdminToken();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", search],
    queryFn: () =>
      apiFetch<{ products: ApiProduct[] }>(
        search ? `/admin/products?q=${encodeURIComponent(search)}` : "/admin/products",
        { token },
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/products/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      toast.success("Product deleted");
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["public", "products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function confirmDelete(p: ApiProduct) {
    const id = p._id || p.id!;
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    deleteMutation.mutate(id);
  }

  const products = data?.products ?? [];

  return (
    <div className="space-y-8">
      <ProductsSubnav />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-4xl">Products</h2>
          <p className="mt-2 text-muted-foreground">
            Browse, search, and manage your catalogue. Add new items or edit existing ones.
          </p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/admin/products/new">
            <Plus className="size-4" /> Add product
          </Link>
        </Button>
      </div>

      <section className="border border-border bg-background">
        <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-display text-xl">All products ({products.length})</h3>
          <Input
            placeholder="Search name, SKU, slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {isLoading && <p className="px-4 py-8 text-sm text-muted-foreground">Loading…</p>}

        {!isLoading && products.length === 0 && (
          <div className="px-4 py-16 text-center">
            <p className="text-muted-foreground">No products match your search.</p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/admin/products/new">Create your first product</Link>
            </Button>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => {
                  const id = p._id || p.id!;
                  const imgs = (p.images?.length ? p.images : [p.image]).filter(Boolean);
                  const cover = imgs[0];
                  const cloudCount = imgs.filter(isCloudinaryUrl).length;
                  return (
                    <tr key={id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {cover ? (
                            <LazyImage
                              src={cover}
                              alt=""
                              optimizeWidth={96}
                              className="size-12 shrink-0 border border-border object-cover"
                            />
                          ) : (
                            <div className="size-12 shrink-0 bg-muted" />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium">{p.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {cloudCount}/{imgs.length} photos · /{p.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.sku}</td>
                      <td className="px-4 py-3">{p.category}</td>
                      <td className="px-4 py-3">₹{p.price}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            p.published === false
                              ? "text-muted-foreground"
                              : "text-green-700 dark:text-green-400"
                          }
                        >
                          {p.published === false ? "Draft" : "Live"}
                        </span>
                        {!p.inStock && (
                          <span className="ml-2 text-xs text-amber-700 dark:text-amber-400">Out of stock</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to="/admin/products/$id" params={{ id: String(id) }}>
                              <Pencil className="size-3.5" /> Edit
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => confirmDelete(p)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
