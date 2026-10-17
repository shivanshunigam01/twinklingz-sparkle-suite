import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiFetch } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports | Twinklingz Admin" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const token = getAdminToken();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "reports", "full"],
    queryFn: () =>
      apiFetch<{
        summary: { revenue: number; paidOrders: number; orderCount: number };
        salesByDay: Array<{ _id: string; total: number; count: number }>;
      }>("/admin/reports/summary", { token }),
  });

  const chartData =
    data?.salesByDay.map((d) => ({ date: d._id, revenue: d.total, orders: d.count })) ?? [];

  return (
    <div>
      <h2 className="font-display text-4xl">Reports</h2>
      <p className="mt-2 text-muted-foreground">Sales for the last 30 days (paid orders only).</p>
      {isLoading && <p className="mt-8 text-sm">Loading…</p>}
      {error && <p className="mt-8 text-sm text-destructive">{error instanceof Error ? error.message : "Error"}</p>}
      {data && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="h-80 border border-border bg-background p-4">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">No paid orders yet.</p>
            )}
          </div>
          <div className="space-y-4">
            <div className="border border-border bg-background p-5">
              <p className="text-xs text-muted-foreground">Total revenue</p>
              <p className="font-display text-3xl">₹{data.summary.revenue.toLocaleString("en-IN")}</p>
            </div>
            <div className="border border-border bg-background p-5">
              <p className="text-xs text-muted-foreground">Paid / all orders</p>
              <p className="font-display text-3xl">
                {data.summary.paidOrders} / {data.summary.orderCount}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
