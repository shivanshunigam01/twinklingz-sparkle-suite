import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCustomerAuth } from "@/components/customer-auth-provider";
import { toast } from "sonner";

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
  const { customer, loading, signIn, register, signOut } = useCustomerAuth();
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      <main className="min-h-screen bg-secondary px-5 pb-24 pt-36">
        <p className="text-center text-sm text-muted-foreground">Loading account…</p>
      </main>
    );
  }

  if (customer) {
    return (
      <main className="min-h-screen bg-secondary px-5 pb-24 pt-36">
        <div className="mx-auto max-w-md border border-border bg-background p-8">
          <p className="text-center text-xs tracking-[.24em] text-accent">TWINKLINGZ</p>
          <h1 className="mt-3 text-center font-display text-4xl">My Account</h1>
          <p className="mt-6 text-center text-sm">
            Signed in as <span className="font-medium">{customer.name}</span>
          </p>
          <p className="text-center text-sm text-muted-foreground">{customer.email}</p>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            You can leave reviews on product pages while signed in. Reviews are verified by our team before they appear
            on the site.
          </p>
          <Button variant="outline" className="mt-8 w-full" onClick={signOut}>
            Sign out
          </Button>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/shop" className="underline-offset-4 hover:underline">
              Continue shopping
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-secondary px-5 pb-24 pt-36">
      <div className="mx-auto max-w-md border border-border bg-background p-8">
        <p className="text-center text-xs tracking-[.24em] text-accent">WELCOME</p>
        <h1 className="mt-3 text-center font-display text-4xl">My Account</h1>
        <div className="mt-6 flex rounded-md border border-border p-1 text-xs">
          <button
            type="button"
            className={`flex-1 rounded py-2 ${mode === "signin" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setMode("signin")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded py-2 ${mode === "register" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>
        <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
          {mode === "register" && (
            <label className="text-xs">
              FULL NAME
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full border border-input bg-background p-3 outline-none focus:border-primary"
              />
            </label>
          )}
          <label className="text-xs">
            EMAIL
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-input bg-background p-3 outline-none focus:border-primary"
            />
          </label>
          <label className="text-xs">
            PASSWORD
            <input
              required
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-input bg-background p-3 outline-none focus:border-primary"
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
