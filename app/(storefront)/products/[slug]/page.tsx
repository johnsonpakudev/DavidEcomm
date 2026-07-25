import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { ProductCarousel } from "@/components/product/product-carousel";
import { ProductDetailExperience } from "@/components/product/product-detail-experience";
import { getCategoryAncestors } from "@/lib/categories";
import { getCachedProductDetailBySlug } from "@/lib/product-detail";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { buildProductMetadata, getSiteUrl } from "@/lib/seo/metadata";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProductDetailBySlug(slug);

  if (!product) {
    return {};
  }

  return buildProductMetadata(product);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCachedProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  const ancestors = product.categories
    ? await getCategoryAncestors(product.categories)
    : [];

  const breadcrumbItems = [
    ...ancestors.map((ancestor) => ({
      label: ancestor.name,
      href: `${getSiteUrl()}/categories/${ancestor.slug}`,
    })),
    product.categories
      ? {
          label: product.categories.name,
          href: `${getSiteUrl()}/categories/${product.categories.slug}`,
        }
      : null,
    {
      label: product.name,
      href: `${getSiteUrl()}/products/${product.slug}`,
    },
  ].filter((item): item is { label: string; href: string } => Boolean(item));

  const relatedProducts =
    product.relatedProducts.length > 0 ? product.relatedProducts : [];

  return (
    <div className="section-space">
      <div className="site-shell space-y-10">
        <Breadcrumbs
          items={[
            ...ancestors.map((ancestor) => ({
              label: ancestor.name,
              href: `/categories/${ancestor.slug}`,
            })),
            product.categories
              ? {
                  label: product.categories.name,
                  href: `/categories/${product.categories.slug}`,
                }
              : undefined,
            { label: product.name },
          ].filter((item): item is { label: string; href?: string } => Boolean(item))}
        />

        <ProductDetailExperience product={product} />

        {product.crossSellProducts.length > 0 ? (
          <ProductCarousel
            products={product.crossSellProducts}
            title="Often bought with"
            subtitle="Complete the look with these popular pairings."
            source={`cross-sell-${product.slug}`}
          />
        ) : null}

        {relatedProducts.length > 0 ? (
          <ProductCarousel
            products={relatedProducts}
            title="You may also like"
            subtitle="More fixtures and finishes from the same category."
            source={`related-${product.slug}`}
          />
        ) : null}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            productJsonLd(product, getSiteUrl()),
            breadcrumbJsonLd(
              breadcrumbItems.map((item) => ({
                name: item.label,
                url: item.href,
              })),
            ),
          ]),
        }}
      />
    </div>
  );
}
