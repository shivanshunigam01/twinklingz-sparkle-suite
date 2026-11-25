import { Link } from "@tanstack/react-router";
import { LazyImage } from "@/components/ui/lazy-image";
import { DEFAULT_OFFER_BANNER_DESKTOP } from "@/lib/cms-settings";
import { SITE_SALE } from "@/lib/promotions";
import { useSiteSettings } from "@/lib/use-site-settings";

/** Full-width desktop/tablet promo strip below the hero (hidden on phones). */
export function PromoOfferSection() {
  const { data: settings } = useSiteSettings();
  const src = settings.offerBannerImage?.trim() || DEFAULT_OFFER_BANNER_DESKTOP;

  if (!SITE_SALE.active || !src) return null;

  return (
    <section
      className="hidden bg-secondary py-8 md:block md:py-10"
      aria-label={`${SITE_SALE.label} — ${SITE_SALE.shortLabel}`}
    >
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <Link
          to="/shop"
          className="block overflow-hidden rounded-sm ring-offset-background transition hover:opacity-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LazyImage
            src={src}
            alt={`Twinklingz ${SITE_SALE.shortLabel} on all orders — shop jewellery`}
            optimizeWidth={1600}
            width={1500}
            height={420}
            sizes="(min-width: 1024px) 1500px, 100vw"
            className="mx-auto block h-auto w-full max-w-full"
          />
        </Link>
      </div>
    </section>
  );
}