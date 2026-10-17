import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { getAdminToken } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Submission = {
  _id: string;
  type: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  payload?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
};

export const Route = createFileRoute("/admin/submissions")({
  head: () => ({ meta: [{ title: "Form submissions | Twinklingz Admin" }] }),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const token = getAdminToken();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "submissions"],
    queryFn: () => apiFetch<{ submissions: Submission[] }>("/admin/submissions", { token }),
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/submissions/${id}`, { method: "PATCH", body: JSON.stringify({ read: true }), token }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "submissions"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiFetch(`/admin/submissions/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["admin", "submissions"] });
    },
  });

  return (
    <div>
      <h2 className="font-display text-4xl">Form submissions</h2>
      <p className="mt-2 text-muted-foreground">Contact, newsletter, track-order, and other public forms.</p>
      {isLoading && <p className="mt-8 text-sm">Loading…</p>}
      <ul className="mt-8 divide-y divide-border border border-border bg-background">
        {(data?.submissions ?? []).map((s) => (
          <li key={s._id} className={`px-4 py-4 ${!s.read ? "bg-muted/40" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-accent">{s.type}</p>
                <p className="font-medium">{s.name || s.email || "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {[s.email, s.phone].filter(Boolean).join(" · ")}
                </p>
                {s.message && <p className="mt-2 text-sm">{s.message}</p>}
                {s.payload && Object.keys(s.payload).length > 0 && (
                  <pre className="mt-2 max-w-xl overflow-auto rounded bg-muted p-2 text-xs">
                    {JSON.stringify(s.payload, null, 2)}
                  </pre>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                {!s.read && (
                  <Button size="sm" variant="outline" onClick={() => markRead.mutate(s._id)}>
                    Mark read
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => remove.mutate(s._id)}>
                  Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
        {!isLoading && !data?.submissions?.length && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">No submissions yet.</li>
        )}
      </ul>
    </div>
  );
}
