import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/catalog";
import { useStore } from "@/components/store-provider";
import { apiFetch } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout | Twinklingz" },
      { name: "description", content: "Complete your Twinklingz order with secure online payment." },
      { property: "og:title", content: "Secure Checkout | Twinklingz" },
      { property: "og:description", content: "Complete your order securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const fieldKeys = [
  "fullName",
  "mobile",
  "email",
  "address",
  "landmark",
  "city",
  "state",
  "pinCode",
] as const;

type FormState = Record<(typeof fieldKeys)[number], string>;

const emptyForm: FormState = {
  fullName: "",
  mobile: "",
  email: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pinCode: "",
};

type OrderSummary = {
  orderNumber: string;
  fullName: string;
  email: string;
  mobile: string;
  shipping: {
    address: string;
    landmark: string;
    city: string;
    state: string;
    pinCode: string;
  };
  items: { name: string; quantity: number; lineTotal: number }[];
  total: number;
  emailPending?: boolean;
};

function OrderSuccess({ summary }: { summary: OrderSummary }) {
  const addressLine = [
    summary.shipping.address,
    summary.shipping.landmark,
    `${summary.shipping.city}, ${summary.shipping.state} ${summary.shipping.pinCode}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-secondary px-5 pb-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden border border-border bg-background shadow-sm">
          <div className="bg-primary px-6 py-10 text-center text-primary-foreground sm:px-10">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-foreground/15">
              <CheckCircle2 className="size-8" strokeWidth={1.5} />
            </div>
            <p className="mt-6 text-xs tracking-[0.28em] text-primary-foreground/80">ORDER CONFIRMED</p>
            <h1 className="mt-3 font-display text-4xl sm:text-5xl">Your sparkle is on its way</h1>
            <p className="mt-2 inline-flex items-center gap-1 text-lg">
              <Sparkles className="size-5 text-accent" aria-hidden />
            </p>
            <p className="mt-4 text-sm text-primary-foreground/90">
              Thank you, <span className="font-medium">{summary.fullName}</span>
            </p>
          </div>

          <div className="space-y-8 px-6 py-8 sm:px-10">
            <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs tracking-[0.2em] text-muted-foreground">ORDER NUMBER</p>
                <p className="mt-1 font-display text-2xl text-primary">{summary.orderNumber}</p>
              </div>
              <p className="text-lg font-semibold">{formatPrice(summary.total)}</p>
            </div>

            <div className="flex gap-3 rounded-md bg-secondary/80 p-4 text-sm leading-relaxed">
              <Mail className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <p className="text-muted-foreground">
                {summary.emailPending
                  ? "Complete payment to receive your confirmation email with order and tracking details."
                  : (
                    <>
                      We&apos;ve sent a confirmation to{" "}
                      <span className="font-medium text-foreground">{summary.email}</span> with your items,
                      shipping address, and a link to track your order.
                    </>
                  )}
              </p>
            </div>

            <div>
              <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">YOUR ITEMS</h2>
              <ul className="mt-4 divide-y divide-border">
                {summary.items.map((item) => (
                  <li key={`${item.name}-${item.quantity}`} className="flex justify-between gap-4 py-3 text-sm">
                    <span>
                      {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium">{formatPrice(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 text-sm leading-relaxed">
              <MapPin className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
              <div>
                <h2 className="text-xs font-semibold tracking-[0.2em] text-muted-foreground">DELIVERING TO</h2>
                <p className="mt-2">{addressLine}</p>
                <p className="mt-1 text-muted-foreground">{summary.mobile}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button asChild className="flex-1">
                <Link
                  to="/track-order"
                  search={{ orderNumber: summary.orderNumber, emailOrPhone: summary.email }}
                >
                  TRACK ORDER
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link to="/shop">CONTINUE SHOPPING</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Page() {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [paying, setPaying] = useState(false);
  const { cart, subtotal, clearCart } = useStore();

  if (summary) {
    return <OrderSuccess summary={summary} />;
  }

  function buildSummary(orderNumber: string, emailPending = false): OrderSummary {
    return {
      orderNumber,
      fullName: form.fullName,
      email: form.email,
      mobile: form.mobile,
      shipping: {
        address: form.address,
        landmark: form.landmark,
        city: form.city,
        state: form.state,
        pinCode: form.pinCode,
      },
      items: cart.map(({ product, quantity }) => ({
        name: product.name,
        quantity,
        lineTotal: product.price * quantity,
      })),
      total: subtotal,
      emailPending,
    };
  }

  function finishCheckout(orderNumber: string, emailPending = false) {
    setSummary(buildSummary(orderNumber, emailPending));
    clearCart();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart.length) return;
    setPaying(true);
    try {
      const created = await apiFetch<{
        order: { id: string; orderNumber: string; total: number };
      }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customer: {
            fullName: form.fullName,
            email: form.email,
            mobile: form.mobile,
          },
          shippingAddress: {
            address: form.address,
            landmark: form.landmark,
            city: form.city,
            state: form.state,
            pinCode: form.pinCode,
          },
          items: cart.map(({ product, quantity }) => ({
            slug: product.slug,
            name: product.name,
            sku: product.sku,
            unitPrice: product.price,
            image: product.image,
            quantity,
          })),
          paymentMethod: "razorpay",
        }),
      });

      const orderId = created.order.id;
      const orderNum = created.order.orderNumber;

      const amountPaise = Math.max(100, Math.round(created.order.total * 100));

      const rp = await apiFetch<{
        order_id: string;
        amount: number;
        currency: string;
        key_id?: string;
      }>("/create-order", {
        method: "POST",
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: orderNum,
          shopOrderId: orderId,
        }),
      });

      const keyId = rp.key_id || (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || "";
      if (!keyId) {
        toast.message("Order saved", {
          description: "Add Razorpay keys to complete payment online. Order is pending payment.",
        });
        finishCheckout(orderNum, true);
        return;
      }

      await openRazorpayCheckout({
        keyId,
        amount: rp.amount,
        currency: rp.currency,
        orderId: rp.order_id,
        prefill: { name: form.fullName, email: form.email, contact: form.mobile },
        description: `Order ${orderNum}`,
        onSuccess: async (response) => {
          try {
            const verified = await apiFetch<{ success: boolean }>("/verify-payment", {
              method: "POST",
              body: JSON.stringify(response),
            });
            if (!verified.success) {
              toast.error("Payment verification failed");
              return;
            }
            toast.success("Payment successful");
            finishCheckout(orderNum, false);
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Payment verification failed");
          }
        },
        onDismiss: () => toast.message("Payment cancelled — you can retry from track order later."),
        onFailed: (response) => {
          toast.error(response.error?.description || response.error?.reason || "Payment failed");
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setPaying(false);
    }
  }

  const labels: Record<(typeof fieldKeys)[number], string> = {
    fullName: "Full Name",
    mobile: "Mobile Number",
    email: "Email",
    address: "Address",
    landmark: "Apartment / Landmark",
    city: "City",
    state: "State",
    pinCode: "PIN Code",
  };

  return (
    <main className="min-h-screen bg-secondary px-5 pb-24 pt-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="font-display text-4xl">Secure Checkout</h1>
          <span className="text-xs">Contact → Address → Review → Payment</span>
        </div>
        <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <section className="bg-background p-6 sm:p-10">
            <h2 className="font-display text-2xl">Delivery Address</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {fieldKeys.map((key) => (
                <label key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                  <span className="mb-1 block text-xs">{labels[key]}</span>
                  <input
                    required={key !== "landmark"}
                    type={key === "email" ? "email" : "text"}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-input bg-background p-3 outline-none focus:border-primary"
                  />
                </label>
              ))}
            </div>
            <h2 className="mt-10 font-display text-2xl">Payment</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              You will pay securely via Razorpay (UPI, cards, and more).
            </p>
            <label className="mt-7 flex items-start gap-3 text-sm">
              <input required type="checkbox" className="mt-1" />I agree to the Terms &amp; Conditions and understand
              all sales are final (no returns, refunds, or exchanges).
            </label>
            <Button type="submit" className="mt-7 w-full" disabled={!cart.length || paying}>
              {paying ? "Processing…" : "CONTINUE TO SECURE PAYMENT"}
            </Button>
          </section>
          <aside className="h-fit bg-background p-6">
            <h2 className="font-display text-2xl">Order Review</h2>
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="mt-4 flex justify-between text-sm">
                <span>
                  {product.name} × {quantity}
                </span>
                <span>{formatPrice(product.price * quantity)}</span>
              </div>
            ))}
            <div className="mt-6 flex justify-between border-t border-border pt-5 font-semibold">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Payment details are handled securely by Razorpay and are not stored by Twinklingz.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}
