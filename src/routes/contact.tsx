import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { galleryImages, media } from "@/lib/catalog";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Twinklingz" },
      {
        name: "description",
        content: "For order and product enquiries, please use the contact details configured by the Twinklingz team.",
      },
      { property: "og:title", content: "Contact Us | Twinklingz" },
      {
        property: "og:description",
        content: "For order and product enquiries, please use the contact details configured by the Twinklingz team.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="min-h-screen bg-background px-5 pb-24 pt-40">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <p className="text-xs font-semibold tracking-[.24em] text-accent">TWINKLINGZ</p>
          <h1 className="mt-4 font-display text-5xl sm:text-7xl">Contact Us</h1>
          <p className="mt-6 font-display text-2xl text-primary">We would love to hear from you.</p>
          <p className="mt-6 max-w-2xl leading-8 text-muted-foreground">
            For order and product enquiries, please use the contact details configured by the Twinklingz team.
          </p>
          <Button className="mt-8">Send a message</Button>
        </div>
        <img
          src={media.campaignImage}
          alt="Twinklingz jewellery"
          className="aspect-[4/5] w-full object-cover"
        />
      </div>
      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-3 gap-2 sm:grid-cols-6">
        {galleryImages.slice(0, 6).map((src, i) => (
          <img key={src} src={src} alt={`Catalogue ${i + 1}`} loading="lazy" className="aspect-square object-cover" />
        ))}
      </div>
    </main>
  );
}
