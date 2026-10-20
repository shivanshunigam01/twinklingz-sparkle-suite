import type { ComponentType } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { useQuery } from "@tanstack/react-query";

import { format, parseISO } from "date-fns";

import {

  Area,

  AreaChart,

  Bar,

  BarChart,

  CartesianGrid,

  Cell,

  Line,

  LineChart,

  Pie,

  PieChart,

  XAxis,

  YAxis,

} from "recharts";

import { ArrowUpRight, Package, ShoppingBag, TrendingUp, Wallet } from "lucide-react";

import { apiFetch } from "@/lib/api";

import { getAdminToken } from "@/lib/admin-auth";

import { Button } from "@/components/ui/button";

import {

  ChartContainer,

  ChartLegend,

  ChartLegendContent,

  ChartTooltip,

  ChartTooltipContent,

} from "@/components/ui/chart";



export const Route = createFileRoute("/admin/reports")({

  head: () => ({ meta: [{ title: "Reports | Twinklingz Admin" }] }),

  component: ReportsPage,

});



type ReportsPayload = {

  summary: {

    productCount: number;

    orderCount: number;

    paidOrders: number;

    revenue: number;

    unreadSubmissions: number;

    avgOrderValue: number;

    inStockCount: number;

    featuredCount: number;

  };

  salesByDay: Array<{ _id: string; total: number; count: number }>;

  recentOrders: Array<{

    orderNumber: string;

    total: number;

    paymentStatus: string;

    fulfillmentStatus: string;

    createdAt: string;

  }>;

  productsByCategory: Array<{ _id: string; count: number }>;

  ordersByPaymentStatus: Array<{ _id: string; count: number }>;

  ordersByFulfillment: Array<{ _id: string; count: number }>;

  topProducts: Array<{ _id: string; name: string; quantity: number; revenue: number }>;

};



const PIE_COLORS = [

  "hsl(var(--chart-1))",

  "hsl(var(--chart-2))",

  "hsl(var(--chart-3))",

  "hsl(var(--chart-4))",

  "hsl(var(--chart-5))",

];



const salesChartConfig = {

  revenue: { label: "Revenue", color: "hsl(var(--primary))" },

  orders: { label: "Orders", color: "hsl(var(--chart-2))" },

};



const categoryChartConfig = {

  count: { label: "Products", color: "hsl(var(--primary))" },

};



const topProductsChartConfig = {

  quantity: { label: "Units sold", color: "hsl(var(--chart-3))" },

};



function formatShortDate(iso: string) {

  try {

    return format(parseISO(iso), "d MMM");

  } catch {

    return iso;

  }

}



function ReportsPage() {

  const token = getAdminToken();

  const { data, isLoading, error } = useQuery({

    queryKey: ["admin", "reports", "full"],

    queryFn: () => apiFetch<ReportsPayload>("/admin/reports/summary", { token }),

  });



  const chartData =

    data?.salesByDay.map((d) => ({

      date: d._id,

      label: formatShortDate(d._id),

      revenue: d.total,

      orders: d.count,

    })) ?? [];



  const categoryData =

    data?.productsByCategory.map((c) => ({ name: c._id || "Other", count: c.count })) ?? [];



  const paymentData =

    data?.ordersByPaymentStatus.map((p) => ({

      name: p._id,

      value: p.count,

    })) ?? [];



  const fulfillmentData =

    data?.ordersByFulfillment.map((f) => ({

      name: f._id,

      value: f.count,

    })) ?? [];



  const topProducts =

    data?.topProducts.map((p) => ({

      slug: p._id,

      name: p.name.length > 28 ? `${p.name.slice(0, 26)}…` : p.name,

      quantity: p.quantity,

      revenue: p.revenue,

    })) ?? [];



  const s = data?.summary;

  const conversion =

    s && s.orderCount > 0 ? Math.round((s.paidOrders / s.orderCount) * 100) : 0;



  return (

    <div className="pb-12">

      <div className="flex flex-wrap items-end justify-between gap-4">

        <div>

          <p className="text-xs tracking-[.2em] text-muted-foreground">ANALYTICS</p>

          <h2 className="mt-1 font-display text-4xl">Reports</h2>

          <p className="mt-2 max-w-xl text-sm text-muted-foreground">

            Revenue, orders, catalogue mix, and bestsellers. Paid orders only for sales charts (last 30 days).

          </p>

        </div>

        <Button asChild variant="outline" size="sm">

          <Link to="/admin/orders">

            View all orders <ArrowUpRight className="ml-1 size-4" />

          </Link>

        </Button>

      </div>



      {isLoading && <p className="mt-10 text-sm text-muted-foreground">Loading reports…</p>}

      {error && (

        <p className="mt-10 text-sm text-destructive">

          {error instanceof Error ? error.message : "Could not load reports"}

        </p>

      )}



      {s && (

        <>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <KpiCard

              icon={Wallet}

              label="Total revenue"

              value={`₹${s.revenue.toLocaleString("en-IN")}`}

              hint={`${s.paidOrders} paid orders`}

            />

            <KpiCard

              icon={TrendingUp}

              label="Avg. order value"

              value={`₹${s.avgOrderValue.toLocaleString("en-IN")}`}

              hint={`${conversion}% payment success`}

            />

            <KpiCard

              icon={ShoppingBag}

              label="Orders"

              value={`${s.paidOrders} / ${s.orderCount}`}

              hint="Paid vs all"

            />

            <KpiCard

              icon={Package}

              label="Catalogue"

              value={String(s.productCount)}

              hint={`${s.inStockCount} in stock · ${s.featuredCount} featured`}

            />

          </div>



          <div className="mt-8 grid gap-6 xl:grid-cols-3">

            <section className="border border-border bg-background p-5 xl:col-span-2">

              <h3 className="font-display text-xl">Sales trend</h3>

              <p className="mt-1 text-xs text-muted-foreground">Daily revenue and order count</p>

              <div className="mt-6 h-72">

                {chartData.length ? (

                  <ChartContainer config={salesChartConfig} className="h-full w-full aspect-auto">

                    <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>

                      <CartesianGrid vertical={false} />

                      <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />

                      <YAxis

                        yAxisId="left"

                        tickLine={false}

                        axisLine={false}

                        tickFormatter={(v) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}

                      />

                      <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} />

                      <ChartTooltip content={<ChartTooltipContent />} />

                      <ChartLegend content={<ChartLegendContent />} />

                      <Area

                        yAxisId="left"

                        type="monotone"

                        dataKey="revenue"

                        stroke="var(--color-revenue)"

                        fill="var(--color-revenue)"

                        fillOpacity={0.15}

                        strokeWidth={2}

                      />

                      <Line

                        yAxisId="right"

                        type="monotone"

                        dataKey="orders"

                        stroke="var(--color-orders)"

                        strokeWidth={2}

                        dot={false}

                      />

                    </AreaChart>

                  </ChartContainer>

                ) : (

                  <EmptyChart message="No paid orders in the last 30 days yet." />

                )}

              </div>

            </section>



            <section className="border border-border bg-background p-5">

              <h3 className="font-display text-xl">Catalogue by category</h3>

              <p className="mt-1 text-xs text-muted-foreground">Published products</p>

              <div className="mt-6 h-72">

                {categoryData.length ? (

                  <ChartContainer config={categoryChartConfig} className="h-full w-full aspect-auto">

                    <PieChart>

                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />

                      <Pie

                        data={categoryData}

                        dataKey="count"

                        nameKey="name"

                        innerRadius={52}

                        outerRadius={80}

                        paddingAngle={2}

                      >

                        {categoryData.map((_, i) => (

                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />

                        ))}

                      </Pie>

                    </PieChart>

                  </ChartContainer>

                ) : (

                  <EmptyChart message="No products in catalogue." />

                )}

              </div>

              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">

                {categoryData.slice(0, 5).map((c) => (

                  <li key={c.name} className="flex justify-between gap-2">

                    <span>{c.name}</span>

                    <span>{c.count}</span>

                  </li>

                ))}

              </ul>

            </section>

          </div>



          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <section className="border border-border bg-background p-5">

              <h3 className="font-display text-xl">Top sellers</h3>

              <p className="mt-1 text-xs text-muted-foreground">By units sold (all paid orders)</p>

              <div className="mt-6 h-64">

                {topProducts.length ? (

                  <ChartContainer config={topProductsChartConfig} className="h-full w-full aspect-auto">

                    <BarChart data={topProducts} layout="vertical" margin={{ left: 4, right: 12 }}>

                      <CartesianGrid horizontal={false} />

                      <XAxis type="number" tickLine={false} axisLine={false} />

                      <YAxis

                        type="category"

                        dataKey="name"

                        width={100}

                        tickLine={false}

                        axisLine={false}

                        tick={{ fontSize: 10 }}

                      />

                      <ChartTooltip content={<ChartTooltipContent />} />

                      <Bar dataKey="quantity" fill="var(--color-quantity)" radius={[0, 4, 4, 0]} />

                    </BarChart>

                  </ChartContainer>

                ) : (

                  <EmptyChart message="No line-item sales data yet." />

                )}

              </div>

            </section>



            <section className="border border-border bg-background p-5">

              <h3 className="font-display text-xl">Order pipeline</h3>

              <p className="mt-1 text-xs text-muted-foreground">Payment &amp; fulfillment breakdown</p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">

                <div className="h-52">

                  <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground">PAYMENT</p>

                  {paymentData.length ? (

                    <ChartContainer config={{ value: { label: "Orders", color: "hsl(var(--primary))" } }} className="h-full aspect-auto">

                      <BarChart data={paymentData}>

                        <CartesianGrid vertical={false} />

                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />

                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />

                        <ChartTooltip content={<ChartTooltipContent />} />

                        <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />

                      </BarChart>

                    </ChartContainer>

                  ) : (

                    <EmptyChart message="No orders yet." />

                  )}

                </div>

                <div className="h-52">

                  <p className="mb-2 text-xs font-semibold tracking-widest text-muted-foreground">FULFILLMENT</p>

                  {fulfillmentData.length ? (

                    <ChartContainer config={{ value: { label: "Paid orders", color: "hsl(var(--chart-4))" } }} className="h-full aspect-auto">

                      <LineChart data={fulfillmentData}>

                        <CartesianGrid vertical={false} />

                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />

                        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />

                        <ChartTooltip content={<ChartTooltipContent />} />

                        <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot />

                      </LineChart>

                    </ChartContainer>

                  ) : (

                    <EmptyChart message="No paid orders to fulfil yet." />

                  )}

                </div>

              </div>

            </section>

          </div>



          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">

            <section className="border border-border bg-background">

              <div className="border-b border-border px-5 py-4">

                <h3 className="font-display text-xl">Recent orders</h3>

              </div>

              {data.recentOrders?.length ? (

                <ul className="divide-y divide-border">

                  {data.recentOrders.map((o) => (

                    <li

                      key={o.orderNumber}

                      className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm"

                    >

                      <div>

                        <p className="font-medium">{o.orderNumber}</p>

                        <p className="text-xs text-muted-foreground">

                          {o.paymentStatus} · {o.fulfillmentStatus}

                        </p>

                      </div>

                      <p className="font-medium">₹{o.total.toLocaleString("en-IN")}</p>

                    </li>

                  ))}

                </ul>

              ) : (

                <p className="px-5 py-8 text-sm text-muted-foreground">No orders yet.</p>

              )}

            </section>



            <aside className="space-y-4">

              <div className="border border-border bg-muted/30 p-5">

                <p className="text-xs text-muted-foreground">Unread contact forms</p>

                <p className="mt-2 font-display text-3xl">{s.unreadSubmissions}</p>

                <Button asChild variant="link" className="mt-2 h-auto p-0 text-xs">

                  <Link to="/admin/submissions">Open submissions</Link>

                </Button>

              </div>

              {topProducts.length > 0 && (

                <div className="border border-border bg-background p-5">

                  <p className="text-xs font-semibold tracking-widest text-muted-foreground">TOP REVENUE</p>

                  <ul className="mt-3 space-y-2 text-sm">

                    {data.topProducts.slice(0, 4).map((p) => (

                      <li key={p._id} className="flex justify-between gap-2">

                        <span className="truncate text-muted-foreground">{p.name}</span>

                        <span className="shrink-0">₹{p.revenue.toLocaleString("en-IN")}</span>

                      </li>

                    ))}

                  </ul>

                </div>

              )}

            </aside>

          </div>

        </>

      )}

    </div>

  );

}



function KpiCard({

  icon: Icon,

  label,

  value,

  hint,

}: {

  icon: ComponentType<{ className?: string }>;

  label: string;

  value: string;

  hint: string;

}) {

  return (

    <div className="border border-border bg-background p-5">

      <div className="flex items-start justify-between gap-2">

        <p className="text-xs tracking-widest text-muted-foreground">{label}</p>

        <Icon className="size-4 text-muted-foreground" aria-hidden />

      </div>

      <p className="mt-3 font-display text-3xl">{value}</p>

      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>

    </div>

  );

}



function EmptyChart({ message }: { message: string }) {

  return (

    <p className="flex h-full min-h-[8rem] items-center justify-center text-center text-sm text-muted-foreground">

      {message}

    </p>

  );

}


