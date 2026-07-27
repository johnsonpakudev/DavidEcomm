import { getProductBySlug, getProducts, type ProductFilters } from "@/lib/products";
import type { Product } from "@/lib/supabase/types";

import { DEFAULT_PRODUCT_CAROUSELS } from "@/lib/homepage/defaults";
import type { ProductCarouselConfig } from "@/lib/homepage/types";

async function resolveWithFeaturedFallback(
  products: Product[],
  fallbackCollection: string,
): Promise<Product[]> {
  if (products.length > 0) {
    return products;
  }

  const featured = await getProducts({
    collection: fallbackCollection,
    limit: 4,
    sort: "featured",
  });

  if (featured.length > 0) {
    return featured;
  }

  return getProducts({ limit: 4, sort: "featured" });
}

export async function resolveCarouselProducts(
  carousel: ProductCarouselConfig,
): Promise<Product[]> {
  const limit = carousel.limit ?? 4;
  const sort = carousel.sort ?? "featured";

  if (carousel.selectionMode === "manual") {
    const slugs = carousel.productSlugs;

    if (slugs.length === 0) {
      return [];
    }

    const products = await Promise.all(
      slugs.map((slug) => getProductBySlug(slug)),
    );

    return products.filter((product): product is Product => product !== null);
  }

  const filters: ProductFilters = {
    limit,
    sort,
  };

  if (carousel.selectionMode === "collection" && carousel.collectionSlug) {
    filters.collection = carousel.collectionSlug;
  }

  const products = await getProducts(filters);

  if (carousel.key === "featured") {
    return resolveWithFeaturedFallback(products, "featured");
  }

  if (carousel.key === "best-sellers") {
    return resolveWithFeaturedFallback(products, "featured");
  }

  return products;
}

export function getActiveCarousels(
  carousels: ProductCarouselConfig[],
): ProductCarouselConfig[] {
  const active = carousels.filter((carousel) => carousel.active);

  if (active.length > 0) {
    return active;
  }

  return DEFAULT_PRODUCT_CAROUSELS;
}
