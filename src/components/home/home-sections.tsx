import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, CreditCard, Gem, Gift, HeartHandshake, PackageCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { SOCIAL, STORY_COPY } from "@/lib/cms-settings";
import {
  categoryHeroImage,
  categoryNames,
  formatPrice,
  galleryImages,
  media,
  products,
} from "@/lib/catalog";
import { SectionHeading } from "@/components/home/section-heading";
import { useStore } from "@/components/store-provider";

export function CategorySection() {
  return (
    <section className="bg-background px-5 py-24 lg:px-10">
      <SectionHeading eyebrow="DISCOVER" title="Shop by Category" />
      <div className="no-scrollbar mx-auto flex max-w-7xl snap-x gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-6">
        {categoryNames.map((name) => {
          const body = (
            <>
              <img
                src={categoryHeroImage(name)}
                alt={`${name} sample collection`}
                width={1536}
                height={1024}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-card-shade" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-primary-foreground">
                <h3 className="font-display text-2xl">{name}</h3>
                <span className="mt-2 flex items-center gap-2 text-[10px] tracking-[0.16em] opacity-0 transition group-hover:opacity-100">
                  EXPLORE COLLECTION <ArrowRight className="size-3" />
                </span>
              </div>
            </>
          );
          const cls =
            "group relative aspect-[3/4] min-w-[72vw] snap-start overflow-hidden sm:min-w-[40vw] lg:min-w-0";
          return name === "New Arrivals" ? (
            <Link key={name} to="/new-arrivals" className={cls}>
              {body}
            </Link>
          ) : (
            <Link
              key={name}
              to="/collections/$slug"
              params={{ slug: name.toLowerCase().replaceAll(" ", "-") }}
              className={cls}
            >
              {body}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function NewArrivalsSection() {
  return (
    <section className="bg-secondary px-5 py-24 lg:px-10">
      <SectionHeading
        eyebrow="NEW ARRIVALS"
        title="Just In ✨"
        subtitle="Fresh sparkle, made for your next moment."
      />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-6">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <Button asChild variant="outline">
          <Link to="/new-arrivals">
            VIEW ALL NEW ARRIVALS <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function CampaignSection() {
  return (
    <section className="relative min-h-[75vh] overflow-hidden">
      <img
        src={media.campaignImage}
        alt="Rose gold statement jewellery on burgundy velvet"
        width={1536}
        height={1024}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-campaign-shade" />
      <div className="relative mx-auto flex min-h-[75vh] max-w-7xl items-center px-6 text-primary-foreground">
        <div className="max-w-lg">
          <p className="text-xs tracking-[0.25em] text-champagne">THE OCCASION EDIT</p>
          <h2 className="mt-4 font-display text-5xl sm:text-7xl">Made to be noticed.</h2>
          <p className="mt-5 leading-7 text-primary-foreground/80">
            Discover jewellery that turns everyday moments into something extraordinary.
          </p>
          <Button asChild className="mt-8 bg-primary-foreground text-primary">
            <Link to="/collections">SHOP THE EDIT</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function BestsellersSection() {
  return (
    <section className="bg-background py-24">
      <SectionHeading eyebrow="LOVED BY OUR CUSTOMERS" title="Most Loved" />
      <div className="no-scrollbar flex snap-x gap-5 overflow-x-auto px-5 lg:px-[max(2.5rem,calc((100vw-80rem)/2))]">
        {products.slice(1, 7).map((p) => (
          <div className="min-w-[72vw] snap-start sm:min-w-[40vw] lg:min-w-[280px]" key={p.id}>
            <ProductCard product={p} showRating />
          </div>
        ))}
      </div>
    </section>
  );
}

export function ShopTheLookSection() {
  const [active, setActive] = useState(0);
  const { addToBag } = useStore();
  const lookProducts = products.slice(0, 4);
  const hotspots = [
    { x: "28%", y: "25%", product: lookProducts[0] },
    { x: "43%", y: "47%", product: lookProducts[1] },
    { x: "42%", y: "79%", product: lookProducts[2] },
    { x: "30%", y: "82%", product: lookProducts[3] },
  ].filter((h): h is { x: string; y: string; product: (typeof lookProducts)[0] } =>
    Boolean(h.product),
  );
  const selected = hotspots[active]?.product ?? lookProducts[0];
  if (!selected) return null;

  return (
    <section className="grid bg-secondary lg:grid-cols-[1.35fr_0.65fr]">
      <div className="relative">
        <img
          src={media.lookImage}
          alt="Model wearing the Twinklingz occasion edit"
          width={1536}
          height={1024}
          loading="lazy"
          className="h-full min-h-[560px] w-full object-cover"
        />
        {hotspots.map((h, i) => (
          <button
            key={h.product.id}
            type="button"
            aria-label={`View ${h.product.name}`}
            onClick={() => setActive(i)}
            className="absolute flex size-8 items-center justify-center rounded-full border border-primary-foreground bg-primary/85 text-primary-foreground shadow-lg"
            style={{ left: h.x, top: h.y }}
          >
            <Plus className="size-4" />
          </button>
        ))}
      </div>
      <div className="flex items-center p-8 lg:p-14">
        <div>
          <p className="text-xs tracking-[0.24em] text-accent">SHOP THE LOOK</p>
          <h2 className="mt-4 font-display text-5xl">The celebration edit</h2>
          <p className="mt-5 text-muted-foreground">
            Tap the details to discover every piece in this curated look.
          </p>
          <div className="mt-10 border-y border-border py-6">
            <p className="font-display text-2xl">{selected.name}</p>
            <p className="mt-1">{formatPrice(selected.price)}</p>
            <div className="mt-5 flex gap-3">
              <Button onClick={() => addToBag(selected)}>ADD TO BAG</Button>
              <Button asChild variant="outline">
                <Link to="/products/$slug" params={{ slug: selected.slug }}>
                  VIEW PRODUCT
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EditSection() {
  const edits = [
    "Everyday Elegance",
    "Date Night",
    "Festive Sparkle",
    "Statement Pieces",
    "Minimal Muse",
    "Gifting",
  ];
  return (
    <section className="bg-background px-5 py-24 lg:px-10">
      <SectionHeading eyebrow="CURATED FOR YOU" title="The Twinklingz Edit" />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 md:grid-cols-4">
        {edits.map((e, i) => (
          <Link
            to="/collections"
            key={e}
            className={`group relative overflow-hidden ${i === 0 || i === 5 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"}`}
          >
            <img
              src={products[i % products.length]?.image ?? media.campaignImage}
              alt={`${e} sample edit`}
              loading="lazy"
              width={1536}
              height={1024}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-card-shade" />
            <h3 className="absolute bottom-5 left-5 font-display text-2xl text-primary-foreground sm:text-3xl">
              {e}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BrandStorySection() {
  return (
    <section className="grid bg-blush lg:grid-cols-2">
      <img
        src={media.storyImage}
        alt="Twinklingz brand story"
        width={1536}
        height={1024}
        loading="lazy"
        className="h-full min-h-[480px] w-full object-cover"
      />
      <div className="flex items-center px-6 py-20 lg:px-20">
        <div className="max-w-xl">
          <p className="text-xs tracking-[0.25em] text-accent">ABOUT TWINKLINGZ</p>
          <h2 className="mt-4 font-display text-5xl">{STORY_COPY.headline}</h2>
          <p className="mt-6 whitespace-pre-line leading-8 text-muted-foreground">{STORY_COPY.body}</p>
          <p className="mt-7 font-script text-3xl text-primary">{STORY_COPY.highlight}</p>
          <Button asChild variant="outline" className="mt-8">
            <Link to="/about">OUR STORY</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function WhyTwinklingzSection() {
  const items = [
    [Gem, "Premium Designs"],
    [HeartHandshake, "Carefully Curated"],
    [CreditCard, "Secure Payments"],
    [PackageCheck, "Quality Focused"],
    [Gift, "Thoughtful Packaging"],
  ] as const;
  return (
    <section className="bg-background px-5 py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 text-center md:grid-cols-5">
        {items.map(([Icon, label]) => (
          <div key={label}>
            <Icon className="mx-auto size-7 stroke-1 text-accent" />
            <p className="mt-4 font-display text-lg">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SocialSection() {
  return (
    <section className="bg-secondary px-5 py-24">
      <SectionHeading eyebrow="WEAR IT · STYLE IT · MAKE IT YOURS" title={SOCIAL.instagramHandle} />
      <p className="-mt-6 mb-10 text-center text-sm text-muted-foreground">Wear it. Style it. Make it yours.</p>
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {galleryImages.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt={`Twinklingz style inspiration ${i + 1}`}
            width={600}
            height={600}
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <a href={SOCIAL.instagramUrl} target="_blank" rel="noopener noreferrer">
            FOLLOW OUR JOURNEY
          </a>
        </Button>
      </div>
    </section>
  );
}

export function NewsletterSection() {
  return (
    <section className="bg-primary px-5 py-20 text-center text-primary-foreground">
      <p className="font-script text-2xl text-champagne">An invitation to sparkle</p>
      <h2 className="mt-3 font-display text-5xl">Join the Twinklingz Circle</h2>
      <p className="mx-auto mt-4 max-w-xl text-primary-foreground/70">
        Be the first to discover new drops, exclusive collections and special offers.
      </p>
      <form
        className="mx-auto mt-8 flex max-w-xl border-b border-primary-foreground/50"
        onSubmit={(e) => e.preventDefault()}
      >
        <input
          type="email"
          required
          placeholder="Your email address"
          className="w-full bg-transparent px-2 py-4 outline-none placeholder:text-primary-foreground/50"
        />
        <Button type="submit" variant="ghost" className="text-primary-foreground">
          JOIN NOW <ArrowRight />
        </Button>
      </form>
    </section>
  );
}
