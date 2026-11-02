import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { DIWALI_SALE } from "@/lib/promotions";

export function DiwaliOfferSection() {
  if (!DIWALI_SALE.active) return null;

  return (
    <section className="bg-secondary py-10 sm:py-14" aria-labelledby="diwali-offer-heading">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8">
        <div className="overflow-hidden border border-border bg-background shadow-lg">
          <div className="group relative aspect-[16/9] max-h-[520px] w-full sm:aspect-[21/9]">
              <LazyImage
                src={DIWALI_SALE.bannerSrc}
                alt="Twinklingz Diwali Festive Sale — Flat 25% off on all products"
                optimizeWidth={1400}
                width={1400}
                height={600}
                priority
                className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent sm:bg-gradient-to-r sm:from-primary/40 sm:via-transparent sm:to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                <p className="text-xs tracking-[0.28em] text-primary-foreground/90">LIMITED TIME</p>
                <h2
                  id="diwali-offer-heading"
                  className="mt-2 font-display text-3xl text-primary-foreground sm:text-5xl"
                >
                  Diwali Festive Sale
                </h2>
                <p className="mt-2 font-display text-xl text-champagne sm:text-2xl">{DIWALI_SALE.shortLabel} on all jewellery</p>
                <Button
                  asChild
                  size="lg"
                  className="pointer-events-auto mt-5 bg-primary-foreground text-primary hover:bg-champagne"
                >
                  <Link to="/shop">
                    SHOP THE SALE <ArrowRight className="ml-1 inline size-4" />
                  </Link>
                </Button>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
