/** Labels align with backend `Order` model enums. */
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export const FULFILLMENT_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export function paymentStatusLabel(status: string): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Payment pending";
    case "failed":
      return "Payment failed";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}

export function fulfillmentStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Order received";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function paymentStatusBadgeClass(status: string): string {
  switch (status) {
    case "paid":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300";
    case "pending":
      return "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200";
    case "failed":
      return "border-destructive/40 bg-destructive/10 text-destructive";
    case "refunded":
      return "border-border bg-muted text-muted-foreground";
    default:
      return "border-border bg-secondary text-secondary-foreground";
  }
}

export function fulfillmentStatusBadgeClass(status: string): string {
  switch (status) {
    case "delivered":
      return "border-emerald-500/25 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200";
    case "shipped":
      return "border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-200";
    case "processing":
      return "border-violet-500/30 bg-violet-500/10 text-violet-900 dark:text-violet-200";
    case "cancelled":
      return "border-destructive/30 bg-destructive/5 text-destructive";
    default:
      return "border-border bg-muted/60 text-foreground";
  }
}

export const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: "pending", label: "Received" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];