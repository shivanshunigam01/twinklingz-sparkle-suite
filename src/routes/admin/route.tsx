import { Outlet, createFileRoute, redirect, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminToken, isAdminAuthed } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    const isLogin = location.pathname === "/admin/login";
    if (!isLogin && !isAdminAuthed()) {
      throw redirect({ to: "/admin/login" });
    }
    if (isLogin && isAdminAuthed()) {
      throw redirect({ to: "/admin/dashboard" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/admin/login") {
    return <Outlet />;
  }
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}

export function adminToken() {
  return getAdminToken();
}
