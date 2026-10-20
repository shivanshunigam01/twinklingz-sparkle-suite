import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import founderPortrait from "@/assets/priya-kaur-founder.jpg";
import { galleryImages } from "@/lib/catalog";
import { BRAND, FOUNDER_STORY } from "@/lib/cms-settings";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us | Twinklingz By Priya Kaur" },
      {
        name: "description",
        content:
          "The story behind Twinklingz By Priya Kaur — a journey of purpose, passion, and sparkle. Premium fashion jewellery curated with heart.",
      },
      { property: "og:title", content: "About Us | Twinklingz By Priya Kaur" },
      {
        property: "og:description",
        content: FOUNDER_STORY.subtitle,
      },
      { property: "og:image", content: founderPortrait },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { title, subtitle, paragraphs, signOff, tagline } = FOUNDER_STORY;

  return (
    <main className="min-h-screen bg-background pb-24 pt-36 sm:pt-40">
      <div className="mx-auto max-w-6xl px-5 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-32">
            <LazyImage
              src={founderPortrait}
              alt="Priya Kaur, Founder of Twinklingz By Priya Kaur"
              optimizeWidth={800}
              width={800}
              height={1000}
              priority
              className="aspect-[4/5] w-full object-cover"
            />
            <p className="mt-4 text-center text-sm text-muted-foreground lg:text-left">
              {signOff.name} · {signOff.role}
            </p>
          </div>

          <article>
            <p className="text-xs font-semibold tracking-[.24em] text-accent">{BRAND.name.toUpperCase()}</p>
            <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">{title}</h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">{subtitle}</p>

            <div className="mt-10 space-y-6 border-t border-border pt-10">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-[1.05rem]">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-12 border-t border-border pt-10">
              <p className="text-muted-foreground">{signOff.closing}</p>
              <p className="mt-2 font-display text-2xl text-foreground">{signOff.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{signOff.role}</p>
              <p className="mt-8 font-script text-3xl text-primary sm:text-4xl">{tagline}</p>
            </div>

            <Button className="mt-10" asChild>
              <Link to="/shop">Explore the collection</Link>
            </Button>
          </article>
        </div>
      </div>

      <div className="mx-auto mt-24 max-w-6xl px-5 lg:px-10">
        <p className="text-center text-xs tracking-[.24em] text-accent">FROM OUR STUDIO</p>
        <h2 className="mt-3 text-center font-display text-4xl">The full sparkle catalog</h2>
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {galleryImages.map((src, i) => (
            <LazyImage
              key={`${src}-${i}`}
              src={src}
              alt={`Twinklingz catalogue ${i + 1}`}
              optimizeWidth={280}
              className="aspect-square w-full object-cover"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
