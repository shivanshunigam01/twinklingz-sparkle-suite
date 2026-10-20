import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { LazyImage } from "@/components/ui/lazy-image";
import { toast } from "sonner";

type OrderItem = {
  name: string;
  quantity: number;
  image?: string;
  sku?: string;
  unitPrice?: number;
};

type OrderRow = {
  _id: string;
  orderNumber: string;
  customer: { fullName: string; email: string; mobile: string };
  items: OrderItem[];
  total: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  createdAt: string;
};

const fulfillmentOptions = ["received", "processing", "shipped", "delivered", "cancelled"] as const;

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders | Twinklingz Admin" }] }),
  component: OrdersPage,
});

function OrdersPage() {
  const token = getAdminToken();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => apiFetch<{ orders: OrderRow[] }>("/admin/orders", { token }),
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, fulfillmentStatus }: { id: string; fulfillmentStatus: string }) =>
      apiFetch(`/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ fulfillmentStatus }),
        token,
      }),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <h2 className="font-display text-4xl">Orders</h2>
      <p className="mt-2 text-muted-foreground">Update fulfillment status after Razorpay payment is verified.</p>
      {isLoading && <p className="mt-8 text-sm">Loading…</p>}
      {error && <p className="mt-8 text-sm text-destructive">{error instanceof Error ? error.message : "Error"}</p>}
      <ul className="mt-8 divide-y divide-border border border-border bg-background">
        {(data?.orders ?? []).map((o) => (
          <li key={o._id} className="px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-1 gap-4">
                {o.items?.length > 0 && (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {o.items.map((item, index) => (
                      <div
                        key={`${item.sku ?? item.name}-${index}`}
                        className="relative size-16 overflow-hidden border border-border bg-muted sm:size-20"
                        title={item.name}
                      >
                        {item.image ? (
                          <LazyImage
                            src={item.image}
                            alt={item.name}
                            optimizeWidth={160}
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
                    ))}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {o.customer.fullName} · {o.customer.email} · {o.customer.mobile}
                  </p>
                  {o.items?.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
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
                  <p className="mt-2 text-sm">
                    ₹{o.total.toLocaleString("en-IN")} · Payment: <strong>{o.paymentStatus}</strong>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
                {fulfillmentOptions.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={o.fulfillmentStatus === status ? "default" : "outline"}
                    onClick={() => patchMutation.mutate({ id: o._id, fulfillmentStatus: status })}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </li>
        ))}
        {!isLoading && !data?.orders?.length && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">No orders yet.</li>
        )}
      </ul>
    </div>
  );
}
