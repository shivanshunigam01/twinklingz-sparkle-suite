import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileDown, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { FulfillmentStatusBadge, PaymentStatusBadge } from "@/components/order-status-badges";
import { apiDownload, apiFetch } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { FULFILLMENT_OPTIONS } from "@/lib/order-status";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { collectImageUrls, isCloudinaryUrl } from "@/lib/product-images";
import { usePublicProducts } from "@/lib/use-public-products";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type OrderItem = {
  name: string;
  quantity: number;
  image?: string;
  slug?: string;
  sku?: string;
  unitPrice?: number;
};

function resolveOrderItemImage(
  item: OrderItem,
  catalog: ReturnType<typeof usePublicProducts>["data"],
): string {
  const fromApi = item.image?.trim();
  if (fromApi && isCloudinaryUrl(fromApi)) return fromApi;

  const product = catalog?.find(
    (p) => (item.slug && p.slug === item.slug) || (item.sku && p.sku === item.sku),
  );
  if (product) {
    const urls = collectImageUrls(product);
    if (urls[0]) return urls[0];
  }

  return fromApi || "";
}

type OrderRow = {
  _id: string;
  orderNumber: string;
  customer: { fullName: string; email: string; mobile: string };
  items: OrderItem[];
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  trackingNote?: string;
  razorpayPaymentId?: string;
  createdAt: string;
};

type PaymentFilter = "all" | "paid" | "pending" | "failed" | "refunded";

function formatAdminDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders | Twinklingz Admin" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const token = getAdminToken();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const qc = useQueryClient();
  const { data: catalog } = usePublicProducts();

  const queryKey = ["admin", "orders", paymentFilter] as const;

  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const q =
        paymentFilter === "all" ? "" : `?paymentStatus=${encodeURIComponent(paymentFilter)}`;
      return apiFetch<{ orders: OrderRow[] }>(`/admin/orders${q}`, { token });
    },
  });

  const patchMutation = useMutation({
    mutationFn: (payload: { id: string; fulfillmentStatus?: string; paymentStatus?: string }) =>
      apiFetch(`/admin/orders/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(payload.fulfillmentStatus ? { fulfillmentStatus: payload.fulfillmentStatus } : {}),
          ...(payload.paymentStatus ? { paymentStatus: payload.paymentStatus } : {}),
        }),
        token,
      }),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const orders = data?.orders ?? [];

  const summary = useMemo(() => {
    const paid = orders.filter((o) => o.paymentStatus === "paid").length;
    const pending = orders.filter((o) => o.paymentStatus === "pending").length;
    const failed = orders.filter((o) => o.paymentStatus === "failed").length;
    return { total: orders.length, paid, pending, failed };
  }, [orders]);

  async function downloadInvoice(order: OrderRow) {
    setDownloadingId(order._id);
    try {
      await apiDownload(`/admin/orders/${order._id}/invoice`, {
        token,
        filename: `Twinklingz-Invoice-${order.orderNumber}.pdf`,
      });
      toast.success("Invoice downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not download invoice");
    } finally {
      setDownloadingId(null);
    }
  }

  const paymentFilters: { id: PaymentFilter; label: string }[] = [
    { id: "all", label: "All payments" },
    { id: "paid", label: "Paid" },
    { id: "pending", label: "Pending" },
    { id: "failed", label: "Failed" },
    { id: "refunded", label: "Refunded" },
  ];

  return (
    <div className="pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[.2em] text-muted-foreground">OPERATIONS</p>
          <h2 className="mt-1 font-display text-4xl">Orders</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every checkout creates an order here. After Razorpay verification, payment status becomes{" "}
            <strong className="font-medium text-foreground">paid</strong> automatically.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" disabled={isFetching} onClick={() => refetch()}>
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} aria-hidden />
          Refresh
        </Button>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryTile label="Orders in view" value={summary.total} />
        <SummaryTile label="Paid" value={summary.paid} tone="success" />
        <SummaryTile label="Payment pending" value={summary.pending} tone="warn" />
        <SummaryTile label="Failed" value={summary.failed} tone={summary.failed ? "danger" : "default"} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {paymentFilters.map((f) => (
          <Button
            key={f.id}
            type="button"
            size="sm"
            variant={paymentFilter === f.id ? "default" : "outline"}
            onClick={() => setPaymentFilter(f.id)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading orders…</p>}
      {error && (
        <p className="mt-8 text-sm text-destructive">{error instanceof Error ? error.message : "Error loading orders"}</p>
      )}

      <ul className="mt-6 space-y-4">
        {orders.map((o) => (
          <li key={o._id} className="overflow-hidden border border-border bg-background shadow-sm">
            <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg">{o.orderNumber}</p>
                  <PaymentStatusBadge status={o.paymentStatus} />
                  <FulfillmentStatusBadge status={o.fulfillmentStatus} />
                </div>
                <p className="text-xs text-muted-foreground">{formatAdminDate(o.createdAt)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-6 px-4 py-5 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 gap-4">
                {o.items?.length > 0 && (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {o.items.map((item, index) => {
                      const imageSrc = resolveOrderItemImage(item, catalog);
                      return (
                        <div
                          key={`${item.sku ?? item.name}-${index}`}
                          className="relative size-16 overflow-hidden border border-border bg-muted sm:size-20"
                          title={item.name}
                        >
                          {imageSrc ? (
                            <LazyImage
                              src={imageSrc}
                              alt={item.name}
                              optimizeWidth={160}
                              priority
                              className="size-full object-cover"
                            />
                          ) : (
                            <span className="flex size-full items-center justify-center px-1 text-center text-[9px] leading-tight text-muted-foreground">
                              No image
                            </span>
                          )}
                          {item.quantity > 1 && (
                            <span className="absolute bottom-0 right-0 bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                              ×{item.quantity}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{o.customer.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {o.customer.email} · {o.customer.mobile}
                  </p>
                  {o.items?.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {o.items.map((item, index) => (
                        <li key={`${item.sku ?? item.name}-line-${index}`} className="truncate">
                          {item.name}
                          {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                          {item.unitPrice != null && (
                            <span className="text-foreground/80">
                              {" "}
                              · ₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-3 text-base font-semibold tabular-nums">₹{o.total.toLocaleString("en-IN")}</p>
                  {o.razorpayPaymentId ? (
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground" title="Razorpay payment ID">
                      Razorpay: {o.razorpayPaymentId}
                    </p>
                  ) : o.paymentStatus === "paid" ? (
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Paid — Razorpay ID not stored on this row</p>
                  ) : null}
                  {o.trackingNote ? <p className="mt-2 text-sm text-muted-foreground">{o.trackingNote}</p> : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={downloadingId === o._id || o.paymentStatus !== "paid"}
                      onClick={() => downloadInvoice(o)}
                    >
                      <FileDown className="size-4" />
                      {downloadingId === o._id ? "Preparing PDF…" : "Invoice (PDF)"}
                    </Button>
                    {o.paymentStatus === "pending" && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={patchMutation.isPending}
                        onClick={() => patchMutation.mutate({ id: o._id, paymentStatus: "paid" })}
                      >
                        Mark payment paid
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full shrink-0 lg:w-72">
                <p className="mb-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">FULFILLMENT</p>
                <div className="flex flex-wrap gap-2">
                  {FULFILLMENT_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      size="sm"
                      variant={o.fulfillmentStatus === opt.value ? "default" : "outline"}
                      disabled={patchMutation.isPending}
                      onClick={() => patchMutation.mutate({ id: o._id, fulfillmentStatus: opt.value })}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
        {!isLoading && !orders.length && (
          <li className="border border-dashed border-border bg-background px-4 py-14 text-center text-sm text-muted-foreground">
            {paymentFilter === "all"
              ? "No orders yet — they appear here when customers complete checkout."
              : `No orders with payment status “${paymentFilter}”.`}
          </li>
        )}
      </ul>
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "warn" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-500/25 bg-emerald-500/5"
      : tone === "warn"
        ? "border-amber-500/25 bg-amber-500/5"
        : tone === "danger"
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-background";
  return (
    <div className={cn("rounded-sm border px-4 py-3", toneClass)}>
      <p className="text-[10px] font-semibold tracking-[0.16em] text-muted-foreground">{label.toUpperCase()}</p>
      <p className="mt-1 font-display text-3xl tabular-nums">{value}</p>
    </div>
  );
}