import { cn } from "@/lib/utils";
import {
  fulfillmentStatusBadgeClass,
  fulfillmentStatusLabel,
  paymentStatusBadgeClass,
  paymentStatusLabel,
} from "@/lib/order-status";

export function PaymentStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        paymentStatusBadgeClass(status),
        className,
      )}
    >
      {paymentStatusLabel(status)}
    </span>
  );
}

export function FulfillmentStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        fulfillmentStatusBadgeClass(status),
        className,
      )}
    >
      {fulfillmentStatusLabel(status)}
    </span>
  );
}