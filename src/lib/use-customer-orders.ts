import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export type CustomerOrderLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  image: string;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  currency: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  trackingNote: string;
  itemCount: number;
  previewImage: string;
  items: CustomerOrderLine[];
};

export function useCustomerOrders(token: string | null) {
  return useQuery({
    queryKey: ["customer-orders", token],
    enabled: Boolean(token),
    queryFn: async () => {
      const res = await apiFetch<{ orders: CustomerOrder[] }>("/orders/mine", { token });
      return res.orders;
    },
    staleTime: 30_000,
  });
}