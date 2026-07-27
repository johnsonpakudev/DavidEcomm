import { brand } from "@/lib/brand";
import type { ProductCarouselConfig } from "@/lib/homepage/types";

export const DEFAULT_PRODUCT_CAROUSELS: ProductCarouselConfig[] = [
  {
    id: "default-featured",
    key: "featured",
    title: "Featured products",
    subtitle: `Quality building and renovation supplies curated for the ${brand.name} point of view.`,
    viewAllHref: "/categories/bathroom",
    ctaLabel: "View collection",
    selectionMode: "collection",
    collectionSlug: "featured",
    productSlugs: [],
    sort: "featured",
    limit: 4,
    active: true,
  },
  {
    id: "default-best-sellers",
    key: "best-sellers",
    title: "Best sellers",
    subtitle:
      "The most-loved products in our bathroom, hardware and utility collections.",
    viewAllHref: "/collections/best-sellers",
    ctaLabel: "View all",
    selectionMode: "collection",
    collectionSlug: "best-sellers",
    productSlugs: [],
    sort: "featured",
    limit: 4,
    active: true,
  },
  {
    id: "default-new-arrivals",
    key: "new-arrivals",
    title: "New arrivals",
    subtitle: "Fresh additions across the three flagship navigation pillars.",
    viewAllHref: "/categories/bathroom",
    ctaLabel: "View arrivals",
    selectionMode: "rule",
    collectionSlug: null,
    productSlugs: [],
    sort: "newest",
    limit: 4,
    active: true,
  },
];
