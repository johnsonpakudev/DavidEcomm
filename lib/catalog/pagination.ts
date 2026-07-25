export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

export function paginate<T>(items: T[], page = 1, limit = 24): PaginatedResult<T> {
  const safeLimit = Math.min(Math.max(limit, 1), 48);
  const safePage = Math.max(page, 1);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;

  return {
    items: items.slice(start, start + safeLimit),
    total,
    page: safePage,
    pageCount,
  };
}
