import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerAuth } from "@/components/customer-auth-provider";
import { apiFetch, type ProductReview } from "@/lib/api";
import { cn } from "@/lib/utils";

type MineReview = {
  id: string;
  rating: number;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

export function ProductReviewsSection({ productSlug }: { productSlug: string }) {
  const { customer, token, loading: authLoading } = useCustomerAuth();
  const qc = useQueryClient();

  const { data: publicReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["product-reviews", productSlug],
    queryFn: () =>
      apiFetch<{ reviews: ProductReview[] }>(`/products/${encodeURIComponent(productSlug)}/reviews`),
  });

  const { data: mineData } = useQuery({
    queryKey: ["product-review-mine", productSlug, token],
    enabled: Boolean(token),
    queryFn: () =>
      apiFetch<{ review: MineReview | null; canSubmit: boolean }>(
        `/customer/reviews/for-product/${encodeURIComponent(productSlug)}`,
        { token },
      ),
  });

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const submitReview = useMutation({
    mutationFn: () =>
      apiFetch<{ message: string }>("/reviews", {
        method: "POST",
        token,
        body: JSON.stringify({ productSlug, rating, title, body }),
      }),
    onSuccess: (res) => {
      toast.success(res.message);
      setBody("");
      setTitle("");
      qc.invalidateQueries({ queryKey: ["product-review-mine", productSlug] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not submit review"),
  });

  const reviews = publicReviews?.reviews ?? [];
  const mine = mineData?.review;
  const showReviewForm =
    Boolean(token) &&
    mine?.status !== "pending" &&
    mine?.status !== "approved" &&
    (mineData?.canSubmit ?? !mine);

  return (
    <section className="mt-12 border-t border-border pt-10" aria-labelledby="product-reviews-heading">
      <h2 id="product-reviews-heading" className="font-display text-2xl sm:text-3xl">
        Customer reviews
      </h2>

      {reviewsLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No published reviews yet. Be the first to share your thoughts.</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-lg border border-border bg-background p-4">
              <div className="flex flex-wrap items-center gap-2">
                <StarRow value={r.rating} />
                {r.title ? <span className="text-sm font-medium">{r.title}</span> : null}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {r.authorName} · {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 rounded-lg border border-border bg-secondary/30 p-5">
        <h3 className="text-sm font-semibold tracking-wide">Write a review</h3>
        {authLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Checking sign-in…</p>
        ) : !customer || !token ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Only signed-in customers can leave a review.{" "}
            <Link to="/account" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in or create an account
            </Link>
            .
          </p>
        ) : mine?.status === "pending" ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Your review is awaiting approval. We will publish it on this page once our team verifies it.
          </p>
        ) : mine?.status === "approved" ? (
          <p className="mt-3 text-sm text-muted-foreground">Thank you — your review is live on this product.</p>
        ) : showReviewForm ? (
          <form
            className="mt-4 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitReview.mutate();
            }}
          >
            {mine?.status === "rejected" && (
              <p className="text-sm text-destructive">
                Your previous review was not approved. You may submit an updated review below.
              </p>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Rating</p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="rounded p-0.5 transition hover:scale-105"
                    onClick={() => setRating(n)}
                    aria-label={`Rate ${n} stars`}
                  >
                    <Star
                      className={cn(
                        "size-6",
                        n <= rating ? "fill-accent text-accent" : "text-muted-foreground/40",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-xs">
              Title <span className="text-muted-foreground">(optional)</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                className="mt-1 w-full border border-input bg-background p-3 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block text-xs">
              Your review
              <Textarea
                required
                minLength={10}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Share how the piece looks, fits, and feels…"
                className="mt-1 min-h-[100px] resize-y"
              />
            </label>
            <Button type="submit" disabled={submitReview.isPending || body.trim().length < 10}>
              {submitReview.isPending ? "Submitting…" : "Submit for verification"}
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  );
}

function StarRow({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("size-3.5", n <= value ? "fill-accent text-accent" : "text-muted-foreground/30")}
          aria-hidden
        />
      ))}
    </span>
  );
}
