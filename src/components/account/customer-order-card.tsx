import { Link } from "@tanstack/react-router";
import { ChevronRight, Package } from "lucide-react";
import { FulfillmentStatusBadge, PaymentStatusBadge } from "@/components/order-status-badges";
import type { CustomerOrder } from "@/lib/use-customer-orders";
import { formatPrice } from "@/lib/catalog";

function formatOrderDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function CustomerOrderCard({
  order,
  customerEmail,
}: {
  order: CustomerOrder;
  customerEmail: string;
}) {
  const firstLines = order.items.slice(0, 2);
  const extraCount = order.items.length - firstLines.length;

  return (
    <li className="group overflow-hidden rounded-sm border border-white/40 bg-background/95 shadow-lg backdrop-blur-sm transition-shadow hover:shadow-xl">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:p-5">
        <div className="relative mx-auto size-24 shrink-0 overflow-hidden rounded-sm border border-border bg-muted sm:mx-0 sm:size-28">
          {order.previewImage ? (
            <img src={order.previewImage} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <Package className="size-8" aria-hidden />
            </div>
          )}
          {order.itemCount > 1 ? (
            <span className="absolute bottom-0 right-0 bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {order.itemCount} items
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p className="font-display text-xl text-primary">{order.orderNumber}</p>
            <p className="text-lg font-semibold tabular-nums text-foreground">{formatPrice(order.total)}</p>
          </div>
          <p className="mt-1 text-xs tracking-wide text-muted-foreground">Placed on {formatOrderDate(order.createdAt)}</p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <PaymentStatusBadge status={order.paymentStatus} />
            <FulfillmentStatusBadge status={order.fulfillmentStatus} />
          </div>

          {firstLines.length > 0 ? (
            <ul className="mt-3 space-y-0.5 text-sm text-muted-foreground">
              {firstLines.map((line) => (
                <li key={`${line.name}-${line.quantity}`} className="truncate">
                  {line.name}
                  {line.quantity > 1 ? ` × ${line.quantity}` : ""}
                </li>
              ))}
              {extraCount > 0 ? <li className="text-xs">+{extraCount} more</li> : null}
            </ul>
          ) : null}

          {order.trackingNote ? (
            <p className="mt-2 rounded-sm border border-border/80 bg-muted/40 px-3 py-2 text-left text-xs text-muted-foreground">
              {order.trackingNote}
            </p>
          ) : null}

          <Link
            to="/track-order"
            search={{ orderNumber: order.orderNumber, emailOrPhone: customerEmail }}
            className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-sm border border-primary/25 bg-primary/5 px-4 py-2.5 text-xs font-semibold tracking-[0.14em] text-primary transition-colors hover:bg-primary/10 sm:w-auto"
          >
            TRACK THIS ORDER
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </li>
  );
}