import { LazyImage } from "@/components/ui/lazy-image";
import { DIWALI_SALE } from "@/lib/promotions";
import { cn } from "@/lib/utils";

/** Native file size — must match `public/promotions/diwali-festive-sale.jpg` for correct aspect ratio. */
const BANNER_WIDTH = 1024;
const BANNER_HEIGHT = 571;

type DiwaliBannerImageProps = {
  className?: string;
  priority?: boolean;
};

/** Full artwork, no crop — scales to container width, height follows aspect ratio. */
export function DiwaliBannerImage({ className, priority = false }: DiwaliBannerImageProps) {
  return (
    <LazyImage
      src={DIWALI_SALE.bannerSrc}
      alt="Twinklingz Diwali Festive Sale — Flat 25% off on all products"
      optimizeWidth={BANNER_WIDTH}
      width={BANNER_WIDTH}
      height={BANNER_HEIGHT}
      priority={priority}
      sizes="(max-width: 1500px) 100vw, 1500px"
      className={cn("mx-auto block h-auto w-full max-w-full align-middle", className)}
      style={{ maxHeight: "none" }}
    />
  );
}
