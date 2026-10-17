import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/track-order")({
  head: () => ({
    meta: [
      { title: "Track Your Order | Twinklingz" },
      { name: "description", content: "Enter your order number and the email or mobile number used at checkout." },
      { property: "og:title", content: "Track Your Order | Twinklingz" },
      { property: "og:description", content: "Enter your order number and the email or mobile number used at checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

type TrackResult = {
  order: {
    orderNumber: string;
    fulfillmentStatus: string;
    paymentStatus: string;
    trackingNote: string;
    total: number;
    createdAt: string;
  };
};

function Page() {
  const [orderNumber, setOrderNumber] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [result, setResult] = useState<TrackResult["order"] | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const q = new URLSearchParams({ orderNumber, emailOrPhone });
      const res = await apiFetch<TrackResult>(`/orders/track?${q}`);
      setResult(res.order);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Order not found");
      try {
        await apiFetch("/submissions", {
          method: "POST",
          body: JSON.stringify({
            type: "track_order",
            email: emailOrPhone.includes("@") ? emailOrPhone : undefined,
            phone: emailOrPhone.includes("@") ? undefined : emailOrPhone,
            payload: { orderNumber, emailOrPhone },
            sourcePath: "/track-order",
          }),
        });
      } catch {
        /* optional log */
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 pb-24 pt-40">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold tracking-[.24em] text-accent">TWINKLINGZ</p>
        <h1 className="mt-4 font-display text-5xl sm:text-7xl">Track Your Order</h1>
        <p className="mt-6 font-display text-2xl text-primary">See where your sparkle is.</p>
        <p className="mt-6 max-w-2xl leading-8 text-muted-foreground">
          Enter your order number and the email or mobile number used at checkout.
        </p>
        <form className="mt-10 grid gap-4" onSubmit={onSubmit}>
          <input
            required
            placeholder="Order number"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="border border-input bg-background p-4 outline-none focus:border-primary"
          />
          <input
            required
            placeholder="Email or mobile number"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            className="border border-input bg-background p-4 outline-none focus:border-primary"
          />
          <Button type="submit" className="w-fit" disabled={loading}>
            {loading ? "Looking up…" : "TRACK ORDER"}
          </Button>
        </form>
        {result && (
          <div className="mt-10 border border-border bg-secondary p-6">
            <p className="font-display text-2xl">{result.orderNumber}</p>
            <p className="mt-2 text-sm">
              Payment: <strong>{result.paymentStatus}</strong> · Status:{" "}
              <strong>{result.fulfillmentStatus}</strong>
            </p>
            {result.trackingNote && <p className="mt-2 text-sm text-muted-foreground">{result.trackingNote}</p>}
            <p className="mt-2 text-sm">Total: ₹{result.total.toLocaleString("en-IN")}</p>
          </div>
        )}
      </div>
    </main>
  );
}
