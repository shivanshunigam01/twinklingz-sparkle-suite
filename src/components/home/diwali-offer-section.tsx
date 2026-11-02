import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiwaliBannerImage } from "@/components/home/diwali-banner-image";
import { DIWALI_SALE } from "@/lib/promotions";
import { useSiteSettings } from "@/lib/use-site-settings";

export function DiwaliOfferSection() {
  const { data: settings } = useSiteSettings();
  const bannerSrc = settings.offerBannerImage?.trim() || DIWALI_SALE.bannerSrc;

  if (!DIWALI_SALE.active) return null;

  return (
    <section className="bg-secondary py-10 sm:py-14" aria-labelledby="diwali-offer-heading">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="border border-border bg-[#2a1510] shadow-lg">
          <DiwaliBannerImage src={bannerSrc} priority />
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border bg-background px-5 py-5 sm:flex-row sm:px-8">
            <div className="text-center sm:text-left">
              <h2 id="diwali-offer-heading" className="font-display text-2xl text-primary sm:text-3xl">
                {DIWALI_SALE.label}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{DIWALI_SALE.shortLabel} on all jewellery</p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link to="/shop">
                SHOP THE SALE <ArrowRight className="ml-1 inline size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
