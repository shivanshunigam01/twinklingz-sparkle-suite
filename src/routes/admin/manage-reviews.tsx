import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ReviewStatus = "pending" | "approved" | "rejected";

type AdminReview = {
  id: string;
  productSlug: string;
  authorName: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  createdAt: string;
};

const STATUS_FILTERS: { id: "all" | ReviewStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Published" },
  { id: "rejected", label: "Rejected" },
];

export const Route = createFileRoute("/admin/manage-reviews")({
  head: () => ({ meta: [{ title: "Manage reviews | Twinklingz Admin" }] }),
  component: ManageReviewsPage,
});

function ManageReviewsPage() {
  const token = getAdminToken();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"all" | ReviewStatus>("all");
  const [slugFilter, setSlugFilter] = useState("");
  const [editing, setEditing] = useState<AdminReview | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const queryStatus = statusFilter === "all" ? undefined : statusFilter;
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "reviews", "manage", queryStatus, slugFilter.trim()],
    queryFn: () => {
      const params = new URLSearchParams();
      if (queryStatus) params.set("status", queryStatus);
      if (slugFilter.trim()) params.set("productSlug", slugFilter.trim());
      const qs = params.toString();
      return apiFetch<{ reviews: AdminReview[] }>(`/admin/reviews${qs ? `?${qs}` : ""}`, { token });
    },
  });

  const reviews = data?.reviews ?? [];

  function invalidateAll() {
    qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    qc.invalidateQueries({ queryKey: ["public", "products"] });
    qc.invalidateQueries({ queryKey: ["product-reviews"] });
  }

  const patchReview = useMutation({
    mutationFn: (payload: {
      id: string;
      status?: ReviewStatus;
      rating?: number;
      title?: string;
      body?: string;
    }) => {
      const { id, ...body } = payload;
      return apiFetch(`/admin/reviews/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      invalidateAll();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/reviews/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      toast.success("Review deleted");
      invalidateAll();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  function openEdit(review: AdminReview) {
    setEditing(review);
    setEditRating(review.rating);
    setEditTitle(review.title);
    setEditBody(review.body);
  }

  async function saveEdit() {
    if (!editing || editBody.trim().length < 10) {
      toast.error("Review text must be at least 10 characters");
      return;
    }
    try {
      await patchReview.mutateAsync({
        id: editing.id,
        rating: editRating,
        title: editTitle.trim(),
        body: editBody.trim(),
      });
      toast.success("Review updated");
      setEditing(null);
    } catch {
      /* toast from mutation */
    }
  }

  function setStatus(id: string, status: ReviewStatus) {
    patchReview.mutate(
      { id, status },
      {
        onSuccess: () => toast.success(status === "approved" ? "Review published" : `Marked as ${status}`),
      },
    );
  }

  function confirmDelete(review: AdminReview) {
    if (!window.confirm(`Delete this review by ${review.authorName}? This cannot be undone.`)) return;
    remove.mutate(review.id);
  }

  return (
    <div>
      <h2 className="font-display text-4xl">Manage reviews</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        View, edit, publish, unpublish, or delete any customer review. Changes to published reviews update product
        ratings on the storefront.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ id, label }) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={statusFilter === id ? "default" : "outline"}
              onClick={() => setStatusFilter(id)}
            >
              {label}
            </Button>
          ))}
        </div>
        <label className="block w-full max-w-xs text-xs">
          Filter by product slug
          <input
            value={slugFilter}
            onChange={(e) => setSlugFilter(e.target.value)}
            placeholder="e.g. style-57165"
            className="mt-1 w-full border border-input bg-background p-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>

      {isLoading ? (
        <p className="mt-8 text-sm">Loading reviews…</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-border bg-background">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Review</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{r.productSlug}</p>
                    <a
                      href={`/products/${r.productSlug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                      View PDP
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <p>{r.authorName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StarRow value={r.rating} />
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    {r.title ? <p className="font-medium">{r.title}</p> : null}
                    <p className="line-clamp-3 text-muted-foreground">{r.body}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-[11rem] flex-col gap-1.5">
                      {r.status !== "approved" && (
                        <Button size="sm" variant="secondary" onClick={() => setStatus(r.id, "approved")}>
                          Publish
                        </Button>
                      )}
                      {r.status === "approved" && (
                        <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "pending")}>
                          Unpublish
                        </Button>
                      )}
                      {r.status !== "rejected" && (
                        <Button size="sm" variant="outline" onClick={() => setStatus(r.id, "rejected")}>
                          Reject
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => confirmDelete(r)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">No reviews match this filter.</p>
          )}
        </div>
      )}

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit review</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-4 py-2">
              <p className="text-xs text-muted-foreground">
                {editing.productSlug} · {editing.authorName}
              </p>
              <div>
                <p className="text-xs text-muted-foreground">Rating</p>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setEditRating(n)} aria-label={`${n} stars`}>
                      <Star
                        className={cn(
                          "size-6",
                          n <= editRating ? "fill-accent text-accent" : "text-muted-foreground/35",
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <label className="text-xs">
                Title
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="mt-1 w-full border border-input p-2.5 text-sm"
                />
              </label>
              <label className="text-xs">
                Review
                <Textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </label>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit} disabled={patchReview.isPending}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const styles: Record<ReviewStatus, string> = {
    pending: "bg-amber-100 text-amber-900",
    approved: "bg-emerald-100 text-emerald-900",
    rejected: "bg-red-100 text-red-900",
  };
  const labels: Record<ReviewStatus, string> = {
    pending: "Pending",
    approved: "Published",
    rejected: "Rejected",
  };
  return (
    <span className={cn("inline-block rounded px-2 py-0.5 text-[11px] font-medium uppercase", styles[status])}>
      {labels[status]}
    </span>
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
