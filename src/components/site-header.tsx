import { useEffect, useLayoutEffect, useState } from "react";
import { Heart, Home, Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useStore } from "@/components/store-provider";
import { LazyImage } from "@/components/ui/lazy-image";
import { formatPrice } from "@/lib/catalog";
import { ProductPrice } from "@/components/product-price";
import { ANNOUNCEMENT_BAR } from "@/lib/cms-settings";
import { usePublicProducts } from "@/lib/use-public-products";
import { useCustomerAuth } from "@/components/customer-auth-provider";
import { storefrontNav, type StorefrontNavItem } from "@/lib/storefront-nav";

function NavLink({
  item,
  className,
  onNavigate,
}: {
  item: StorefrontNavItem;
  className: string;
  onNavigate?: () => void;
}) {
  if (item.kind === "collection") {
    return (
      <Link
        to="/collections/$slug"
        params={{ slug: item.slug }}
        className={className}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    );
  }
  return (
    <Link to={item.to} className={className} onClick={onNavigate}>
      {item.label}
    </Link>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [term, setTerm] = useState("");
  const path = useRouterState({ select: (state) => state.location.pathname });
  const hero = path === "/" && !scrolled;
  const { cart, bagOpen, setBagOpen, subtotal, removeFromBag } = useStore();
  const { data: catalog = [] } = usePublicProducts();
  const { customer } = useCustomerAuth();
  const accountLabel = customer?.name?.split(/\s+/)[0] || customer?.email?.split("@")[0] || "Account";

  useLayoutEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (path !== "/") return;
    const syncScroll = () => setScrolled(window.scrollY > 48);
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) syncScroll();
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [path]);

  const results = term.trim()
    ? catalog.filter((p) => `${p.name} ${p.category} ${p.sku}`.toLowerCase().includes(term.toLowerCase())).slice(0, 8)
    : [];

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 bg-primary py-2 text-center text-[10px] tracking-[0.16em] text-primary-foreground sm:text-xs">
        {ANNOUNCEMENT_BAR}
      </div>
      <header
        className={`fixed inset-x-0 top-8 z-40 transition-all duration-500 ${hero ? "border-transparent bg-transparent text-primary-foreground" : "border-b border-border bg-background/95 text-foreground shadow-sm backdrop-blur"}`}
      >
        <div className="mx-auto flex h-[70px] max-w-[1500px] items-center justify-between px-4 lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenu(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <BrandLogo light={hero} />
          <nav className="hidden items-center gap-5 lg:flex">
            {storefrontNav.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                className="text-[11px] font-semibold tracking-[0.12em] transition hover:text-accent"
              />
            ))}
          </nav>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" onClick={() => setSearch(true)} aria-label="Search">
              <Search />
            </Button>
            <Button
              asChild
              variant="ghost"
              className="hidden max-w-[9rem] truncate px-2 sm:inline-flex sm:gap-1.5"
            >
              <Link to="/account" aria-label={customer ? `Account, signed in as ${customer.name}` : "Account"}>
                <UserRound className="size-4 shrink-0" />
                <span className="truncate text-[11px] font-semibold tracking-wide">{accountLabel}</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
              <Link to="/wishlist" aria-label="Wishlist">
                <Heart />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setBagOpen(true)}
              aria-label={`Shopping bag with ${cart.length} items`}
              className="relative"
            >
              <ShoppingBag />
              <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] text-accent-foreground">
                {cart.reduce((n, item) => n + item.quantity, 0)}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent
          side="left"
          className="flex h-full w-[88%] max-w-sm flex-col gap-0 overflow-hidden p-0 sm:max-w-sm"
        >
          <SheetHeader className="shrink-0 space-y-0 border-b border-border px-6 py-5 pr-14 text-left">
            <SheetTitle className="font-display text-left">
              <BrandLogo />
            </SheetTitle>
          </SheetHeader>
          <nav
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-2 [-webkit-overflow-scrolling:touch]"
            aria-label="Main menu"
          >
            {storefrontNav.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                className="block border-b border-border py-4 font-display text-2xl"
                onNavigate={() => setMenu(false)}
              />
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <Sheet open={search} onOpenChange={setSearch}>
        <SheetContent side="top" className="max-h-[80vh] overflow-y-auto bg-background px-5 py-10">
          <SheetHeader className="mx-auto w-full max-w-3xl">
            <SheetTitle className="font-display text-3xl">Find your sparkle</SheetTitle>
          </SheetHeader>
          <div className="mx-auto mt-6 max-w-3xl">
            <div className="flex border-b border-primary">
              <Search className="mt-3" />
              <input
                autoFocus
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products, categories, collections..."
                className="w-full bg-transparent px-4 py-3 outline-none"
              />
            </div>
            {!term && (
              <div className="mt-8">
                <p className="text-xs font-semibold tracking-widest">TRENDING SEARCHES</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Layered necklaces", "Rose gold earrings", "Statement sets"].map((q) => (
                    <Button key={q} variant="outline" onClick={() => setTerm(q)}>
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {results.map((p) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                onClick={() => setSearch(false)}
                className="flex items-center gap-4 border-b border-border py-4"
              >
                <LazyImage src={p.image} alt="" optimizeWidth={128} className="size-16 object-cover" />
                <span className="flex-1 font-display text-lg">{p.name}</span>
                <span className="shrink-0">
                  <ProductPrice product={p} layout="inline" />
                </span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={bagOpen} onOpenChange={setBagOpen}>
        <SheetContent className="flex w-full flex-col bg-background sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-display text-2xl">Your Bag ({cart.length})</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex-1 space-y-5 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingBag className="mx-auto mb-4 size-10 text-muted-foreground" />
                <p className="font-display text-2xl">Your bag is waiting</p>
                <Button asChild className="mt-5">
                  <Link to="/shop" onClick={() => setBagOpen(false)}>
                    Discover Jewellery
                  </Link>
                </Button>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-4">
                  <LazyImage src={product.image} alt="" optimizeWidth={160} className="h-24 w-20 object-cover" />
                  <div className="flex-1">
                    <p className="font-display text-lg">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {quantity}</p>
                    <div className="mt-2">
                      <ProductPrice product={product} layout="inline" />
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Line total · {formatPrice(product.price * quantity)}
                      </p>
                    </div>
                    <Button variant="link" className="h-auto p-0 text-xs" onClick={() => removeFromBag(product.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {cart.length > 0 && (
            <div className="border-t border-border pt-5">
              <div className="mb-4 flex justify-between font-semibold">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline">
                  <Link to="/cart" onClick={() => setBagOpen(false)}>
                    VIEW BAG
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/checkout" onClick={() => setBagOpen(false)}>
                    CHECKOUT
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
        <Link to="/" className="mobile-nav-link">
          <Home />
          HOME
        </Link>
        <Link to="/shop" className="mobile-nav-link">
          <ShoppingBag />
          SHOP
        </Link>
        <Link to="/search" className="mobile-nav-link">
          <Search />
          SEARCH
        </Link>
        <Link to="/wishlist" className="mobile-nav-link">
          <Heart />
          WISHLIST
        </Link>
        <Link to="/account" className="mobile-nav-link">
          <UserRound />
          ACCOUNT
        </Link>
      </nav>
    </>
  );
}
