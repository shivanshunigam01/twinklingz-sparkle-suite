import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Heart, Minus, Plus, ShieldCheck, Truck, PackageCheck, Star, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LazyImage } from "@/components/ui/lazy-image";
import { ProductCard } from "@/components/product-card";
import { formatPrice, products as staticProducts, type Product } from "@/lib/catalog";
import { peopleAlsoSee, similarProducts } from "@/lib/product-recommendations";
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
  const [finish, setFinish] = useState("Rose Gold");
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
    return peopleAlsoSee(catalog, product, similar.map((p) => p.slug), 4);
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

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
          <div className="w-full lg:w-[min(100%,420px)] lg:shrink-0">
            <ProductImageGallery
              name={product.name}
              gallery={gallery}
              hero={hero}
              activeImage={activeImage}
              onSelect={setActiveImage}
              onZoom={() => setZoomOpen(true)}
            />
          </div>

          <div className="min-w-0 flex-1 lg:sticky lg:top-28 lg:max-w-md lg:self-start">
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
                <p className="text-sm font-medium">Metal finish (display)</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Rose Gold", "Gold", "Silver"].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFinish(v)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        finish === v
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/40"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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

      {similar.length > 0 ? (
        <ProductRecommendations
          title="Similar products"
          subtitle={`More ${product.category.toLowerCase()} you might love`}
          products={similar}
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
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <LazyImage src={hero} alt={product.name} optimizeWidth={1200} priority className="max-h-[85vh] w-full object-contain" />
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

/** Amazon-style: fixed-size thumb strip + compact square main preview. */
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

  const mainSize =
    "h-[240px] w-full max-w-[360px] sm:h-[280px] lg:h-[300px]";

  return (
    <section className="rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4" aria-label="Product images">
      <div className="flex items-stretch gap-3">
        {multi && (
          <div
            className={`flex shrink-0 flex-col gap-2 overflow-y-auto pr-1 ${mainSize}`}
            aria-label="Image thumbnails"
          >
            {gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => onSelect(i)}
                className={`size-[52px] shrink-0 overflow-hidden rounded-md border bg-white p-0.5 transition ${
                  activeImage === i
                    ? "border-primary ring-1 ring-primary/20"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <LazyImage
                  src={src}
                  alt={`${name} view ${i + 1}`}
                  optimizeWidth={120}
                  width={52}
                  height={52}
                  className="size-full rounded-[4px] object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <button
            type="button"
            onClick={onZoom}
            className={`relative flex ${mainSize} items-center justify-center overflow-hidden rounded-lg bg-white`}
            aria-label="Zoom product image"
          >
            <LazyImage
              src={hero}
              alt={name}
              optimizeWidth={900}
              priority
              className="max-h-[92%] max-w-[92%] object-contain"
            />
            {multi && (
              <span className="absolute right-2 top-2 rounded-full bg-foreground/75 px-2 py-0.5 text-[10px] font-medium text-background">
                {activeImage + 1} / {gallery.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onZoom}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
          >
            <ZoomIn className="size-3.5" />
            Click to see full view
          </button>
        </div>
      </div>
    </section>
  );
}
