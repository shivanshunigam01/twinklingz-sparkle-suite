import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Loader2, Lock, Mail, MapPin, ShieldCheck, Sparkles, Truck } from "lucide-react";
import {
  hasCheckoutErrors,
  normalizeIndianMobile,
  validateCheckoutForm,
  type CheckoutFieldErrors,
} from "@/lib/checkout-validation";
import { fetchPostOfficesByPincode, type PostOffice } from "@/lib/india-pincode";
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

type FormState = {
  fullName: string;
  mobile: string;
  email: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pinCode: string;
  locality: string;
};

const emptyForm: FormState = {
  fullName: "",
  mobile: "",
  email: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pinCode: "",
  locality: "",
};

/** Unsplash — jewellery styling (license: https://unsplash.com/license) */
const CHECKOUT_BG_IMAGE =
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=2400&q=80";

function CheckoutBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <img
        src={CHECKOUT_BG_IMAGE}
        alt=""
        className="h-full w-full scale-105 object-cover object-center motion-safe:animate-[checkout-pan_28s_ease-in-out_infinite_alternate]"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#2c1810]/92 via-[#3d2420]/88 to-[#f7f3ef]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,125,0.12),transparent_55%)]" />
    </div>
  );
}

function CheckoutPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 pb-28 pt-28 sm:px-6 sm:pt-32">
      <CheckoutBackdrop />
      <style>{`
        @keyframes checkout-pan {
          from { transform: scale(1.05) translate3d(0, 0, 0); }
          to { transform: scale(1.12) translate3d(-1.5%, -1%, 0); }
        }
      `}</style>
      <div className="relative z-10 mx-auto max-w-6xl">{children}</div>
    </main>
  );
}

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
    <CheckoutPageShell>
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden border border-white/40 bg-background/95 shadow-2xl backdrop-blur-md">
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
    </CheckoutPageShell>
  );
}

function Page() {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<CheckoutFieldErrors>({});
  const [postOffices, setPostOffices] = useState<PostOffice[]>([]);
  const [pinLookupLoading, setPinLookupLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const { cart, subtotal, clearCart } = useStore();

  useEffect(() => {
    const pin = form.pinCode.replace(/\D/g, "");
    if (pin.length !== 6) {
      setPostOffices([]);
      return;
    }

    let cancelled = false;
    setPinLookupLoading(true);
    setFieldErrors((e) => ({ ...e, pinCode: undefined, locality: undefined }));

    fetchPostOfficesByPincode(pin)
      .then((offices) => {
        if (cancelled) return;
        setPostOffices(offices);
        const district = offices[0]?.District ?? "";
        const state = offices[0]?.State ?? "";
        setForm((prev) => ({
          ...prev,
          pinCode: pin,
          city: district,
          state,
          locality: offices.length === 1 ? offices[0].Name : "",
        }));
      })
      .catch((err) => {
        if (cancelled) return;
        setPostOffices([]);
        const message = err instanceof Error ? err.message : "Could not verify PIN code.";
        setFieldErrors((e) => ({ ...e, pinCode: message }));
      })
      .finally(() => {
        if (!cancelled) setPinLookupLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.pinCode]);

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
        landmark: [form.locality.trim(), form.landmark.trim()].filter(Boolean).join(", "),
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

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart.length) return;

    const pin = form.pinCode.replace(/\D/g, "");
    const values = { ...form, pinCode: pin };
    const errors = validateCheckoutForm(values, postOffices.length > 1);
    if (hasCheckoutErrors(errors)) {
      setFieldErrors(errors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const mobile = normalizeIndianMobile(form.mobile);
    const landmarkParts = [form.locality.trim(), form.landmark.trim()].filter(Boolean);

    setPaying(true);
    try {
      const created = await apiFetch<{
        order: { id: string; orderNumber: string; total: number };
      }>("/orders", {
        method: "POST",
        body: JSON.stringify({
          customer: {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            mobile,
          },
          shippingAddress: {
            address: form.address.trim(),
            landmark: landmarkParts.join(", "),
            city: form.city.trim(),
            state: form.state.trim(),
            pinCode: pin,
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
        prefill: { name: form.fullName.trim(), email: form.email.trim(), contact: mobile },
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

  if (!cart.length) {
    return (
      <CheckoutPageShell>
        <div className="mx-auto max-w-lg rounded-sm border border-white/30 bg-background/90 px-8 py-16 text-center shadow-2xl backdrop-blur-md">
          <Sparkles className="mx-auto size-8 text-accent" aria-hidden />
          <h1 className="mt-4 font-display text-4xl text-primary">Your bag is empty</h1>
          <p className="mt-3 text-sm text-muted-foreground">Add something sparkly before checkout.</p>
          <Button asChild className="mt-8">
            <Link to="/shop">SHOP JEWELLERY</Link>
          </Button>
        </div>
      </CheckoutPageShell>
    );
  }

  const inputClass = (hasError?: boolean) =>
    `w-full border bg-background/90 p-3.5 text-sm outline-none transition placeholder:text-muted-foreground/70 focus:ring-1 ${
      hasError
        ? "border-destructive focus:border-destructive focus:ring-destructive/30"
        : "border-input/80 focus:border-primary focus:ring-primary/30"
    }`;

  function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1 text-xs text-destructive" role="alert">{message}</p>;
  }

  return (
    <CheckoutPageShell>
      <header className="mb-8 text-center sm:mb-10 sm:text-left">
        <p className="text-xs tracking-[0.28em] text-primary-foreground/90">TWINKLINGZ CHECKOUT</p>
        <h1 className="mt-2 font-display text-4xl text-white sm:text-5xl">Secure Checkout</h1>
        <p className="mt-3 max-w-xl text-sm text-white/80">
          A few details and your favourites are on their way — encrypted payment via Razorpay.
        </p>
        <ol className="mt-6 flex flex-wrap justify-center gap-2 sm:justify-start">
          {["Your details", "Delivery", "Payment"].map((step, i) => (
            <li
              key={step}
              className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] tracking-[0.14em] text-white backdrop-blur-sm"
            >
              <span className="text-white/60">{i + 1}.</span> {step}
            </li>
          ))}
        </ol>
      </header>

      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-8">
        <section className="rounded-sm border border-white/35 bg-background/92 p-6 shadow-xl backdrop-blur-md sm:p-9">
          <h2 className="font-display text-2xl text-primary">Delivery details</h2>
          <p className="mt-1 text-sm text-muted-foreground">Where should we send your order?</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
                FULL NAME
              </span>
              <input
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className={inputClass(!!fieldErrors.fullName)}
              />
              <FieldError message={fieldErrors.fullName} />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
                MOBILE NUMBER
              </span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="10-digit mobile"
                maxLength={14}
                value={form.mobile}
                onChange={(e) => updateField("mobile", e.target.value)}
                className={inputClass(!!fieldErrors.mobile)}
              />
              <FieldError message={fieldErrors.mobile} />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
                EMAIL
              </span>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClass(!!fieldErrors.email)}
              />
              <FieldError message={fieldErrors.email} />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
                PIN CODE
              </span>
              <div className="relative">
                <input
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="6 digits"
                  maxLength={6}
                  value={form.pinCode}
                  onChange={(e) => updateField("pinCode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={inputClass(!!fieldErrors.pinCode)}
                />
                {pinLookupLoading && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
              <FieldError message={fieldErrors.pinCode} />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
                AREA / LOCALITY
              </span>
              {postOffices.length > 1 ? (
                <select
                  value={form.locality}
                  onChange={(e) => updateField("locality", e.target.value)}
                  className={inputClass(!!fieldErrors.locality)}
                >
                  <option value="">Select area</option>
                  {postOffices.map((office) => (
                    <option key={`${office.Name}-${office.BranchType}`} value={office.Name}>
                      {office.Name}
                      {office.BranchType ? ` (${office.BranchType})` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  readOnly
                  value={form.locality}
                  placeholder={pinLookupLoading ? "Looking up…" : "Autofilled from PIN"}
                  className={inputClass(!!fieldErrors.locality)}
                />
              )}
              <FieldError message={fieldErrors.locality} />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
                HOUSE / STREET ADDRESS
              </span>
              <input
                autoComplete="street-address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                className={inputClass(!!fieldErrors.address)}
              />
              <FieldError message={fieldErrors.address} />
            </label>
            <label className="sm:col-span-2">
              <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
                APARTMENT / LANDMARK (OPTIONAL)
              </span>
              <input
                value={form.landmark}
                onChange={(e) => updateField("landmark", e.target.value)}
                className={inputClass()}
              />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
                CITY
              </span>
              <input
                autoComplete="address-level2"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className={inputClass(!!fieldErrors.city)}
              />
              <FieldError message={fieldErrors.city} />
            </label>
            <label>
              <span className="mb-1.5 block text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
                STATE
              </span>
              <input
                autoComplete="address-level1"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                className={inputClass(!!fieldErrors.state)}
              />
              <FieldError message={fieldErrors.state} />
            </label>
          </div>

          <div className="mt-10 border-t border-border pt-8">
            <h2 className="flex items-center gap-2 font-display text-2xl text-primary">
              <Lock className="size-5 text-accent" aria-hidden />
              Payment
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              You&apos;ll complete payment on Razorpay — UPI, cards, net banking, and wallets supported.
            </p>
            <ul className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-accent" /> SSL secured
              </li>
              <li className="flex items-center gap-1.5">
                <Truck className="size-4 text-accent" /> Tracked dispatch
              </li>
            </ul>
            <label className="mt-6 flex items-start gap-3 rounded-md bg-secondary/60 p-4 text-sm leading-relaxed">
              <input required type="checkbox" className="mt-1 shrink-0" />
              <span>
                I agree to the Terms &amp; Conditions and understand all sales are final (no returns, refunds, or
                exchanges).
              </span>
            </label>
            <Button type="submit" className="mt-6 h-12 w-full text-sm tracking-[0.12em]" disabled={paying}>
              {paying ? "Processing…" : "CONTINUE TO SECURE PAYMENT"}
            </Button>
          </div>
        </section>

        <aside className="h-fit rounded-sm border border-white/35 bg-background/92 p-6 shadow-xl backdrop-blur-md lg:sticky lg:top-28">
          <h2 className="font-display text-2xl text-primary">Your order</h2>
          <p className="mt-1 text-sm text-muted-foreground">{cart.length} item{cart.length > 1 ? "s" : ""}</p>
          <ul className="mt-5 space-y-4">
            {cart.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-3">
                <div className="size-16 shrink-0 overflow-hidden border border-border bg-muted">
                  <img src={product.image} alt="" className="size-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0 flex-1 text-sm">
                  <p className="truncate font-medium leading-snug">{product.name}</p>
                  <p className="text-muted-foreground">Qty {quantity}</p>
                  <p className="mt-1 font-semibold">{formatPrice(product.price * quantity)}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>Calculated at dispatch</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Card and UPI details are processed by Razorpay — never stored on Twinklingz servers.
          </p>
        </aside>
      </form>
    </CheckoutPageShell>
  );
}
