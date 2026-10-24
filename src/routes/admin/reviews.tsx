import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminReview = {
  id: string;
  productSlug: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({ meta: [{ title: "Reviews | Twinklingz Admin" }] }),
  component: ReviewsAdminPage,
});

function ReviewsAdminPage() {
  const token = getAdminToken();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews", "pending"],
    queryFn: () => apiFetch<{ reviews: AdminReview[] }>("/admin/reviews?status=pending", { token }),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      apiFetch(`/admin/reviews/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, vars) => {
      toast.success(vars.status === "approved" ? "Review published" : "Review rejected");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      if (vars.status === "approved") {
        qc.invalidateQueries({ queryKey: ["public", "products"] });
      }
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/reviews/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      toast.success("Review removed");
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      qc.invalidateQueries({ queryKey: ["public", "products"] });
    },
  });

  const pending = data?.reviews ?? [];

  return (
    <div>
      <h2 className="font-display text-4xl">Review queue</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Approve new customer reviews before they go live. To edit, unpublish, or delete any review, use{" "}
        <Link to="/admin/manage-reviews" className="font-medium text-primary underline-offset-4 hover:underline">
          Manage reviews
        </Link>
        .
      </p>
      {isLoading && <p className="mt-8 text-sm">Loading…</p>}
      <ul className="mt-8 divide-y divide-border border border-border bg-background">
        {pending.map((r) => (
          <li key={r.id} className="px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-widest text-accent">{r.productSlug}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StarRow value={r.rating} />
                  {r.title ? <span className="text-sm font-medium">{r.title}</span> : null}
                </div>
                <p className="mt-2 text-sm leading-relaxed">{r.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.authorName} · {new Date(r.createdAt).toLocaleString()}
                </p>
                <a
                  href={`/products/${r.productSlug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs underline-offset-4 hover:underline"
                >
                  View product
                </a>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button size="sm" onClick={() => setStatus.mutate({ id: r.id, status: "approved" })}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatus.mutate({ id: r.id, status: "rejected" })}
                >
                  Reject
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove.mutate(r.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
        {!isLoading && pending.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">No reviews waiting for approval.</li>
        )}
      </ul>
    </div>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("size-3.5", n <= value ? "fill-accent text-accent" : "text-muted-foreground/30")}
        />
      ))}
    </span>
  );
}
