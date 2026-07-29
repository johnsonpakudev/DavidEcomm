import type { CategoryShortcut } from "@/lib/homepage/manifest";
import type { HomepageManifest } from "@/lib/homepage/manifest";
import type {
  MappedHomepage,
  ProductCarouselConfig,
  ProductCarouselKey,
  ProductCarouselSelectionMode,
  ProductCarouselSort,
} from "@/lib/homepage/types";
import type {
  HomepageCollection,
  HomepageHero,
  HomepagePromo,
  InspirationImage,
} from "@/lib/supabase/types";

interface PayloadMediaRef {
  url?: string | null;
}

export interface PayloadHomepageGlobal {
  heroes?: Array<{
    id?: string | null;
    layout?: string | null;
    headline?: string | null;
    subheadline?: string | null;
    ctaText?: string | null;
    ctaHref?: string | null;
    badge?: string | null;
    brandName?: string | null;
    compareAtPrice?: number | null;
    price?: number | null;
    image?: PayloadMediaRef | string | number | null;
    externalImageUrl?: string | null;
    active?: boolean | null;
  }> | null;
  collections?: Array<{
    id?: string | null;
    name?: string | null;
    slug?: string | null;
    description?: string | null;
    ctaText?: string | null;
    image?: PayloadMediaRef | string | number | null;
    externalImageUrl?: string | null;
  }> | null;
  promo?: {
    id?: string | null;
    eyebrow?: string | null;
    headline?: string | null;
    subtext?: string | null;
    ctaText?: string | null;
    ctaHref?: string | null;
    image?: PayloadMediaRef | string | number | null;
    externalImageUrl?: string | null;
    active?: boolean | null;
  } | null;
  inspiration?: Array<{
    id?: string | null;
    image?: PayloadMediaRef | string | number | null;
    externalImageUrl?: string | null;
    altText?: string | null;
    active?: boolean | null;
  }> | null;
  categoryShortcuts?: Array<{
    id?: string | null;
    slug?: string | null;
    iconKey?: string | null;
  }> | null;
  productCarousels?: Array<{
    id?: string | null;
    key?: string | null;
    title?: string | null;
    subtitle?: string | null;
    viewAllHref?: string | null;
    ctaLabel?: string | null;
    selectionMode?: string | null;
    collectionSlug?: string | null;
    productSlugs?: Array<{ slug?: string | null; id?: string | null }> | null;
    sort?: string | null;
    limit?: number | null;
    active?: boolean | null;
  }> | null;
}

function resolveImageUrl(
  image: PayloadMediaRef | string | number | null | undefined,
  externalImageUrl?: string | null,
): string | null {
  if (image && typeof image === "object" && image.url) {
    return image.url;
  }

  if (externalImageUrl?.trim()) {
    return externalImageUrl.trim();
  }

  return null;
}

function stableId(prefix: string, index: number, id?: string | null) {
  return id ?? `${prefix}-${index}`;
}

function parseHeroLayout(value: string | null | undefined): HomepageHero["layout"] {
  return value === "promo" ? "promo" : "standard";
}

export function mapHero(
  slide: NonNullable<PayloadHomepageGlobal["heroes"]>[number],
  index: number,
): HomepageHero | null {
  const imageUrl = resolveImageUrl(slide.image, slide.externalImageUrl);

  if (!slide.headline || !imageUrl) {
    return null;
  }

  const layout = parseHeroLayout(slide.layout);

  return {
    id: stableId("hero", index, slide.id),
    layout,
    headline: slide.headline,
    subheadline: slide.subheadline ?? null,
    cta_text: slide.ctaText ?? null,
    cta_href: slide.ctaHref ?? null,
    image_url: imageUrl,
    sort_order: index,
    active: slide.active ?? true,
    badge: layout === "promo" ? slide.badge ?? null : null,
    brand_name: layout === "promo" ? slide.brandName ?? null : null,
    compare_at_price:
      layout === "promo" ? slide.compareAtPrice ?? null : null,
    price: layout === "promo" ? slide.price ?? null : null,
  };
}

export function mapCollection(
  card: NonNullable<PayloadHomepageGlobal["collections"]>[number],
  index: number,
): HomepageCollection | null {
  const imageUrl = resolveImageUrl(card.image, card.externalImageUrl);

  if (!card.name || !card.slug || !imageUrl) {
    return null;
  }

  return {
    id: stableId("collection", index, card.id),
    name: card.name,
    slug: card.slug,
    description: card.description ?? null,
    image_url: imageUrl,
    cta_text: card.ctaText ?? "Shop collection",
    sort_order: index,
  };
}

export function mapPromo(
  promo: NonNullable<PayloadHomepageGlobal["promo"]>,
): HomepagePromo | null {
  if (!promo.headline || promo.active === false) {
    return null;
  }

  const imageUrl = resolveImageUrl(promo.image, promo.externalImageUrl);

  return {
    id: promo.id ?? "promo",
    eyebrow: promo.eyebrow ?? null,
    headline: promo.headline,
    subtext: promo.subtext ?? null,
    cta_text: promo.ctaText ?? null,
    cta_href: promo.ctaHref ?? null,
    image_url: imageUrl,
    active: promo.active ?? true,
  };
}

export function mapInspiration(
  image: NonNullable<PayloadHomepageGlobal["inspiration"]>[number],
  index: number,
): InspirationImage | null {
  const imageUrl = resolveImageUrl(image.image, image.externalImageUrl);

  if (!imageUrl || !image.altText || image.active === false) {
    return null;
  }

  return {
    id: stableId("inspiration", index, image.id),
    image_url: imageUrl,
    alt_text: image.altText,
    sort_order: index,
    active: image.active ?? true,
  };
}

function parseCarouselKey(value: string | null | undefined): ProductCarouselKey {
  if (value === "best-sellers" || value === "new-arrivals") {
    return value;
  }

  return "featured";
}

function parseSelectionMode(
  value: string | null | undefined,
): ProductCarouselSelectionMode {
  if (value === "manual" || value === "rule") {
    return value;
  }

  return "collection";
}

function parseSort(value: string | null | undefined): ProductCarouselSort {
  if (
    value === "newest" ||
    value === "price-asc" ||
    value === "price-desc"
  ) {
    return value;
  }

  return "featured";
}

export function mapCarousel(
  carousel: NonNullable<PayloadHomepageGlobal["productCarousels"]>[number],
  index: number,
): ProductCarouselConfig | null {
  if (!carousel.title || carousel.active === false) {
    return null;
  }

  return {
    id: stableId("carousel", index, carousel.id),
    key: parseCarouselKey(carousel.key),
    title: carousel.title,
    subtitle: carousel.subtitle ?? null,
    viewAllHref: carousel.viewAllHref ?? null,
    ctaLabel: carousel.ctaLabel ?? "View collection",
    selectionMode: parseSelectionMode(carousel.selectionMode),
    collectionSlug: carousel.collectionSlug ?? null,
    productSlugs:
      carousel.productSlugs
        ?.map((entry) => entry.slug?.trim())
        .filter((slug): slug is string => Boolean(slug)) ?? [],
    sort: parseSort(carousel.sort),
    limit: carousel.limit ?? 4,
    active: carousel.active ?? true,
  };
}

export function mapHomepageGlobal(
  global: PayloadHomepageGlobal | null | undefined,
): MappedHomepage | null {
  if (!global) {
    return null;
  }

  const heroes =
    global.heroes
      ?.map((slide, index) => mapHero(slide, index))
      .filter((slide): slide is HomepageHero => slide !== null) ?? [];

  const collections =
    global.collections
      ?.map((card, index) => mapCollection(card, index))
      .filter((card): card is HomepageCollection => card !== null) ?? [];

  const promos = [mapPromo(global.promo ?? {})].filter(
    (promo): promo is HomepagePromo => promo !== null,
  );

  const inspiration =
    global.inspiration
      ?.map((image, index) => mapInspiration(image, index))
      .filter((image): image is InspirationImage => image !== null) ?? [];

  const categoryShortcuts =
    global.categoryShortcuts
      ?.map((shortcut) => {
        if (!shortcut.slug || !shortcut.iconKey) {
          return null;
        }

        return {
          slug: shortcut.slug,
          iconKey: shortcut.iconKey as CategoryShortcut["iconKey"],
        };
      })
      .filter(
        (shortcut): shortcut is CategoryShortcut => shortcut !== null,
      ) ?? [];

  const productCarousels =
    global.productCarousels
      ?.map((carousel, index) => mapCarousel(carousel, index))
      .filter(
        (carousel): carousel is ProductCarouselConfig => carousel !== null,
      ) ?? [];

  if (
    heroes.length === 0 &&
    collections.length === 0 &&
    promos.length === 0 &&
    inspiration.length === 0 &&
    categoryShortcuts.length === 0 &&
    productCarousels.length === 0
  ) {
    return null;
  }

  return {
    heroes,
    collections,
    promos,
    inspiration,
    categoryShortcuts,
    productCarousels,
  };
}

export function mapHomepageManifest(manifest: HomepageManifest): MappedHomepage {
  return {
    heroes: manifest.heroes,
    collections: manifest.collections,
    promos: manifest.promos,
    inspiration: manifest.inspiration,
    categoryShortcuts: manifest.categoryShortcuts,
    productCarousels: [],
  };
}
