import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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

function Page() {
  const [confirmed, setConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [paying, setPaying] = useState(false);
  const { cart, subtotal } = useStore();

  if (confirmed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 text-center">
        <div>
          <p className="text-5xl">✦</p>
          <h1 className="mt-4 font-display text-5xl">Your sparkle is on its way ✨</h1>
          {orderNumber && <p className="mt-2 font-medium">Order {orderNumber}</p>}
          <p className="mt-4 text-muted-foreground">
            Your order confirmation and tracking details will be sent after payment is verified.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/track-order">TRACK ORDER</Link>
            </Button>
            <Button asChild>
              <Link to="/shop">CONTINUE SHOPPING</Link>
            </Button>
          </div>
        </div>
      </main>
    );
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
      setOrderNumber(created.order.orderNumber);

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
          receipt: created.order.orderNumber,
          shopOrderId: orderId,
        }),
      });

      const keyId = rp.key_id || (import.meta.env.VITE_RAZORPAY_KEY_ID as string) || "";
      if (!keyId) {
        toast.message("Order saved", {
          description: "Add Razorpay keys to complete payment online. Order is pending payment.",
        });
        setConfirmed(true);
        return;
      }

      await openRazorpayCheckout({
        keyId,
        amount: rp.amount,
        currency: rp.currency,
        orderId: rp.order_id,
        prefill: { name: form.fullName, email: form.email, contact: form.mobile },
        description: `Order ${created.order.orderNumber}`,
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
            setConfirmed(true);
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
              <input required type="checkbox" className="mt-1" />I have read and agree to the Terms &amp; Conditions
              and Return/Refund Policy.
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
