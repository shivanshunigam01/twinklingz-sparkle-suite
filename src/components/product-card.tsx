import { Heart, Images, ShoppingBag, Star } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
export function ProductCard({ product, showRating = false }: { product: Product; showRating?: boolean }) {
  const { addToBag, toggleWishlist, wishlist } = useStore();
  const wished = wishlist.includes(product.id);
  const discount = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  return <article className="group min-w-0">
    <div className="relative aspect-[4/5] overflow-hidden bg-muted">
      <Link to="/products/$slug" params={{ slug: product.slug }} aria-label={`View ${product.name}`}>
        <img src={product.image} alt={product.name} width={800} height={1000} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03] group-hover:opacity-0" />
        <img src={product.altImage} alt="" width={800} height={1000} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100" />
      </Link>
      {product.badge && <span className="absolute left-3 top-3 bg-primary px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-primary-foreground">{product.badge}</span>}
      <Button variant="ghost" size="icon" className="absolute right-2 top-2 bg-background/85" onClick={() => toggleWishlist(product.id)} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}><Heart className={wished ? "fill-accent text-accent" : ""} /></Button>
      <span className="absolute bottom-3 left-3 flex items-center gap-1 bg-background/80 px-2 py-1 text-[10px]"><Images className="size-3" /> {product.images.length}</span>
      <Button className="absolute bottom-3 right-3 translate-y-3 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100" onClick={() => addToBag(product)}><ShoppingBag /> Quick Add</Button>
    </div>
    <div className="pt-4">
      {showRating && <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground"><Star className="size-3 fill-accent text-accent" /> {product.rating} <span>({product.reviews})</span></div>}
      <Link to="/products/$slug" params={{ slug: product.slug }} className="font-display text-lg text-foreground hover:text-primary">{product.name}</Link>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm"><strong>{formatPrice(product.price)}</strong>{product.mrp && <><span className="text-muted-foreground line-through">{formatPrice(product.mrp)}</span><span className="text-accent-foreground">{discount}% off</span></>}</div>
      <Button className="mt-3 w-full md:hidden" onClick={() => addToBag(product)}>Quick Add</Button>
    </div>
  </article>;
}
