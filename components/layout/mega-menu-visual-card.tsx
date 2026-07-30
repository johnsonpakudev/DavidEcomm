import Image from "next/image";
import Link from "next/link";

import type { Category } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

function CategoryInitials({ name }: { name: string }) {
  return (
    <span className="px-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-slate-grey">
      {name
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word.charAt(0))
        .join("")}
    </span>
  );
}

export function MegaMenuVisualCard({
  category,
  featured = false,
}: {
  category: Category;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      prefetch
      className={cn(
        "group block overflow-hidden rounded-md border border-saltwater bg-white transition-shadow hover:shadow-md",
        featured ? "col-span-2 sm:col-span-2 xl:col-span-2" : "",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-saltwater-50",
          featured ? "aspect-[16/9] sm:aspect-[2/1]" : "aspect-[4/5]",
        )}
      >
        {category.mega_menu_image ? (
          <Image
            src={category.mega_menu_image}
            alt={category.name}
            fill
            sizes={featured ? "(min-width: 1280px) 480px, 50vw" : "(min-width: 1280px) 200px, 25vw"}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <CategoryInitials name={category.name} />
          </div>
        )}
      </div>
      <div className={cn("px-3 py-3", featured && "px-4 py-4")}>
        <p
          className={cn(
            "line-clamp-2 font-medium text-tangaroa",
            featured ? "text-base sm:text-lg" : "text-sm",
          )}
        >
          {category.name}
        </p>
        {featured ? (
          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-warm-stone-600">
            Shop collection
          </p>
        ) : null}
      </div>
    </Link>
  );
}
