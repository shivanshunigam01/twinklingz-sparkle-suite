import { formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import { DIWALI_SALE, hasPromoDiscount } from "@/lib/promotions";
import { cn } from "@/lib/utils";

type ProductPriceProps = {
  product: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
};

export function ProductPrice({ product, className, size = "sm" }: ProductPriceProps) {
  const onSale = hasPromoDiscount(product);
  const priceClass =
    size === "lg" ? "text-3xl font-semibold tracking-tight" : size === "md" ? "text-lg font-semibold" : "text-sm";

  if (!onSale) {
    return <strong className={cn(priceClass, className)}>{formatPrice(product.price)}</strong>;
  }

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      <strong className={cn(priceClass, "text-primary")}>{formatPrice(product.price)}</strong>
      <span className="text-muted-foreground line-through">{formatPrice(product.mrp!)}</span>
      {DIWALI_SALE.active && (
        <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-accent">
          {DIWALI_SALE.shortLabel}
        </span>
      )}
    </div>
  );
}
