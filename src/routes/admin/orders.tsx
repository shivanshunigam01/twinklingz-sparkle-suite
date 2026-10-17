import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type OrderRow = {
  _id: string;
  orderNumber: string;
  customer: { fullName: string; email: string; mobile: string };
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
          <li key={o._id} className="px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {o.customer.fullName} · {o.customer.email} · {o.customer.mobile}
                </p>
                <p className="mt-1 text-sm">
                  ₹{o.total.toLocaleString("en-IN")} · Payment: <strong>{o.paymentStatus}</strong>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
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
