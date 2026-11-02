import { formatPrice } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import {
  DIWALI_SALE,
  getOfferPrice,
  getOriginalListPrice,
  hasPromoDiscount,
  promoSavings,
} from "@/lib/promotions";
import { cn } from "@/lib/utils";

type ProductPriceProps = {
  product: Product;
  className?: string;
  size?: "sm" | "md" | "lg";
  layout?: "inline" | "stacked";
};

export function ProductPrice({
  product,
  className,
  size = "sm",
  layout = "stacked",
}: ProductPriceProps) {
  const onSale = hasPromoDiscount(product);
  const offer = getOfferPrice(product);
  const original = getOriginalListPrice(product);
  const savings = promoSavings(product);

  const offerClass =
    size === "lg"
      ? "text-3xl font-semibold tracking-tight text-primary"
      : size === "md"
        ? "text-lg font-semibold text-primary"
        : "text-sm font-semibold text-primary";

  const mrpClass =
    size === "lg" ? "text-base text-muted-foreground" : "text-xs sm:text-sm text-muted-foreground";

  if (!onSale) {
    return (
      <strong
        className={cn(
          size === "lg" ? "text-3xl font-semibold tracking-tight" : size === "md" ? "text-lg font-semibold" : "text-sm",
          className,
        )}
      >
        {formatPrice(offer)}
      </strong>
    );
  }

  if (layout === "inline") {
    return (
      <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
        <span className={cn(mrpClass, "line-through decoration-2")}>{formatPrice(original)}</span>
        <strong className={offerClass}>{formatPrice(offer)}</strong>
        <span className="rounded-sm bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
          {DIWALI_SALE.shortLabel}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div className={cn("flex flex-wrap items-baseline gap-x-2", mrpClass)}>
        <span className="uppercase tracking-wide">M.R.P.</span>
        <span className="line-through decoration-2">{formatPrice(original)}</span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Deal price</span>
        <strong className={offerClass}>{formatPrice(offer)}</strong>
      </div>
      <p className="text-xs font-medium text-emerald-800">
        You save {formatPrice(savings)} ({DIWALI_SALE.percentOff}% off)
      </p>
    </div>
  );
}
