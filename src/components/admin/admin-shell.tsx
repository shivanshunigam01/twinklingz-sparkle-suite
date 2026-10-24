import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Inbox,
  Settings,
  BarChart3,
  LogOut,
  ExternalLink,
  MessageSquareQuote,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearAdminToken } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/reviews", label: "Review queue", icon: MessageSquareQuote },
  { to: "/admin/manage-reviews", label: "Manage reviews", icon: ListChecks },
  { to: "/admin/submissions", label: "Form submissions", icon: Inbox },
  { to: "/admin/settings", label: "Site settings", icon: Settings },
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function logout() {
    clearAdminToken();
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col lg:flex-row">
        <aside className="border-b border-border bg-background px-5 py-6 lg:w-64 lg:border-b-0 lg:border-r">
          <p className="text-xs tracking-[.24em] text-accent">TWINKLINGZ</p>
          <h1 className="font-display text-2xl">Admin</h1>
          <nav className="mt-8 space-y-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition hover:bg-muted",
                  pathname.startsWith(to) && "bg-muted font-medium",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 space-y-2 border-t border-border pt-6">
            <Button asChild variant="outline" size="sm" className="w-full justify-start">
              <a href="/" target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" /> View storefront
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </aside>
        <main className="flex-1 px-5 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
