import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ListFilter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/catalog";
import { categoryLabelFromSlug, shopCategoryOptions } from "@/lib/product-categories";
import {
  sortPublicProducts,
  type ProductSort,
  usePublicProducts,
} from "@/lib/use-public-products";
import {
  activeFilterChips,
  countProductsInBracket,
  emptyShopFilters,
  filterShopProducts,
  MATERIAL_TAGS,
  OCCASION_TAGS,
  priceBracketsForProducts,
  productMaterialTags,
  productOccasionTags,
  type PriceBracket,
  type ShopFilterState,
} from "@/lib/shop-filters";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" && search.category.trim() ? search.category.trim() : undefined,
  }),
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

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="border-b border-border py-4 group">
      <summary className="cursor-pointer list-none text-xs font-semibold tracking-widest after:ml-2 after:text-muted-foreground after:content-['−'] group-open:after:content-['−']">
        {title.toUpperCase()}
      </summary>
      <div className="mt-3 space-y-2.5">{children}</div>
    </details>
  );
}

type FiltersProps = {
  filters: ShopFilterState;
  categoryOptions: { name: string; count: number }[];
  priceBrackets: PriceBracket[];
  products: Product[];
  onChange: (patch: Partial<ShopFilterState>) => void;
};

function Filters({ filters, categoryOptions, priceBrackets, products, onChange }: FiltersProps) {
  const toggle = <T extends string>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  return (
    <div>
      <FilterSection title="Category">
        {categoryOptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories in catalogue yet.</p>
        ) : (
          categoryOptions.map(({ name, count }) => (
            <label key={name} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Checkbox
                checked={filters.categories.includes(name)}
                onCheckedChange={() => onChange({ categories: toggle(filters.categories, name) })}
              />
              <span className="flex-1">{name}</span>
              <span className="text-xs text-muted-foreground">({count})</span>
            </label>
          ))
        )}
      </FilterSection>

      <FilterSection title="Price">
        {priceBrackets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No priced items yet.</p>
        ) : (
          priceBrackets.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
              <Checkbox
                checked={filters.priceBrackets.includes(b.id)}
                onCheckedChange={() => onChange({ priceBrackets: toggle(filters.priceBrackets, b.id) })}
              />
              <span className="flex-1">{b.label}</span>
              <span className="text-xs text-muted-foreground">({countProductsInBracket(products, b)})</span>
            </label>
          ))
        )}
      </FilterSection>

      <FilterSection title="Availability & highlights">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox
            checked={filters.inStockOnly}
            onCheckedChange={(c) => onChange({ inStockOnly: c === true })}
          />
          In stock only
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox
            checked={filters.featuredOnly}
            onCheckedChange={(c) => onChange({ featuredOnly: c === true })}
          />
          Featured picks
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox
            checked={filters.onSaleOnly}
            onCheckedChange={(c) => onChange({ onSaleOnly: c === true })}
          />
          On sale (MRP &gt; price)
        </label>
      </FilterSection>

      <FilterSection title="New arrivals & bestsellers">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox
            checked={filters.badges.includes("NEW")}
            onCheckedChange={() => onChange({ badges: toggle(filters.badges, "NEW") })}
          />
          New arrivals
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <Checkbox
            checked={filters.badges.includes("BESTSELLER")}
            onCheckedChange={() => onChange({ badges: toggle(filters.badges, "BESTSELLER") })}
          />
          Bestsellers
        </label>
      </FilterSection>

      <FilterSection title="Rating">
        {[4.5, 4.0].map((r) => (
          <label key={r} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox
              checked={filters.minRating === r}
              onCheckedChange={(c) => onChange({ minRating: c === true ? r : null })}
            />
            {r}+ stars
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Finish & material">
        {MATERIAL_TAGS.filter((m) => products.some((p) => productMaterialTags(p).includes(m.id))).map((m) => (
          <label key={m.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox
              checked={filters.materials.includes(m.id)}
              onCheckedChange={() => onChange({ materials: toggle(filters.materials, m.id) })}
            />
            {m.label}
          </label>
        ))}
        <p className="pt-1 text-xs text-muted-foreground">Matched from product titles when listed.</p>
      </FilterSection>

      <FilterSection title="Occasion">
        {OCCASION_TAGS.filter((o) => products.some((p) => productOccasionTags(p).includes(o.id))).map((o) => (
          <label key={o.id} className="flex cursor-pointer items-center gap-2.5 text-sm">
            <Checkbox
              checked={filters.occasions.includes(o.id)}
              onCheckedChange={() => onChange({ occasions: toggle(filters.occasions, o.id) })}
            />
            {o.label}
          </label>
        ))}
      </FilterSection>
    </div>
  );
}

function ShopPage() {
  const { category: categorySlug } = Route.useSearch();
  const [sort, setSort] = useState<ProductSort>("featured");
  const [filters, setFilters] = useState<ShopFilterState>(() => emptyShopFilters());
  const { data: products = [], isFetching, isLoading } = usePublicProducts();

  const patchFilters = useCallback((patch: Partial<ShopFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const categoryOptions = useMemo(() => shopCategoryOptions(products), [products]);
  const priceBrackets = useMemo(() => priceBracketsForProducts(products), [products]);

  useEffect(() => {
    if (!categorySlug || products.length === 0) return;
    const label = categoryLabelFromSlug(categorySlug, products);
    if (!label) return;
    setFilters((prev) => {
      if (prev.categories.includes(label)) return prev;
      return { ...prev, categories: [label] };
    });
  }, [categorySlug, products]);
  const filtered = useMemo(() => filterShopProducts(products, filters), [products, filters]);
  const sorted = useMemo(() => sortPublicProducts(filtered, sort), [filtered, sort]);
  const chips = useMemo(() => activeFilterChips(filters, patchFilters), [filters, patchFilters]);

  return (
    <main className="min-h-screen bg-background px-5 pb-24 pt-36 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs tracking-[.2em] text-accent">DISCOVER</p>
            <h1 className="mt-2 font-display text-5xl">Shop All</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {sorted.length} of {products.length} styles
            </p>
          </div>
          <div className="flex gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <ListFilter /> FILTER
                  {chips.length > 0 ? ` (${chips.length})` : ""}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85vh] overflow-auto bg-background">
                <SheetHeader>
                  <SheetTitle>Filter jewellery</SheetTitle>
                </SheetHeader>
                <Filters
                  filters={filters}
                  categoryOptions={categoryOptions}
                  priceBrackets={priceBrackets}
                  products={products}
                  onChange={patchFilters}
                />
                <Button className="mt-6 w-full" variant="outline" type="button" onClick={() => setFilters(emptyShopFilters())}>
                  Clear all filters
                </Button>
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

        {chips.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs transition-colors hover:bg-muted"
                onClick={() => chip.clear()}
              >
                {chip.label}
                <X className="size-3" aria-hidden />
              </button>
            ))}
            <Button variant="link" className="text-xs" type="button" onClick={() => setFilters(emptyShopFilters())}>
              Clear all
            </Button>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <p className="mb-2 text-xs font-semibold tracking-widest">FILTERS</p>
              <Filters
                filters={filters}
                categoryOptions={categoryOptions}
                priceBrackets={priceBrackets}
                products={products}
                onChange={patchFilters}
              />
              {chips.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  type="button"
                  onClick={() => setFilters(emptyShopFilters())}
                >
                  Clear all
                </Button>
              )}
            </div>
          </aside>
          <div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3">
              {isLoading && products.length === 0
                ? Array.from({ length: 9 }).map((_, i) => (
                    <div key={`sk-${i}`} className="aspect-[4/5] animate-pulse bg-muted" />
                  ))
                : sorted.length > 0
                  ? sorted.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 6} />)
                  : (
                    <div className="col-span-full py-16 text-center">
                      <p className="font-display text-2xl">No pieces match</p>
                      <p className="mt-2 text-sm text-muted-foreground">Try clearing a filter or browsing all styles.</p>
                      <Button className="mt-6" variant="outline" type="button" onClick={() => setFilters(emptyShopFilters())}>
                        Show all products
                      </Button>
                    </div>
                  )}
            </div>
            {isFetching && products.length > 0 && (
              <p className="mt-4 text-center text-xs text-muted-foreground">Refreshing catalogue…</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
