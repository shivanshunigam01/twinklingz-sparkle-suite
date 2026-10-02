import { useEffect, useState } from "react";
import { Heart, Home, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore } from "@/components/store-provider";
import { formatPrice, products } from "@/lib/catalog";
const nav = [
  { label: "NEW IN", to: "/new-arrivals" as const }, { label: "NECKLACES", to: "/collections/$slug" as const, slug: "necklaces" }, { label: "EARRINGS", to: "/collections/$slug" as const, slug: "earrings" },
  { label: "BRACELETS", to: "/collections/$slug" as const, slug: "bracelets" }, { label: "RINGS", to: "/collections/$slug" as const, slug: "rings" }, { label: "SETS", to: "/collections/$slug" as const, slug: "jewellery-sets" },
  { label: "BESTSELLERS", to: "/bestsellers" as const }, { label: "COLLECTIONS", to: "/collections" as const }, { label: "ABOUT", to: "/about" as const },
];
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false); const [menu, setMenu] = useState(false); const [search, setSearch] = useState(false); const [term, setTerm] = useState("");
  const path = useRouterState({ select: (state) => state.location.pathname }); const hero = path === "/" && !scrolled;
  const { cart, bagOpen, setBagOpen, subtotal, removeFromBag } = useStore();
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 48); onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); return () => window.removeEventListener("scroll", onScroll); }, []);
  const results = term.trim() ? products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(term.toLowerCase())).slice(0, 5) : [];
  return <>
    <div className="fixed inset-x-0 top-0 z-50 bg-primary py-2 text-center text-[10px] tracking-[0.16em] text-primary-foreground sm:text-xs">✦ FREE SHIPPING ON SELECTED ORDERS <span className="mx-2 opacity-60">|</span> SECURE ONLINE PAYMENTS ✦</div>
    <header className={`fixed inset-x-0 top-8 z-40 transition-all duration-500 ${hero ? "border-transparent bg-transparent text-primary-foreground" : "border-b border-border bg-background/95 text-foreground shadow-sm backdrop-blur"}`}>
      <div className="mx-auto flex h-[70px] max-w-[1500px] items-center justify-between px-4 lg:px-8">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu"><Menu /></Button>
        <BrandLogo light={hero} />
        <nav className="hidden items-center gap-5 lg:flex">{nav.map((item) => item.slug ? <Link key={item.label} to="/collections/$slug" params={{ slug: item.slug }} className="text-[11px] font-semibold tracking-[0.12em] transition hover:text-accent">{item.label}</Link> : <Link key={item.label} to={item.to} className="text-[11px] font-semibold tracking-[0.12em] transition hover:text-accent">{item.label}</Link>)}</nav>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" onClick={() => setSearch(true)} aria-label="Search"><Search /></Button>
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex"><Link to="/account" aria-label="Account"><UserRound /></Link></Button>
          <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex"><Link to="/wishlist" aria-label="Wishlist"><Heart /></Link></Button>
          <Button variant="ghost" size="icon" onClick={() => setBagOpen(true)} aria-label={`Shopping bag with ${cart.length} items`} className="relative"><ShoppingBag /><span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] text-accent-foreground">{cart.reduce((n, item) => n + item.quantity, 0)}</span></Button>
        </div>
      </div>
    </header>
    <Sheet open={menu} onOpenChange={setMenu}><SheetContent side="left" className="w-[88%] bg-background"><SheetHeader><SheetTitle><BrandLogo /></SheetTitle></SheetHeader><nav className="mt-10 flex flex-col">{nav.map((item) => item.slug ? <Link key={item.label} to="/collections/$slug" params={{ slug: item.slug }} onClick={() => setMenu(false)} className="border-b border-border py-4 font-display text-2xl">{item.label}</Link> : <Link key={item.label} to={item.to} onClick={() => setMenu(false)} className="border-b border-border py-4 font-display text-2xl">{item.label}</Link>)}</nav></SheetContent></Sheet>
    <Sheet open={search} onOpenChange={setSearch}><SheetContent side="top" className="max-h-[80vh] overflow-y-auto bg-background px-5 py-10"><SheetHeader className="mx-auto w-full max-w-3xl"><SheetTitle className="font-display text-3xl">Find your sparkle</SheetTitle></SheetHeader><div className="mx-auto mt-6 max-w-3xl"><div className="flex border-b border-primary"><Search className="mt-3"/><input autoFocus value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search products, categories, collections..." className="w-full bg-transparent px-4 py-3 outline-none" /></div>{!term && <div className="mt-8"><p className="text-xs font-semibold tracking-widest">TRENDING SEARCHES</p><div className="mt-3 flex flex-wrap gap-2">{["Layered necklaces","Rose gold earrings","Statement sets"].map((q) => <Button key={q} variant="outline" onClick={() => setTerm(q)}>{q}</Button>)}</div></div>}{results.map((p) => <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }} onClick={() => setSearch(false)} className="flex items-center gap-4 border-b border-border py-4"><img src={p.image} alt="" className="size-16 object-cover"/><span className="flex-1 font-display text-lg">{p.name}</span><span>{formatPrice(p.price)}</span></Link>)}</div></SheetContent></Sheet>
    <Sheet open={bagOpen} onOpenChange={setBagOpen}><SheetContent className="flex w-full flex-col bg-background sm:max-w-md"><SheetHeader><SheetTitle className="font-display text-2xl">Your Bag ({cart.length})</SheetTitle></SheetHeader><div className="mt-6 flex-1 space-y-5 overflow-y-auto">{cart.length === 0 ? <div className="py-20 text-center"><ShoppingBag className="mx-auto mb-4 size-10 text-muted-foreground"/><p className="font-display text-2xl">Your bag is waiting</p><Button asChild className="mt-5"><Link to="/shop" onClick={() => setBagOpen(false)}>Discover Jewellery</Link></Button></div> : cart.map(({ product, quantity }) => <div key={product.id} className="flex gap-4"><img src={product.image} alt="" className="h-24 w-20 object-cover"/><div className="flex-1"><p className="font-display text-lg">{product.name}</p><p className="text-xs text-muted-foreground">Rose Gold · Qty {quantity}</p><p className="mt-2 font-semibold">{formatPrice(product.price * quantity)}</p><Button variant="link" className="h-auto p-0 text-xs" onClick={() => removeFromBag(product.id)}>Remove</Button></div></div>)}</div>{cart.length > 0 && <div className="border-t border-border pt-5"><div className="mb-4 flex justify-between font-semibold"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div><div className="grid grid-cols-2 gap-3"><Button asChild variant="outline"><Link to="/cart" onClick={() => setBagOpen(false)}>VIEW BAG</Link></Button><Button asChild><Link to="/checkout" onClick={() => setBagOpen(false)}>CHECKOUT</Link></Button></div></div>}</SheetContent></Sheet>
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"><Link to="/" className="mobile-nav-link"><Home/>HOME</Link><Link to="/shop" className="mobile-nav-link"><ShoppingBag/>SHOP</Link><Link to="/search" className="mobile-nav-link"><Search/>SEARCH</Link><Link to="/wishlist" className="mobile-nav-link"><Heart/>WISHLIST</Link><Link to="/account" className="mobile-nav-link"><UserRound/>ACCOUNT</Link></nav>
  </>;
}
