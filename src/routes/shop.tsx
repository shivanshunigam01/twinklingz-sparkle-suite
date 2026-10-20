import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListFilter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/product-card";
import {
  sortPublicProducts,
  type ProductSort,
  usePublicProducts,
} from "@/lib/use-public-products";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop All Jewellery | Twinklingz" },
      { name: "description", content: "Shop premium fashion necklaces, earrings, and bracelets." },
      { property: "og:title", content: "Shop All Jewellery | Twinklingz" },
      { property: "og:description", content: "Discover the complete Twinklingz jewellery collection." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

const filterGroups = [
  "Category",
  "Price",
  "Availability",
  "Colour",
  "Material",
  "Plating",
  "Stone",
  "Occasion",
  "Collection",
  "New Arrivals",
  "Bestsellers",
];

function Filters() {
  return (
    <div>
      {filterGroups.map((g) => (
        <details key={g} className="border-b border-border py-4">
          <summary className="cursor-pointer text-xs font-semibold tracking-widest">{g.toUpperCase()}</summary>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            {["All", "Featured", "In stock"].map((x) => (
              <label key={x} className="flex items-center gap-2">
                <input type="checkbox" readOnly /> {x}
              </label>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function ShopPage() {
  const [sort, setSort] = useState<ProductSort>("featured");
  const { data: products = [], isFetching, isLoading } = usePublicProducts();
  const sorted = useMemo(() => sortPublicProducts(products, sort), [products, sort]);

  return (
    <main className="min-h-screen bg-background px-5 pb-24 pt-36 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[.2em] text-accent">DISCOVER</p>
            <h1 className="mt-2 font-display text-5xl">Shop All</h1>
            <p className="mt-2 text-sm text-muted-foreground">{products.length} styles</p>
          </div>
          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <ListFilter /> FILTER
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-auto bg-background">
                <SheetHeader>
                  <SheetTitle>Filter jewellery</SheetTitle>
                </SheetHeader>
                <Filters />
              </SheetContent>
            </Sheet>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as ProductSort)}
              className="border border-input bg-background px-3 py-2 text-sm"
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="new">Newest</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="best">Bestselling</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2">
          <span className="border border-border px-3 py-2 text-xs">
            In stock <X className="ml-2 inline size-3" aria-hidden />
          </span>
          <Button variant="link" className="text-xs" type="button">
            Clear All
          </Button>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block">
            <Filters />
          </aside>
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3">
            {isLoading && products.length === 0
              ? Array.from({ length: 9 }).map((_, i) => (
                  <div key={`sk-${i}`} className="aspect-[4/5] animate-pulse bg-muted" />
                ))
              : sorted.map((p, i) => (
                  <ProductCard key={p.id} product={p} priority={i < 6} />
                ))}
          </div>
          {isFetching && products.length > 0 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">Refreshing catalogue…</p>
          )}
        </div>
      </div>
    </main>
  );
}
