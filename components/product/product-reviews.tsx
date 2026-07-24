import { BadgeCheck } from "lucide-react";

import { StarRating } from "@/components/product/star-rating";
import type { ProductReview } from "@/lib/supabase/types";

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ProductReviews({
  reviews,
  rating,
  reviewCount,
}: {
  reviews: ProductReview[];
  rating: number;
  reviewCount: number;
}) {
  return (
    <section className="rounded-md border border-saltwater bg-saltwater-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-tangaroa">
            Reviews
          </h2>
          <div className="mt-3">
            <StarRating rating={rating} count={reviewCount} />
          </div>
        </div>
        {reviewCount > 0 ? (
          <p className="text-sm text-slate-grey">
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </p>
        ) : null}
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-6 space-y-5">
          {reviews.map((review) => (
            <li
              key={review.id}
              className="border-t border-saltwater pt-5 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-center gap-3">
                <StarRating rating={review.rating} showCount={false} />
                {review.verified_purchase ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-inkjet">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    Verified buyer
                  </span>
                ) : null}
                <span className="text-xs text-slate-grey">
                  {review.author_name} · {formatReviewDate(review.created_at)}
                </span>
              </div>
              {review.title ? (
                <h3 className="mt-2 font-medium text-tangaroa">{review.title}</h3>
              ) : null}
              <p className="mt-2 text-sm leading-7 text-slate-grey">{review.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-grey">
          No written reviews yet. Be the first to share feedback when checkout goes live.
        </p>
      )}
    </section>
  );
}
