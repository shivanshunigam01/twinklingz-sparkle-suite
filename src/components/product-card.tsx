import { useEffect, useMemo, useState } from "react";
import { Heart, Images, ShoppingBag, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import {
  ProductImageSliderDialog,
  productGalleryCount,
} from "@/components/product-image-slider-dialog";
import { formatPrice, type Product } from "@/lib/catalog";
import { productGalleryUrls } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import { useStore } from "@/components/store-provider";

const HOVER_SLIDE_MS = 1600;

function ProductCardHoverGallery({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const images = useMemo(() => productGalleryUrls(product), [product]);
  const [index, setIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const multi = images.length > 1;

  useEffect(() => {
    if (!hovering || !multi) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, HOVER_SLIDE_MS);
    return () => window.clearInterval(id);
  }, [hovering, multi, images.length]);

  function handleEnter() {
    setHovering(true);
  }

  function handleLeave() {
    setHovering(false);
    setIndex(0);
  }

  const imageClass =
    "absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]";

  return (
    <div className="relative h-full w-full" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {images.map((src, i) => (
        <LazyImage
          key={src}
          src={src}
          alt={i === 0 ? product.name : ""}
          optimizeWidth={400}
          width={400}
          height={500}
          priority={priority && i === 0}
          sizes="(max-width: 768px) 50vw, 280px"
          className={cn(
            imageClass,
            multi ? (i === index ? "z-[1] opacity-100" : "z-0 opacity-0") : "opacity-100",
          )}
        />
      ))}
      {multi && hovering && (
        <div
          className="pointer-events-none absolute bottom-2 left-1/2 z-[2] flex -translate-x-1/2 gap-1"
          aria-hidden
        >
          {images.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === index ? "w-3 bg-background" : "w-1 bg-background/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductCard({
  product,
  showRating = false,
  priority = false,
}: {
  product: Product;
  showRating?: boolean;
  priority?: boolean;
}) {
  const { addToBag, toggleWishlist, wishlist } = useStore();
  const wished = wishlist.includes(product.slug);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const photoCount = productGalleryCount(product);
  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          aria-label={`View ${product.name}`}
          className="relative block h-full w-full"
        >
          <ProductCardHoverGallery product={product} priority={priority} />
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 bg-primary px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-primary-foreground">
            {product.badge}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 bg-background/85"
          onClick={() => toggleWishlist(product.slug)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={wished ? "fill-accent text-accent" : ""} />
        </Button>
        {photoCount > 0 && (
          <button
            type="button"
            className="absolute bottom-3 left-3 z-10 flex cursor-pointer items-center gap-1 rounded-sm bg-background/90 px-2 py-1 text-[10px] font-medium shadow-sm transition hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setGalleryOpen(true);
            }}
            aria-label={`View all ${photoCount} photos of ${product.name}`}
          >
            <Images className="size-3" /> {photoCount}
          </button>
        )}
        <ProductImageSliderDialog product={product} open={galleryOpen} onOpenChange={setGalleryOpen} />
        <Button
          className="absolute bottom-3 right-3 translate-y-3 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100"
          onClick={() => addToBag(product)}
        >
          <ShoppingBag /> Quick Add
        </Button>
      </div>
      <div className="pt-4">
        {showRating && (
          <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-accent text-accent" /> {product.rating}{" "}
            <span>({product.reviews})</span>
          </div>
        )}
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="font-display text-lg text-foreground hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="mt-1 text-sm">
          <strong>{formatPrice(product.price)}</strong>
        </div>
        <Button className="mt-3 w-full md:hidden" onClick={() => addToBag(product)}>
          Quick Add
        </Button>
      </div>
    </article>
  );
}
