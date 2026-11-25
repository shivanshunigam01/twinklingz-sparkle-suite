import { Link } from "@tanstack/react-router";
import { LazyImage } from "@/components/ui/lazy-image";
import { DEFAULT_OFFER_BANNER_DESKTOP, DEFAULT_OFFER_BANNER_MOBILE } from "@/lib/cms-settings";
import { SITE_SALE } from "@/lib/promotions";
import { useSiteSettings } from "@/lib/use-site-settings";

function OfferBannerLink({
  src,
  alt,
  optimizeWidth,
  width,
  height,
  sizes,
  className,
}: {
  src: string;
  alt: string;
  optimizeWidth: number;
  width: number;
  height: number;
  sizes: string;
  className?: string;
}) {
  return (
    <Link
      to="/shop"
      className="block overflow-hidden rounded-sm ring-offset-background transition hover:opacity-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <LazyImage
        src={src}
        alt={alt}
        optimizeWidth={optimizeWidth}
        width={width}
        height={height}
        sizes={sizes}
        className={className ?? "mx-auto block h-auto w-full max-w-full"}
      />
    </Link>
  );
}

/** Promo strip below the hero — portrait on phones, landscape on tablet/desktop. */
export function PromoOfferSection() {
  const { data: settings } = useSiteSettings();
  const desktopSrc = settings.offerBannerImage?.trim() || DEFAULT_OFFER_BANNER_DESKTOP;
  const mobileSrc =
    settings.offerBannerImageMobile?.trim() || settings.offerBannerImage?.trim() || DEFAULT_OFFER_BANNER_MOBILE;

  if (!SITE_SALE.active) return null;

  const alt = `Twinklingz ${SITE_SALE.shortLabel} on all orders — shop jewellery`;
  const aria = `${SITE_SALE.label} — ${SITE_SALE.shortLabel}`;

  return (
    <>
      {mobileSrc ? (
        <section className="bg-secondary py-6 md:hidden" aria-label={aria}>
          <div className="mx-auto max-w-lg px-4">
            <OfferBannerLink
              src={mobileSrc}
              alt={alt}
              optimizeWidth={800}
              width={600}
              height={900}
              sizes="100vw"
            />
          </div>
        </section>
      ) : null}

      {desktopSrc ? (
        <section className="hidden bg-secondary py-8 md:block md:py-10" aria-label={aria}>
          <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
            <OfferBannerLink
              src={desktopSrc}
              alt={alt}
              optimizeWidth={1600}
              width={1500}
              height={420}
              sizes="(min-width: 1024px) 1500px, 100vw"
            />
          </div>
        </section>
      ) : null}
    </>
  );
}