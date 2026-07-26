import type {
  HomepageCollection,
  HomepageHero,
  HomepagePromo,
  InspirationImage,
  NavPillarKey,
} from "@/lib/supabase/types";

import type { ImportReport, NormalizedCategory, NormalizedProduct } from "@/scripts/catalog/types";
import { deterministicId } from "@/scripts/catalog/utils";

export interface CategoryShortcut {
  slug: string;
  iconKey: string;
}

export interface HomepageManifest {
  heroes: HomepageHero[];
  promos: HomepagePromo[];
  collections: HomepageCollection[];
  inspiration: InspirationImage[];
  categoryShortcuts: CategoryShortcut[];
}

const CATEGORY_SHORTCUTS: CategoryShortcut[] = [
  { slug: "bathroom-vanities", iconKey: "vanities" },
  { slug: "bathroom-toilets", iconKey: "toilets" },
  { slug: "bathroom-basins", iconKey: "basins" },
  { slug: "bathroom-tapware", iconKey: "tapware" },
  { slug: "bathroom-showers", iconKey: "showers" },
  { slug: "bathroom-mirrors-cabinets", iconKey: "mirrors-cabinets" },
  { slug: "bathroom-accessories", iconKey: "accessories" },
  { slug: "doors-hardware-hardware-handles-locks", iconKey: "door-handles" },
  { slug: "kitchen-laundry-kitchen-laundry-sinks", iconKey: "kitchen-sinks" },
  { slug: "kitchen-laundry-laundry-tubs", iconKey: "laundry-tubs" },
  { slug: "doors-hardware-hardware-pull-handles", iconKey: "cabinet-handles" },
];

const COLLECTION_CARD_CONFIG: Array<{
  slug: string;
  name: string;
  description: string;
  ctaText: string;
}> = [
  {
    slug: "featured",
    name: "Featured",
    description: "Highlighted favourites from across the BDK Supply catalog.",
    ctaText: "Shop featured",
  },
  {
    slug: "clearance",
    name: "Clearance",
    description: "Reduced lines across bathroom, doors and laundry while stocks last.",
    ctaText: "Shop clearance",
  },
  {
    slug: "bundle-deals",
    name: "Bundle Deals",
    description: "Package deals with the essentials bundled for faster renovation projects.",
    ctaText: "Shop bundles",
  },
];

function getPrimaryImage(product: NormalizedProduct): string | null {
  return product.images[0]?.url ?? null;
}

function hasShopifyImage(product: NormalizedProduct): boolean {
  return product.images.some((image) => image.url.includes("cdn.shopify.com"));
}

function productScore(product: NormalizedProduct): number {
  let score = 0;

  if (getPrimaryImage(product)) {
    score += 10;
  }

  if (hasShopifyImage(product)) {
    score += 5;
  }

  if (product.collection_slugs.includes("best-sellers")) {
    score += 8;
  }

  if (product.collection_slugs.includes("featured")) {
    score += 4;
  }

  return score;
}

function sortProductsForSelection(products: NormalizedProduct[]): NormalizedProduct[] {
  return [...products].sort((left, right) => {
    const scoreDiff = productScore(right) - productScore(left);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return left.name.localeCompare(right.name);
  });
}

function productsInCollection(
  products: NormalizedProduct[],
  collectionSlug: string,
): NormalizedProduct[] {
  return sortProductsForSelection(
    products.filter(
      (product) =>
        product.collection_slugs.includes(collectionSlug) && getPrimaryImage(product),
    ),
  );
}

function pickCollectionImage(
  products: NormalizedProduct[],
  collectionSlug: string,
): string | null {
  const candidate = productsInCollection(products, collectionSlug)[0];
  return candidate ? getPrimaryImage(candidate) : null;
}

function categorySlugSet(categories: NormalizedCategory[]): Set<string> {
  return new Set(categories.map((category) => category.slug));
}

function resolveCategoryShortcuts(
  categories: NormalizedCategory[],
  report: ImportReport,
): CategoryShortcut[] {
  const availableSlugs = categorySlugSet(categories);

  return CATEGORY_SHORTCUTS.filter((shortcut) => {
    if (availableSlugs.has(shortcut.slug)) {
      return true;
    }

    report.warnings.push(`Homepage category shortcut missing: ${shortcut.slug}`);
    return false;
  });
}

function buildHeroes(products: NormalizedProduct[]): HomepageHero[] {
  const candidates = sortProductsForSelection(
    products.filter(
      (product) =>
        getPrimaryImage(product) &&
        (product.collection_slugs.includes("best-sellers") ||
          product.collection_slugs.includes("featured")),
    ),
  ).slice(0, 3);

  if (candidates.length === 0) {
    return [];
  }

  const heroCopy = [
    {
      headline: "Direct from the manufacturer, to you.",
      subheadline:
        "Building and renovation supplies for bathrooms, doors, hardware and kitchen projects.",
      ctaText: "Shop best sellers",
      ctaHref: "/collections/best-sellers",
    },
    {
      headline: "Quality fixtures for every renovation budget.",
      subheadline: "Explore tapware, vanities, doors and laundry essentials from trusted brands.",
      ctaText: "Shop bathroom",
      ctaHref: "/categories/bathroom",
    },
    {
      headline: "Bundle deals and clearance savings.",
      subheadline: "Package offers and reduced lines across the BDK Supply catalog.",
      ctaText: "Shop bundle deals",
      ctaHref: "/collections/bundle-deals",
    },
  ];

  return candidates.map((product, index) => {
    const copy = heroCopy[index] ?? heroCopy[0]!;

    return {
      id: deterministicId("hero", product.slug),
      headline: index === 0 ? copy.headline : product.name,
      subheadline: index === 0 ? copy.subheadline : copy.subheadline,
      cta_text: copy.ctaText,
      cta_href: copy.ctaHref,
      image_url: getPrimaryImage(product)!,
      sort_order: index,
      active: true,
    };
  });
}

function buildCollections(
  products: NormalizedProduct[],
  report: ImportReport,
): HomepageCollection[] {
  return COLLECTION_CARD_CONFIG.flatMap((config, index) => {
    const imageUrl = pickCollectionImage(products, config.slug);

    if (!imageUrl) {
      report.warnings.push(`No image found for homepage collection: ${config.slug}`);
      return [];
    }

    return [
      {
        id: deterministicId("collection", config.slug),
        name: config.name,
        slug: config.slug,
        description: config.description,
        image_url: imageUrl,
        cta_text: config.ctaText,
        sort_order: index,
      },
    ];
  });
}

function buildPromo(products: NormalizedProduct[]): HomepagePromo[] {
  const imageUrl = pickCollectionImage(products, "clearance");

  if (!imageUrl) {
    return [];
  }

  return [
    {
      id: "promo-clearance",
      eyebrow: "Limited time savings",
      headline: "Clearance favourites",
      subtext: "Save on bathroom, door and laundry essentials while stocks last.",
      cta_text: "Shop clearance",
      cta_href: "/collections/clearance",
      image_url: imageUrl,
      active: true,
    },
  ];
}

function categoryPillar(
  categoryId: string | null,
  categoriesById: Map<string, NormalizedCategory>,
): NavPillarKey | null {
  if (!categoryId) {
    return null;
  }

  let current = categoriesById.get(categoryId);

  while (current) {
    if (current.nav_pillar) {
      return current.nav_pillar;
    }

    current = current.parent_id
      ? categoriesById.get(current.parent_id)
      : undefined;
  }

  return null;
}

function pickInspirationForPillar(
  products: NormalizedProduct[],
  categories: NormalizedCategory[],
  pillar: NavPillarKey,
  usedProductIds: Set<string>,
): NormalizedProduct | null {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));

  return (
    sortProductsForSelection(
      products.filter((product) => {
        if (!getPrimaryImage(product) || usedProductIds.has(product.id)) {
          return false;
        }

        return categoryPillar(product.category_id, categoriesById) === pillar;
      }),
    )[0] ?? null
  );
}

function buildInspiration(
  products: NormalizedProduct[],
  categories: NormalizedCategory[],
  report: ImportReport,
): InspirationImage[] {
  const pillars: NavPillarKey[] = [
    "bathroom",
    "doors-hardware",
    "kitchen-laundry",
  ];
  const usedProductIds = new Set<string>();
  const inspiration: InspirationImage[] = [];

  for (const pillar of pillars) {
    const product = pickInspirationForPillar(
      products,
      categories,
      pillar,
      usedProductIds,
    );

    if (!product) {
      report.warnings.push(`No inspiration image found for pillar: ${pillar}`);
      continue;
    }

    usedProductIds.add(product.id);
    inspiration.push({
      id: deterministicId("inspiration", product.slug),
      image_url: getPrimaryImage(product)!,
      alt_text: product.name,
      sort_order: inspiration.length,
      active: true,
    });
  }

  const featuredProduct =
    productsInCollection(products, "featured").find(
      (product) => !usedProductIds.has(product.id),
    ) ??
    productsInCollection(products, "bundle-deals").find(
      (product) => !usedProductIds.has(product.id),
    );

  if (featuredProduct && getPrimaryImage(featuredProduct)) {
    inspiration.push({
      id: deterministicId("inspiration", featuredProduct.slug),
      image_url: getPrimaryImage(featuredProduct)!,
      alt_text: featuredProduct.name,
      sort_order: inspiration.length,
      active: true,
    });
  } else {
    report.warnings.push("No fourth inspiration tile product found");
  }

  return inspiration;
}

export function buildHomepageManifest(input: {
  products: NormalizedProduct[];
  categories: NormalizedCategory[];
  report: ImportReport;
}): HomepageManifest {
  const { products, categories, report } = input;

  return {
    heroes: buildHeroes(products),
    promos: buildPromo(products),
    collections: buildCollections(products, report),
    inspiration: buildInspiration(products, categories, report),
    categoryShortcuts: resolveCategoryShortcuts(categories, report),
  };
}
