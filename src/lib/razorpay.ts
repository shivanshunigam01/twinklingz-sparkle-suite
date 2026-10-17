declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

const SCRIPT_ID = "razorpay-checkout-js";

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  const existing = document.getElementById(SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")));
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
}

export type RazorpayCheckoutParams = {
  keyId: string;
  amount: number;
  currency: string;
  orderId: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  onSuccess: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss?: () => void;
  onFailed?: (response: { error?: { description?: string; reason?: string } }) => void;
};

export async function openRazorpayCheckout(params: RazorpayCheckoutParams) {
  await loadRazorpayScript();
  if (!window.Razorpay) throw new Error("Razorpay is not available");
  const rzp = new window.Razorpay({
    key: params.keyId,
    amount: params.amount,
    currency: params.currency,
    name: params.name || "Twinklingz",
    description: params.description || "Order payment",
    order_id: params.orderId,
    prefill: params.prefill,
    handler: (response: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => params.onSuccess(response),
    modal: { ondismiss: params.onDismiss },
  });
  if (params.onFailed) {
    rzp.on("payment.failed", (response: { error?: { description?: string; reason?: string } }) => {
      params.onFailed?.(response);
    });
  }
  rzp.open();
}
