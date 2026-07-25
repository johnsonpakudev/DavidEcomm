import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPagination } from "@/components/product/product-pagination";
import { getProductsPaginated } from "@/lib/products";

function parsePage(value?: string): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() ?? "";
  const page = parsePage(resolvedSearchParams.page);
  const paginatedProducts = query
    ? await getProductsPaginated({ search: query, sort: "featured", page })
    : { items: [], total: 0, page: 1, pageCount: 1 };
  const { items: products, total, pageCount } = paginatedProducts;

  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs items={[{ label: "Search" }]} />
        <section className="rounded-md bg-saltwater-50 p-8">
          <p className="brand-eyebrow-dark">
            Search
          </p>
          <h1 className="mt-3 font-heading text-4xl text-tangaroa md:text-5xl">
            {query ? `Showing results for "${query}"` : "Search the catalog"}
          </h1>
          <p className="mt-4 text-base text-slate-grey">
            {query
              ? `${total.toLocaleString()} result${total === 1 ? "" : "s"} found.`
              : "Use the search bar above to browse the BDK Supply catalog."}
          </p>
        </section>
        <ProductGrid products={products} source="search" />
        {query ? (
          <ProductPagination
            page={page}
            pageCount={pageCount}
            pathname="/search"
            searchParams={resolvedSearchParams}
          />
        ) : null}
      </div>
    </div>
  );
}
