import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { galleryImages, media } from "@/lib/catalog";
import { STORY_COPY } from "@/lib/cms-settings";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Twinklingz | Twinklingz" },
      {
        name: "description",
        content:
          "Twinklingz brings together elegant, timeless and trend-forward jewellery, thoughtfully curated by Priya Kaur for every style and occasion.",
      },
      { property: "og:title", content: "About Twinklingz | Twinklingz" },
      {
        property: "og:description",
        content:
          "Twinklingz brings together elegant, timeless and trend-forward jewellery, thoughtfully curated by Priya Kaur for every style and occasion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-40">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-2 lg:items-center lg:px-10">
        <img
          src={media.heroImage}
          alt="Twinklingz jewellery collection"
          width={1200}
          height={1500}
          className="aspect-[4/5] w-full object-cover"
        />
        <div>
          <p className="text-xs font-semibold tracking-[.24em] text-accent">TWINKLINGZ</p>
          <h1 className="mt-4 font-display text-5xl sm:text-7xl">About Twinklingz</h1>
          <p className="mt-6 font-display text-2xl text-primary">{STORY_COPY.headline}</p>
          <p className="mt-6 max-w-2xl whitespace-pre-line leading-8 text-muted-foreground">{STORY_COPY.body}</p>
          <p className="mt-6 font-script text-2xl text-primary">{STORY_COPY.highlight}</p>
          <Button className="mt-8" asChild>
            <a href="/shop">Explore the catalog</a>
          </Button>
        </div>
      </div>
      <div className="mx-auto mt-20 max-w-6xl px-5 lg:px-10">
        <p className="text-center text-xs tracking-[.24em] text-accent">FROM OUR STUDIO</p>
        <h2 className="mt-3 text-center font-display text-4xl">The full sparkle catalog</h2>
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {galleryImages.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`Twinklingz catalogue ${i + 1}`}
              loading="lazy"
              className="aspect-square w-full object-cover"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
