import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/admin/products/", label: "All products", exact: true },
  { to: "/admin/products/new", label: "Add product", exact: false },
] as const;

function isProductsListPath(pathname: string) {
  return pathname === "/admin/products" || pathname === "/admin/products/";
}

export function ProductsSubnav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const editing =
    pathname.startsWith("/admin/products/") &&
    pathname !== "/admin/products/new" &&
    !isProductsListPath(pathname);

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-border pb-3" aria-label="Products">
      {tabs.map(({ to, label, exact }) => {
        const active = exact ? isProductsListPath(pathname) : pathname === to;
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition hover:bg-muted",
              active && "bg-muted font-medium",
            )}
          >
            {label}
          </Link>
        );
      })}
      {editing && (
        <span className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">Editing</span>
      )}
    </nav>
  );
}
