import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { setAdminToken } from "@/lib/admin-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{ title: "Admin Login | Twinklingz" }, { name: "robots", content: "noindex" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiFetch<{ token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAdminToken(res.token);
      toast.success("Signed in");
      await navigate({ to: "/admin/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-5">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-background p-8 shadow-sm">
        <p className="text-center text-xs tracking-[.24em] text-accent">TWINKLINGZ ADMIN</p>
        <h1 className="mt-3 text-center font-display text-4xl">Sign in</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Manage products, orders, payments, and site content.
        </p>
        <label className="mt-8 block text-xs">
          EMAIL
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-input p-3 outline-none focus:border-primary"
          />
        </label>
        <label className="mt-4 block text-xs">
          PASSWORD
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-input p-3 outline-none focus:border-primary"
          />
        </label>
        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? "Signing in…" : "SIGN IN"}
        </Button>
      </form>
    </main>
  );
}
