import { createFileRoute } from "@tanstack/react-router";
import { RETURN_REFUND_POLICY } from "@/lib/cms-settings";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return / Refund / Exchange Policy | Twinklingz" },
      {
        name: "description",
        content: "Twinklingz return, refund and exchange policy for online jewellery orders.",
      },
      { property: "og:title", content: "Return / Refund / Exchange Policy | Twinklingz" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="min-h-screen bg-background px-5 pb-24 pt-40">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[0.24em] text-accent">TWINKLINGZ</p>
        <h1 className="mt-4 font-display text-5xl sm:text-7xl">Return / Refund / Exchange Policy</h1>
        <p className="mt-6 font-display text-2xl text-primary">Please review before purchasing.</p>
        <p className="mt-6 max-w-2xl leading-8 text-muted-foreground">{RETURN_REFUND_POLICY}</p>
      </div>
    </main>
  );
}
