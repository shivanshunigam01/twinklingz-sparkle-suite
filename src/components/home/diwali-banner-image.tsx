import { LazyImage } from "@/components/ui/lazy-image";
import { DIWALI_SALE } from "@/lib/promotions";
import { cn } from "@/lib/utils";

const FALLBACK_WIDTH = 1024;
const FALLBACK_HEIGHT = 571;

type DiwaliBannerImageProps = {
  src?: string;
  className?: string;
  priority?: boolean;
};

/** Full artwork, no crop — scales to container width, height follows aspect ratio. */
export function DiwaliBannerImage({ src, className, priority = false }: DiwaliBannerImageProps) {
  const displaySrc = src?.trim() || DIWALI_SALE.bannerSrc;

  return (
    <LazyImage
      src={displaySrc}
      alt="Twinklingz Diwali Festive Sale — Flat 25% off on all products"
      optimizeWidth={1400}
      width={FALLBACK_WIDTH}
      height={FALLBACK_HEIGHT}
      priority={priority}
      sizes="(max-width: 1500px) 100vw, 1500px"
      className={cn("mx-auto block h-auto w-full max-w-full align-middle", className)}
      style={{ maxHeight: "none" }}
    />
  );
}
