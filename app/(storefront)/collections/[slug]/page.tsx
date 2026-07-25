import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPagination } from "@/components/product/product-pagination";
import { mockCollectionDescriptions } from "@/lib/mock/data";
import { getProductsPaginated } from "@/lib/products";
import { buildPageMetadata } from "@/lib/seo/metadata";

const allowedCollections = new Set(Object.keys(mockCollectionDescriptions));

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parsePage(value?: string): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (!allowedCollections.has(slug)) {
    return {};
  }

  return buildPageMetadata({
    title: `${titleFromSlug(slug)} Collection`,
    description:
      mockCollectionDescriptions[slug] || "Curated BDK Supply collection.",
    path: `/collections/${slug}`,
  });
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parsePage(resolvedSearchParams.page);

  if (!allowedCollections.has(slug)) {
    notFound();
  }

  const paginatedProducts =
    slug === "new"
      ? await getProductsPaginated({ badge: "new", sort: "newest", page })
      : await getProductsPaginated({ collection: slug, sort: "featured", page });

  const { items: products, total, pageCount } = paginatedProducts;

  return (
    <div className="section-space">
      <div className="site-shell space-y-8">
        <Breadcrumbs items={[{ label: "Collections", href: "/" }, { label: titleFromSlug(slug) }]} />
        <section className="rounded-md bg-saltwater-50 p-8">
          <p className="brand-eyebrow-dark">Collection</p>
          <h1 className="mt-3 font-heading text-4xl text-tangaroa md:text-5xl">
            {titleFromSlug(slug)}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-slate-grey">
            {mockCollectionDescriptions[slug]}
          </p>
          <p className="mt-4 text-sm font-medium text-slate-grey">
            {total.toLocaleString()} product{total === 1 ? "" : "s"}
          </p>
        </section>
        <ProductGrid products={products} source={`collection-${slug}`} />
        <ProductPagination
          page={page}
          pageCount={pageCount}
          pathname={`/collections/${slug}`}
          searchParams={resolvedSearchParams}
        />
      </div>
    </div>
  );
}
