import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/catalog";

type CartItem = { product: Product; quantity: number };
type StoreContextValue = {
  cart: CartItem[]; wishlist: string[]; bagOpen: boolean; setBagOpen: (open: boolean) => void;
  addToBag: (product: Product) => void; removeFromBag: (id: string) => void; updateQuantity: (id: string, quantity: number) => void;
  toggleWishlist: (id: string) => void; subtotal: number;
};
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  useEffect(() => {
    try { setWishlist(JSON.parse(localStorage.getItem("twinklingz-wishlist") ?? "[]")); } catch { setWishlist([]); }
  }, []);
  useEffect(() => { localStorage.setItem("twinklingz-wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  const value = useMemo(() => ({
    cart, wishlist, bagOpen, setBagOpen,
    addToBag: (product: Product) => { setCart((items) => { const found = items.find((item) => item.product.id === product.id); return found ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, quantity: 1 }]; }); setBagOpen(true); },
    removeFromBag: (id: string) => setCart((items) => items.filter((item) => item.product.id !== id)),
    updateQuantity: (id: string, quantity: number) => setCart((items) => items.map((item) => item.product.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
    toggleWishlist: (id: string) => setWishlist((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]),
    subtotal: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  }), [cart, wishlist, bagOpen]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() { const value = useContext(StoreContext); if (!value) throw new Error("StoreProvider missing"); return value; }
