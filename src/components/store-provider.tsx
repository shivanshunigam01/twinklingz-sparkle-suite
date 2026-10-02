import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/catalog";

type CartItem = { product: Product; quantity: number };
type StoreContextValue = {
  cart: CartItem[];
  wishlist: string[];
  recentlyViewed: string[];
  bagOpen: boolean;
  setBagOpen: (open: boolean) => void;
  addToBag: (product: Product) => void;
  removeFromBag: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleWishlist: (id: string) => void;
  trackRecentlyViewed: (id: string) => void;
  subtotal: number;
};
const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [bagOpen, setBagOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  useEffect(() => {
    try { setWishlist(JSON.parse(localStorage.getItem("twinklingz-wishlist") ?? "[]")); } catch { setWishlist([]); }
    try {
      setRecentlyViewed(JSON.parse(localStorage.getItem("twinklingz-recent") ?? "[]"));
    } catch {
      setRecentlyViewed([]);
    }
  }, []);
  useEffect(() => { localStorage.setItem("twinklingz-wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => {
    localStorage.setItem("twinklingz-recent", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const trackRecentlyViewed = useCallback(
    (id: string) => setRecentlyViewed((ids) => [id, ...ids.filter((x) => x !== id)].slice(0, 8)),
    [],
  );

  const value = useMemo(() => ({
    cart, wishlist, recentlyViewed, bagOpen, setBagOpen,
    addToBag: (product: Product) => { setCart((items) => { const found = items.find((item) => item.product.id === product.id); return found ? items.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...items, { product, quantity: 1 }]; }); setBagOpen(true); },
    removeFromBag: (id: string) => setCart((items) => items.filter((item) => item.product.id !== id)),
    updateQuantity: (id: string, quantity: number) => setCart((items) => items.map((item) => item.product.id === id ? { ...item, quantity: Math.max(1, quantity) } : item)),
    toggleWishlist: (id: string) => setWishlist((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]),
    trackRecentlyViewed,
    subtotal: cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  }), [cart, wishlist, recentlyViewed, bagOpen, trackRecentlyViewed]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
export function useStore() { const value = useContext(StoreContext); if (!value) throw new Error("StoreProvider missing"); return value; }
