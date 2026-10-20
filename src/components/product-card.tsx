import { Heart, Images, ShoppingBag, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { formatPrice, type Product } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
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
  const hasAlt = Boolean(product.altImage && product.altImage !== product.image);
  return <article className="group min-w-0">
    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        aria-label={`View ${product.name}`}
        className="relative block h-full w-full"
      >
        <LazyImage
          src={product.image}
          alt={product.name}
          optimizeWidth={400}
          width={400}
          height={500}
          priority={priority}
          sizes="(max-width: 768px) 50vw, 280px"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {hasAlt ? (
          <LazyImage
            src={product.altImage}
            alt=""
            optimizeWidth={400}
            width={400}
            height={500}
            sizes="(max-width: 768px) 50vw, 280px"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
          />
        ) : null}
      </Link>
      {product.badge && <span className="absolute left-3 top-3 bg-primary px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-primary-foreground">{product.badge}</span>}
      <Button variant="ghost" size="icon" className="absolute right-2 top-2 bg-background/85" onClick={() => toggleWishlist(product.slug)} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}><Heart className={wished ? "fill-accent text-accent" : ""} /></Button>
      <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-background/80 px-2 py-1 text-[10px]"><Images className="size-3" /> {product.images.length}</span>
      <Button className="absolute bottom-3 right-3 translate-y-3 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" onClick={() => addToBag(product)}><ShoppingBag /> Quick Add</Button>
    </div>
    <div className="pt-4">
      {showRating && <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground"><Star className="size-3 fill-accent text-accent" /> {product.rating} <span>({product.reviews})</span></div>}
      <Link to="/products/$slug" params={{ slug: product.slug }} className="font-display text-lg text-foreground hover:text-primary">{product.name}</Link>
      <div className="mt-1 text-sm">
        <strong>{formatPrice(product.price)}</strong>
      </div>
      <Button className="mt-3 w-full md:hidden" onClick={() => addToBag(product)}>Quick Add</Button>
    </div>
  </article>;
}
