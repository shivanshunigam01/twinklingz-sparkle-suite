import { LazyImage } from "@/components/ui/lazy-image";
import { optimizeImageUrl } from "@/lib/cloudinary-url";
import { DIWALI_SALE } from "@/lib/promotions";
import { cn } from "@/lib/utils";

type DiwaliBannerImageProps = {
  desktopSrc?: string;
  mobileSrc?: string;
  className?: string;
  priority?: boolean;
};

/** Full artwork on desktop + mobile — uses `<picture>` so only one asset loads per viewport. */
export function DiwaliBannerImage({
  desktopSrc,
  mobileSrc,
  className,
  priority = false,
}: DiwaliBannerImageProps) {
  const desktop = desktopSrc?.trim() || DIWALI_SALE.bannerSrc;
  const mobile = mobileSrc?.trim() || desktop;
  const mobileOptimized = optimizeImageUrl(mobile, 800);

  return (
    <picture className={cn("block w-full", className)}>
      <source media="(max-width: 767px)" srcSet={mobileOptimized} />
      <LazyImage
        src={desktop}
        alt="Twinklingz Diwali Festive Sale — Flat 25% off on all products"
        optimizeWidth={1400}
        width={1024}
        height={571}
        priority={priority}
        sizes="(max-width: 767px) 100vw, (max-width: 1500px) 100vw, 1500px"
        className="mx-auto block h-auto w-full max-w-full align-middle"
        style={{ maxHeight: "none" }}
      />
    </picture>
  );
}
