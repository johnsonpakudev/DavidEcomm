import type { CategoryShortcut } from "@/lib/homepage/manifest";
import type {
  HomepageCollection,
  HomepageHero,
  HomepagePromo,
  InspirationImage,
} from "@/lib/supabase/types";

export type { CategoryShortcut };

export type ProductCarouselKey = "featured" | "best-sellers" | "new-arrivals";

export type ProductCarouselSelectionMode = "collection" | "manual" | "rule";

export type ProductCarouselSort =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc";

export interface ProductCarouselConfig {
  id: string;
  key: ProductCarouselKey;
  title: string;
  subtitle: string | null;
  viewAllHref: string | null;
  ctaLabel: string;
  selectionMode: ProductCarouselSelectionMode;
  collectionSlug: string | null;
  productSlugs: string[];
  sort: ProductCarouselSort;
  limit: number;
  active: boolean;
}

export interface MappedHomepage {
  heroes: HomepageHero[];
  collections: HomepageCollection[];
  promos: HomepagePromo[];
  inspiration: InspirationImage[];
  categoryShortcuts: CategoryShortcut[];
  productCarousels: ProductCarouselConfig[];
}
