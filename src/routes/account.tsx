import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, LogOut, Package, RefreshCw, ShoppingBag, Sparkles, User } from "lucide-react";
import { useMemo, useState } from "react";
import { CustomerOrderCard } from "@/components/account/customer-order-card";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { useCustomerAuth } from "@/components/customer-auth-provider";
import { useCustomerOrders } from "@/lib/use-customer-orders";
import { toast } from "sonner";

const ACCOUNT_BG_IMAGE =
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=2400&q=80";

function AccountBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <LazyImage src={ACCOUNT_BG_IMAGE} alt="" optimizeWidth={1200} className="h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2c1810]/90 via-[#3d2420]/85 to-[#f7f3ef]/96" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,175,125,0.14),transparent_50%)]" />
    </div>
  );
}

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account | Twinklingz" },
      { name: "description", content: "Sign in to manage your Twinklingz profile and leave verified product reviews." },
      { property: "og:title", content: "My Account | Twinklingz" },
      { property: "og:description", content: "Manage your Twinklingz account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { customer, token, loading, signIn, register, signOut } = useCustomerAuth();
  const {
    data: orders = [],
    isLoading: ordersLoading,
    isFetching: ordersFetching,
    isError: ordersError,
    refetch: refetchOrders,
  } = useCustomerOrders(token);
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const orderStats = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === "paid").length;
    const pending = orders.filter((o) => o.paymentStatus === "pending").length;
    return { total: orders.length, paid, pending };
  }, [orders]);

  async function onRefreshOrders() {
    try {
      await refetchOrders();
      toast.success("Orders updated");
    } catch {
      toast.error("Could not refresh orders");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === "register") {
        await register(name.trim(), email, password);
        toast.success("Welcome to Twinklingz");
      } else {
        await signIn(email, password);
        toast.success("Signed in");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="relative min-h-screen px-5 pb-24 pt-36">
        <AccountBackdrop />
        <p className="relative z-10 text-center text-sm text-muted-foreground">Loading account…</p>
      </main>
    );
  }

  if (customer) {
    const initial = customer.name.trim().charAt(0).toUpperCase() || "T";

    return (
      <main className="relative min-h-screen overflow-hidden px-4 pb-28 pt-28 sm:px-6 sm:pt-32">
        <AccountBackdrop />
        <div className="relative z-10 mx-auto max-w-3xl">
          <header className="text-center text-white">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] tracking-[0.14em] backdrop-blur-sm">
              <Sparkles className="size-3.5 text-amber-200" aria-hidden />
              MY TWINKLINGZ
            </p>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl">My Account</h1>
            <p className="mt-3 text-sm text-white/75">Your profile, orders, and verified reviews in one place.</p>
          </header>

          <section className="mt-10 rounded-sm border border-white/35 bg-background/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div
                className="flex size-16 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-display text-2xl text-primary"
                aria-hidden
              >
                {initial}
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <User className="size-4 text-muted-foreground" aria-hidden />
                  <p className="font-medium text-foreground">{customer.name}</p>
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{customer.email}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Signed-in checkout saves your details. Leave reviews on product pages — we verify them before they go
                  live.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 gap-2"
                onClick={() => signOut()}
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </Button>
            </div>
          </section>

          <section className="mt-8 rounded-sm border border-white/35 bg-background/95 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="size-5 text-primary" aria-hidden />
                  <h2 className="font-display text-2xl text-primary">Your orders</h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Successful and pending payments from this account appear here automatically.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="gap-2 self-start"
                disabled={ordersFetching}
                onClick={() => onRefreshOrders()}
              >
                <RefreshCw className={`size-4 ${ordersFetching ? "animate-spin" : ""}`} aria-hidden />
                Refresh
              </Button>
            </div>

            {orders.length > 0 ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-sm border border-border bg-muted/30 px-4 py-3 text-center sm:text-left">
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">TOTAL</p>
                  <p className="mt-1 font-display text-2xl text-foreground">{orderStats.total}</p>
                </div>
                <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-center sm:text-left">
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-emerald-800 dark:text-emerald-300">PAID</p>
                  <p className="mt-1 font-display text-2xl text-emerald-900 dark:text-emerald-200">{orderStats.paid}</p>
                </div>
                <div className="rounded-sm border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center sm:text-left">
                  <p className="text-[10px] font-semibold tracking-[0.16em] text-amber-900 dark:text-amber-200">PENDING</p>
                  <p className="mt-1 font-display text-2xl text-amber-950 dark:text-amber-100">{orderStats.pending}</p>
                </div>
              </div>
            ) : null}

            {ordersLoading ? (
              <div className="mt-12 flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="size-8 animate-spin" aria-label="Loading orders" />
                <p className="text-sm">Loading your orders…</p>
              </div>
            ) : ordersError ? (
              <div className="mt-10 rounded-sm border border-dashed border-destructive/40 bg-destructive/5 px-6 py-10 text-center">
                <p className="text-sm text-destructive">Could not load orders.</p>
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => onRefreshOrders()}>
                  Try again
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="mt-10 rounded-sm border border-dashed border-border bg-secondary/50 px-6 py-14 text-center">
                <ShoppingBag className="mx-auto size-10 text-muted-foreground/70" aria-hidden />
                <p className="mt-4 font-display text-xl text-foreground">No orders yet</p>
                <p className="mt-2 text-sm text-muted-foreground">When you checkout while signed in, your orders show up here.</p>
                <Button asChild className="mt-6">
                  <Link to="/shop">Explore the shop</Link>
                </Button>
              </div>
            ) : (
              <ul className="mt-8 grid gap-4">
                {orders.map((order) => (
                  <CustomerOrderCard key={order.id} order={order} customerEmail={customer.email} />
                ))}
              </ul>
            )}
          </section>

          <p className="mt-10 text-center">
            <Link
              to="/shop"
              className="text-xs font-medium tracking-[0.12em] text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              CONTINUE SHOPPING
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary px-5 pb-24 pt-36">
      <div className="mx-auto max-w-md border border-border bg-background p-8 shadow-lg">
        <p className="text-center text-xs tracking-[.24em] text-accent">WELCOME</p>
        <h1 className="mt-3 text-center font-display text-4xl">My Account</h1>
        <div className="mt-6 flex rounded-md border border-border p-1 text-xs">
          <button
            type="button"
            className={`flex-1 rounded py-2 transition-colors ${mode === "signin" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded py-2 transition-colors ${mode === "register" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>
        <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
          {mode === "register" && (
            <label className="text-xs font-medium tracking-wide text-muted-foreground">
              FULL NAME
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-input bg-background p-3 text-sm outline-none transition focus:border-primary"
              />
            </label>
          )}
          <label className="text-xs font-medium tracking-wide text-muted-foreground">
            EMAIL
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-input bg-background p-3 text-sm outline-none transition focus:border-primary"
            />
          </label>
          <label className="text-xs font-medium tracking-wide text-muted-foreground">
            PASSWORD
            <input
              required
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-input bg-background p-3 text-sm outline-none transition focus:border-primary"
            />
          </label>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Please wait…" : mode === "register" ? "CREATE ACCOUNT" : "SIGN IN"}
          </Button>
        </form>
      </div>
    </main>
  );
}