import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard | Twinklingz" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const token = getAdminToken();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "reports", "summary"],
    queryFn: () =>
      apiFetch<{
        summary: {
          productCount: number;
          orderCount: number;
          paidOrders: number;
          revenue: number;
          unreadSubmissions: number;
        };
        recentOrders: Array<{
          orderNumber: string;
          total: number;
          paymentStatus: string;
          fulfillmentStatus: string;
          createdAt: string;
        }>;
      }>("/admin/reports/summary", { token }),
  });

  const s = data?.summary;

  return (
    <div>
      <h2 className="font-display text-4xl">Dashboard</h2>
      <p className="mt-2 text-muted-foreground">Overview of your store — connect MongoDB to see live data.</p>
      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
      {error && (
        <p className="mt-8 text-sm text-destructive">
          {error instanceof Error ? error.message : "Could not load dashboard"}
        </p>
      )}
      {s && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Products", s.productCount],
              ["Orders", s.orderCount],
              ["Paid orders", s.paidOrders],
              ["Revenue (₹)", s.revenue.toLocaleString("en-IN")],
              ["Unread forms", s.unreadSubmissions],
            ].map(([label, value]) => (
              <div key={String(label)} className="border border-border bg-background p-5">
                <p className="text-xs tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-2 font-display text-3xl">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admin/products">Manage products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/orders">View orders</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/settings">Contact &amp; site settings</Link>
            </Button>
          </div>
          {data.recentOrders?.length > 0 && (
            <section className="mt-12">
              <h3 className="font-display text-2xl">Recent orders</h3>
              <ul className="mt-4 divide-y divide-border border border-border bg-background">
                {data.recentOrders.map((o) => (
                  <li key={o.orderNumber} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                    <span className="font-medium">{o.orderNumber}</span>
                    <span className="text-muted-foreground">
                      {o.paymentStatus} · {o.fulfillmentStatus}
                    </span>
                    <span>₹{o.total.toLocaleString("en-IN")}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
