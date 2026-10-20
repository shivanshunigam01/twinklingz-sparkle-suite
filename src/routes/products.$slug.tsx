import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Heart, Minus, Plus, ShieldCheck, Truck, PackageCheck, Star, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ProductCard } from "@/components/product-card";
import { formatPrice, products as staticProducts } from "@/lib/catalog";
import { fetchProductBySlug, usePublicProducts } from "@/lib/use-public-products";
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
  const completeLook = catalog.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);
  const recentProducts = recentlyViewed
    .map((s) => catalog.find((p) => p.slug === s))
    .filter((p): p is (typeof catalog)[0] => Boolean(p) && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-background pb-28 pt-24 sm:pt-28 md:pt-32">
      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-2">
        <ProductImageGallery
          name={product.name}
          gallery={gallery}
          hero={hero}
          activeImage={activeImage}
          onSelect={setActiveImage}
          onZoom={() => setZoomOpen(true)}
        />
        <div className="p-4 sm:p-6 lg:sticky lg:top-28 lg:h-fit lg:p-10">
          <p className="text-xs tracking-[.2em] text-accent">{product.category.toUpperCase()}</p>
          <p className="mt-2 text-xs text-muted-foreground">Style {product.sku}</p>
          <h1 className="mt-3 font-display text-4xl lg:text-5xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Star className="size-4 fill-accent text-accent" />
            {product.rating}{" "}
            <span className="text-muted-foreground">({product.reviews} reviews)</span>
          </div>
          <div className="mt-6">
            <span className="text-xl font-semibold">{formatPrice(product.price)}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of applicable taxes</p>
          <p className="mt-2 text-xs text-muted-foreground">{RETURN_REFUND_POLICY}</p>
          <div className="mt-8">
            <p className="text-xs font-semibold tracking-widest">FINISH</p>
            <div className="mt-3 flex gap-2">
              {["Rose Gold", "Gold", "Silver"].map((v) => (
                <Button key={v} variant={finish === v ? "default" : "outline"} onClick={() => setFinish(v)}>
                  {v}
                </Button>
              ))}
            </div>
          </div>
          <div className="mt-7 flex items-center gap-3">
            <div className="flex h-11 items-center border border-input">
              <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}>
                <Minus />
              </Button>
              <span className="w-8 text-center">{qty}</span>
              <Button variant="ghost" size="icon" onClick={() => setQty(qty + 1)}>
                <Plus />
              </Button>
            </div>
            <Button
              className="h-11 flex-1"
              onClick={() => {
                for (let i = 0; i < qty; i++) addToBag(product);
              }}
            >
              ADD TO BAG
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11"
              onClick={() => toggleWishlist(product.slug)}
            >
              <Heart className={wishlist.includes(product.slug) ? "fill-accent text-accent" : ""} />
            </Button>
          </div>
          <Button
            variant="outline"
            className="mt-3 h-11 w-full"
            onClick={() => {
              for (let i = 0; i < qty; i++) addToBag(product);
              navigate({ to: "/checkout" });
            }}
          >
            BUY NOW
          </Button>
          <div className="mt-7 grid grid-cols-3 gap-3 border-y border-border py-5 text-center text-[10px]">
            <span>
              <ShieldCheck className="mx-auto mb-2 size-5" />
              Secure Online Payment
            </span>
            <span>
              <PackageCheck className="mx-auto mb-2 size-5" />
              Carefully Packed
            </span>
            <span>
              <Truck className="mx-auto mb-2 size-5" />
              Order Tracking Available
            </span>
          </div>
          {[
            "PRODUCT DETAILS",
            "MATERIAL & CARE",
            "SIZE & DIMENSIONS",
            "SHIPPING",
            "PAYMENT",
            "ALL SALES FINAL",
          ].map((x) => (
            <details key={x} className="border-b border-border py-5">
              <summary className="cursor-pointer text-xs font-semibold tracking-widest">{x}</summary>
              <p className="pt-4 text-sm leading-6 text-muted-foreground">
                {x === "ALL SALES FINAL"
                  ? RETURN_REFUND_POLICY
                  : `Style ${product.sku} — premium fashion jewellery from Twinklingz. Product imagery shows the exact finish and silhouette you receive.`}
              </p>
            </details>
          ))}
        </div>
      </div>

      {completeLook.length > 0 ? (
        <section className="border-t border-border px-5 py-16 lg:px-10">
          <h2 className="font-display text-4xl">Complete the look</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
            {completeLook.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {recentProducts.length > 0 ? (
        <section className="border-t border-border bg-secondary px-5 py-16 lg:px-10">
          <h2 className="font-display text-4xl">Recently viewed</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {recentProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="px-5 py-20 lg:px-10">
        <h2 className="font-display text-4xl">You may also like</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {catalog
            .filter((p) => p.id !== product.id && p.slug !== product.slug)
            .slice(0, 4)
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>
      <div className="fixed inset-x-0 bottom-16 z-30 flex gap-2 border-t border-border bg-background p-3 md:hidden">
        <Button className="flex-1" onClick={() => addToBag(product)}>
          ADD TO BAG · {formatPrice(product.price)}
        </Button>
      </div>

      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <img src={hero} alt={product.name} className="max-h-[85vh] w-full object-contain" />
        </DialogContent>
      </Dialog>
    </main>
  );
}

/** Amazon / Flipkart-style gallery: thumbs + main image fit in viewport without scrolling. */
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

  return (
    <section className="p-4 sm:p-6 lg:p-8 lg:pt-6" aria-label="Product images">
      <div
        className="flex gap-2 sm:gap-3 h-[min(42vh,360px)] sm:h-[min(48vh,440px)] lg:h-[min(72vh,640px)]"
      >
        {multi && (
          <div
            className="flex w-[52px] shrink-0 flex-col gap-1 sm:w-14 sm:gap-1.5 md:w-16"
            aria-label="Image thumbnails"
          >
            {gallery.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => onSelect(i)}
                className={`min-h-0 flex-1 overflow-hidden border bg-muted transition ${
                  activeImage === i
                    ? "border-accent ring-1 ring-accent/50"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <img src={src} alt={`${name} view ${i + 1}`} className="size-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onZoom}
          className="group relative min-w-0 flex-1 overflow-hidden bg-muted"
          aria-label="Zoom product image"
        >
          <img src={hero} alt={name} className="size-full object-contain object-center" />
          <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/90 px-2 py-1 text-[10px] shadow-sm sm:bottom-3 sm:right-3">
            <ZoomIn className="size-3" /> Tap to zoom
          </span>
          {multi && (
            <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] tracking-wide shadow-sm sm:left-3 sm:top-3">
              {activeImage + 1} / {gallery.length}
            </span>
          )}
        </button>
      </div>

    </section>
  );
}
