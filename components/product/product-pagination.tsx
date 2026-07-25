import Link from "next/link";

import { cn } from "@/lib/utils";

interface ProductPaginationProps {
  page: number;
  pageCount: number;
  pathname: string;
  searchParams?: Record<string, string | string[] | undefined>;
}

function buildPageHref(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined> | undefined,
  targetPage: number,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (key === "page" || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      continue;
    }

    params.set(key, value);
  }

  if (targetPage > 1) {
    params.set("page", String(targetPage));
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function getVisiblePages(page: number, pageCount: number): number[] {
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  return [...pages]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((left, right) => left - right);
}

export function ProductPagination({
  page,
  pageCount,
  pathname,
  searchParams,
}: ProductPaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(page, pageCount);

  return (
    <nav
      aria-label="Product pagination"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={buildPageHref(pathname, searchParams, page - 1)}
          className="rounded-full border border-saltwater px-4 py-2 text-sm font-medium text-tangaroa hover:border-inkjet hover:text-inkjet"
        >
          Previous
        </Link>
      ) : null}

      {visiblePages.map((pageNumber, index) => {
        const previousPage = visiblePages[index - 1];
        const showEllipsis = previousPage !== undefined && pageNumber - previousPage > 1;

        return (
          <span key={pageNumber} className="flex items-center gap-2">
            {showEllipsis ? (
              <span aria-hidden="true" className="px-1 text-sm text-slate-grey">
                …
              </span>
            ) : null}
            <Link
              href={buildPageHref(pathname, searchParams, pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
              className={cn(
                "inline-flex min-w-10 items-center justify-center rounded-full border px-3 py-2 text-sm font-medium",
                pageNumber === page
                  ? "border-inkjet bg-inkjet text-white"
                  : "border-saltwater text-tangaroa hover:border-inkjet hover:text-inkjet",
              )}
            >
              {pageNumber}
            </Link>
          </span>
        );
      })}

      {page < pageCount ? (
        <Link
          href={buildPageHref(pathname, searchParams, page + 1)}
          className="rounded-full border border-saltwater px-4 py-2 text-sm font-medium text-tangaroa hover:border-inkjet hover:text-inkjet"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
