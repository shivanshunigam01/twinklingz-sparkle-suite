import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Heart, Minus, Plus, ShieldCheck, Truck, PackageCheck, Star, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LazyImage } from "@/components/ui/lazy-image";
import { optimizePdpHeroUrl } from "@/lib/cloudinary-url";
import { ProductCard } from "@/components/product-card";
import { formatPrice, products as staticProducts, type Product } from "@/lib/catalog";
import { moreFromCatalog, peopleAlsoSee, similarProducts } from "@/lib/product-recommendations";
import { categoryToSlug, fetchProductBySlug, usePublicProducts } from "@/lib/use-public-products";
import { RETURN_REFUND_POLICY } from "@/lib/cms-settings";
import { useStore } from "@/components/store-provider";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => fetchProductBySlug(params.slug),
  head: ({ params }) => {
    const p = staticProducts.find((x) => x.slug === params.slug);
    const name = p?.name ?? "Jewellery";
    return {
      meta: [
        { title: `${name} | Twinklingz` },
        { name: "description", content: `Discover ${name}, premium fashion jewellery by Twinklingz.` },
        { property: "og:title", content: `${name} | Twinklingz` },
        { property: "og:description", content: "Elegant fashion jewellery for your moments." },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Page,
});

function Page() {
  const { slug } = Route.useParams();
  const loaderProduct = Route.useLoaderData();
  const { data: catalog = staticProducts } = usePublicProducts();
  const product = catalog.find((p) => p.slug === slug) ?? loaderProduct;
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const navigate = useNavigate();
  const { addToBag, toggleWishlist, wishlist, trackRecentlyViewed, recentlyViewed } = useStore();

  useEffect(() => {
    if (product?.slug) trackRecentlyViewed(product.slug);
  }, [product?.slug, trackRecentlyViewed]);

  useEffect(() => {
    setActiveImage(0);
  }, [product?.id]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const fromArray = (product.images ?? []).filter(Boolean);
    if (fromArray.length > 0) return [...new Set(fromArray)];
    return [...new Set([product.image, product.altImage].filter(Boolean))];
  }, [product]);

  const similar = useMemo(() => {
    if (!product) return [];
    return similarProducts(catalog, product, 4);
  }, [catalog, product]);

  const alsoSee = useMemo(() => {
    if (!product) return [];
    const picked = peopleAlsoSee(catalog, product, similar.map((p) => p.slug), 4);
    if (picked.length >= 4) return picked;
    const extra = moreFromCatalog(
      catalog,
      product,
      [...similar.map((p) => p.slug), ...picked.map((p) => p.slug)],
      4 - picked.length,
    );
    return [...picked, ...extra];
  }, [catalog, product, similar]);

  const similarDisplay = useMemo(() => {
    if (!product || similar.length > 0) return similar;
    return moreFromCatalog(catalog, product, [], 4);
  }, [catalog, product, similar]);

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 pb-24 pt-36 text-center">
        <h1 className="font-display text-4xl">Product not found</h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          This style may have been updated. Browse the full collection to find your sparkle.
        </p>
        <Button asChild className="mt-8">
          <Link to="/shop">SHOP ALL JEWELLERY</Link>
        </Button>
      </main>
    );
  }

  const hero = gallery[activeImage] ?? gallery[0];
  const recentProducts = recentlyViewed
    .map((s) => catalog.find((p) => p.slug === s))
    .filter((p): p is (typeof catalog)[0] => Boolean(p) && p.slug !== product.slug)
    .slice(0, 4);

  const categorySlug = categoryToSlug(product.category);
  const reviewLabel =
    product.reviews > 0 ? `${product.reviews} review${product.reviews === 1 ? "" : "s"}` : "New arrival";

  function addToCart() {
    for (let i = 0; i < qty; i++) addToBag(product);
  }

  return (
    <main className="min-h-screen bg-background pb-28 pt-24 sm:pt-28 md:pt-32">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <nav className="mb-6 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <Link to="/collections/$slug" params={{ slug: categorySlug }} className="hover:text-foreground">
            {product.category}
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{product.sku}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start lg:gap-12 xl:gap-16">
          <div className="w-full min-w-0 lg:max-w-xl xl:max-w-2xl">
            <ProductImageGallery
              name={product.name}
              gallery={gallery}
              hero={hero}
              activeImage={activeImage}
              onSelect={setActiveImage}
              onZoom={() => setZoomOpen(true)}
            />
          </div>

          <div className="min-w-0 lg:sticky lg:top-28 lg:max-w-lg lg:self-start">
            <div className="space-y-6">
              <header>
                <p className="text-sm font-medium text-accent">{product.category}</p>
                <h1 className="mt-2 font-display text-3xl leading-tight text-foreground sm:text-[2rem]">
                  {product.name}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">SKU {product.sku}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 text-foreground">
                    <Star className="size-4 fill-accent text-accent" aria-hidden />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                  <span aria-hidden>·</span>
                  <span>{reviewLabel}</span>
                </div>
              </header>

              <div className="border-y border-border py-5">
                <p className="text-3xl font-semibold tracking-tight">{formatPrice(product.price)}</p>
                <p className="mt-1 text-sm text-muted-foreground">Inclusive of all taxes</p>
              </div>

              <div className="rounded-lg border border-border bg-secondary/40 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex h-11 w-fit items-center rounded-md border border-border bg-background">
                    <Button variant="ghost" size="icon" className="size-11" onClick={() => setQty(Math.max(1, qty - 1))}>
                      <Minus className="size-4" />
                    </Button>
                    <span className="min-w-10 text-center text-sm font-medium">{qty}</span>
                    <Button variant="ghost" size="icon" className="size-11" onClick={() => setQty(qty + 1)}>
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <Button className="h-11 flex-1 text-sm font-semibold tracking-wide" onClick={addToCart}>
                    Add to bag
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-11 shrink-0"
                    onClick={() => toggleWishlist(product.slug)}
                    aria-label="Save to wishlist"
                  >
                    <Heart className={wishlist.includes(product.slug) ? "fill-accent text-accent" : ""} />
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="mt-3 h-11 w-full border-primary/30 text-sm font-semibold"
                  onClick={() => {
                    addToCart();
                    navigate({ to: "/checkout" });
                  }}
                >
                  Buy now
                </Button>
              </div>

              <ul className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-4 text-center text-[11px] leading-snug text-muted-foreground">
                <li>
                  <ShieldCheck className="mx-auto mb-2 size-5 text-foreground" />
                  Secure payment
                </li>
                <li>
                  <PackageCheck className="mx-auto mb-2 size-5 text-foreground" />
                  Careful packing
                </li>
                <li>
                  <Truck className="mx-auto mb-2 size-5 text-foreground" />
                  Order tracking
                </li>
              </ul>

              <div className="divide-y divide-border rounded-lg border border-border">
                <PdpAccordion title="About this piece">
                  Premium fashion jewellery from Twinklingz. Photos show the exact style {product.sku} — multiple
                  angles are available in the gallery above.
                </PdpAccordion>
                <PdpAccordion title="Shipping & delivery">
                  Orders are packed with care. You will receive tracking details by SMS and email after your order is
                  confirmed.
                </PdpAccordion>
                <PdpAccordion title="Sales policy">{RETURN_REFUND_POLICY}</PdpAccordion>
              </div>
            </div>
          </div>
        </div>
      </div>

      {similarDisplay.length > 0 ? (
        <ProductRecommendations
          title="Similar products"
          subtitle={
            similar.length > 0
              ? `More ${product.category.toLowerCase()} you might love`
              : "More styles picked for you"
          }
          products={similarDisplay}
          className="mt-16 border-t border-border"
        />
      ) : null}

      {alsoSee.length > 0 ? (
        <ProductRecommendations
          title="People also see"
          subtitle="Trending picks from across the collection"
          products={alsoSee}
          className="border-t border-border bg-secondary"
        />
      ) : null}

      {recentProducts.length > 0 ? (
        <ProductRecommendations
          title="Recently viewed"
          products={recentProducts}
          className="border-t border-border"
        />
      ) : null}
      <div className="fixed inset-x-0 bottom-16 z-30 flex gap-2 border-t border-border bg-background p-3 md:hidden">
        <Button className="flex-1" onClick={() => addToBag(product)}>
          ADD TO BAG · {formatPrice(product.price)}
        </Button>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent
          className="flex max-h-[92vh] w-[min(calc(100vw-1.5rem),48rem)] items-center justify-center border-none bg-black/85 p-3 shadow-none sm:p-6"
        >
          <LazyImage
            src={optimizePdpHeroUrl(hero, 1400)}
            alt={product.name}
            optimizeWidth={1400}
            priority
            className="max-h-[85vh] w-full max-w-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}

function ProductRecommendations({
  title,
  subtitle,
  products,
  className = "",
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-6xl px-4 py-16 lg:px-8 ${className}`}>
      <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function PdpAccordion({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group px-4 py-4">
      <summary className="cursor-pointer list-none text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-2">
          {title}
          <span className="text-muted-foreground transition group-open:rotate-45">+</span>
        </span>
      </summary>
      <p className="pt-3 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </details>
  );
}

function ProductImageGallery({
  name,
  gallery,
  hero,
  activeImage,
  onSelect,
  onZoom,
}: {
  name: string;
  gallery: string[];
  hero: string;
  activeImage: number;
  onSelect: (index: number) => void;
  onZoom: () => void;
}) {
  const multi = gallery.length > 1;
  const heroSrc = optimizePdpHeroUrl(hero, 1100);

  return (
    <section className="space-y-3" aria-label="Product images">
      <div className="flex gap-3 sm:gap-4">
        {multi && (
          <div
            className="hidden max-h-[min(72vw,36rem)] shrink-0 flex-col gap-2 overflow-y-auto sm:flex"
            aria-label="Image thumbnails"
          >
            {gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => onSelect(i)}
                className={`size-14 shrink-0 overflow-hidden rounded-md border-2 bg-secondary/30 transition ${
                  activeImage === i
                    ? "border-primary shadow-sm"
                    : "border-transparent opacity-80 hover:border-border hover:opacity-100"
                }`}
              >
                <LazyImage
                  src={optimizePdpHeroUrl(src, 160)}
                  alt={`${name} view ${i + 1}`}
                  optimizeWidth={160}
                  width={56}
                  height={70}
                  className="size-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onZoom}
          className="group relative aspect-[4/5] w-full min-w-0 overflow-hidden rounded-xl border border-border/80 bg-gradient-to-b from-secondary/50 to-secondary/20 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          aria-label="Zoom product image"
        >
          <LazyImage
            src={heroSrc}
            alt={name}
            optimizeWidth={1100}
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="absolute inset-0 size-full object-cover object-[center_22%] transition duration-500 ease-out group-hover:scale-[1.02]"
          />
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100"
            aria-hidden
          />
          {multi && (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium tabular-nums text-foreground shadow-sm backdrop-blur-sm">
              {activeImage + 1} / {gallery.length}
            </span>
          )}
          <span
            className="absolute bottom-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur-sm opacity-0 transition group-hover:opacity-100"
            aria-hidden
          >
            <ZoomIn className="size-4" />
          </span>
        </button>
      </div>

      {multi && (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden" aria-label="Image thumbnails">
          {gallery.map((src, i) => (
            <button
              key={`m-${src}-${i}`}
              type="button"
              onClick={() => onSelect(i)}
              className={`size-16 shrink-0 overflow-hidden rounded-md border-2 ${
                activeImage === i ? "border-primary" : "border-border"
              }`}
            >
              <LazyImage
                src={optimizePdpHeroUrl(src, 160)}
                alt={`${name} view ${i + 1}`}
                optimizeWidth={160}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onZoom}
        className="flex w-full items-center justify-center gap-1.5 rounded-md py-1 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <ZoomIn className="size-3.5" />
        Tap for full-screen view
      </button>
    </section>
  );
}
