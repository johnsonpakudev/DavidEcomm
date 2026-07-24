import { Star } from "lucide-react";

export function StarRating({
  rating,
  count,
  showCount = true,
}: {
  rating: number;
  count?: number;
  showCount?: boolean;
}) {
  const filledStars = Math.round(rating);

  return (
    <div className="flex items-center gap-2 text-xs text-slate-grey">
      <div className="flex items-center gap-0.5 text-warm-stone" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className="size-3.5"
            fill={index < filledStars ? "currentColor" : "none"}
          />
        ))}
      </div>
      {showCount && typeof count === "number" ? <span>({count})</span> : null}
    </div>
  );
}
