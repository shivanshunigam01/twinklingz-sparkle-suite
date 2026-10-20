import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { productMatchesCategorySlug, usePublicProducts } from "@/lib/use-public-products";

export const Route = createFileRoute("/collections/$slug")({
  head: ({ params }) => {
    const title = titleCase(params.slug);
    return {
      meta: [
        { title: `${title} | Twinklingz` },
        { name: "description", content: `Shop the Twinklingz ${title} collection.` },
        { property: "og:title", content: `${title} | Twinklingz` },
        { property: "og:description", content: `Shop premium ${title.toLowerCase()} by Twinklingz.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Page,
});

const titleCase = (value: string) =>
  value.split("-").map((x) => x.charAt(0).toUpperCase() + x.slice(1)).join(" ");

function Page() {
  const { slug } = Route.useParams();
  const title = titleCase(slug);
  const { data: products = [], isLoading } = usePublicProducts();
  const matches = products.filter((p) => productMatchesCategorySlug(p, slug));

  return (
    <main className="min-h-screen px-5 pb-24 pt-36 lg:px-10">
      <header className="mx-auto max-w-7xl border-b border-border pb-9">
        <p className="text-xs tracking-[.24em] text-accent">TWINKLINGZ COLLECTION</p>
        <h1 className="mt-3 font-display text-6xl">{title}</h1>
        <p className="mt-3 text-muted-foreground">Designed for your moments, styled for your story.</p>
      </header>
      {isLoading ? (
        <p className="mx-auto mt-16 max-w-7xl text-center text-muted-foreground">Loading collection…</p>
      ) : matches.length === 0 ? (
        <div className="mx-auto mt-16 max-w-lg text-center">
          <p className="font-display text-2xl">No pieces in this category yet</p>
          <p className="mt-3 text-sm text-muted-foreground">
            Explore our full catalogue of necklaces, earrings, and bracelets.
          </p>
          <Button asChild className="mt-8">
            <Link to="/collections">VIEW ALL COLLECTIONS</Link>
          </Button>
        </div>
      ) : (
        <div className="mx-auto mt-10 grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4">
          {matches.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
