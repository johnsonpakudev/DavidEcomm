import type { NavPillarKey } from "@/lib/supabase/types";

import { mapRowImages } from "@/scripts/catalog/map-row";
import type { CsvProductRow, NormalizedCategory } from "@/scripts/catalog/types";
import { dedupeSlug, deterministicId, slugify } from "@/scripts/catalog/utils";

export const PILLAR_TAGS: Record<string, NavPillarKey> = {
  Bathroom: "bathroom",
  "Doors & Hardware": "doors-hardware",
  "Kitchen & Laundry": "kitchen-laundry",
};

export const COLLECTION_TAGS: Record<string, string> = {
  Clearance: "clearance",
  Featured: "featured",
  "Bundle Deals": "bundle-deals",
  "Best Sellers": "best-sellers",
};

/** Depth-2 category slugs allowed in the mega-menu per nav pillar. */
export const MEGA_MENU_CHILD_SLUGS: Record<NavPillarKey, string[]> = {
  bathroom: [
    "bathroom-vanities",
    "bathroom-toilets",
    "bathroom-tapware",
    "bathroom-basins",
    "bathroom-showers",
    "bathroom-mirrors-cabinets",
    "bathroom-accessories",
    "bathroom-baths",
  ],
  "doors-hardware": [
    "doors-hardware-entrance-doors",
    "doors-hardware-hardware-handles-locks",
    "doors-hardware-hardware-pull-handles",
    "doors-hardware-door-jambs",
    "doors-hardware-smart-locks",
  ],
  "kitchen-laundry": [
    "kitchen-laundry-kitchen-laundry-sinks",
    "kitchen-laundry-laundry-tubs",
    "kitchen-laundry-sink-mixers",
    "kitchen-laundry-kitchen-accessories",
  ],
};

function isValidCategoryTag(tag: string): boolean {
  if (isCollectionTag(tag)) {
    return false;
  }

  // Shopify export artefacts use ";" instead of " > " (e.g. "Bathroom;Bathroom").
  if (tag.includes(";")) {
    return false;
  }

  return true;
}

function shouldShowInMegaMenu(
  depth: number,
  navPillar: NavPillarKey | null,
  slug: string,
): boolean {
  if (depth === 1) {
    return navPillar !== null;
  }

  if (depth === 2 && navPillar) {
    return MEGA_MENU_CHILD_SLUGS[navPillar].includes(slug);
  }

  return false;
}

function splitTags(tags: string): string[] {
  if (!tags.trim()) {
    return [];
  }

  return tags.split(", ").map((tag) => tag.trim()).filter(Boolean);
}

function isCollectionTag(tag: string): boolean {
  return tag in COLLECTION_TAGS;
}

function categoryPathsFromTag(tag: string): string[] {
  if (!isValidCategoryTag(tag)) {
    return [];
  }

  const segments = tag.split(" > ").map((segment) => segment.trim()).filter(Boolean);

  if (segments.length === 0) {
    return [];
  }

  const paths: string[] = [];

  for (let index = 0; index < segments.length; index += 1) {
    paths.push(segments.slice(0, index + 1).join(" > "));
  }

  return paths;
}

function pathDepth(path: string): number {
  return path.split(" > ").length;
}

function pathName(path: string): string {
  const segments = path.split(" > ");
  return segments[segments.length - 1] ?? path;
}

function parentPath(path: string): string | null {
  const segments = path.split(" > ");

  if (segments.length <= 1) {
    return null;
  }

  return segments.slice(0, -1).join(" > ");
}

function navPillarForPath(path: string): NavPillarKey | null {
  const root = path.split(" > ")[0];

  if (!root) {
    return null;
  }

  return PILLAR_TAGS[root] ?? null;
}

export function extractCollectionSlugs(tags: string): string[] {
  return splitTags(tags)
    .filter(isCollectionTag)
    .map((tag) => COLLECTION_TAGS[tag]!)
    .sort();
}

export function pickPrimaryCategoryId(
  tags: string,
  categoryIdByPath: Map<string, string>,
): string | null {
  const categoryPaths = splitTags(tags)
    .filter((tag) => !isCollectionTag(tag))
    .flatMap((tag) => {
      const paths = categoryPathsFromTag(tag);
      return paths.length > 0 ? [paths[paths.length - 1]!] : [];
    })
    .filter((path) => categoryIdByPath.has(path));

  if (categoryPaths.length === 0) {
    return null;
  }

  categoryPaths.sort((left, right) => {
    const depthDiff = pathDepth(right) - pathDepth(left);

    if (depthDiff !== 0) {
      return depthDiff;
    }

    return right.length - left.length;
  });

  const primaryPath = categoryPaths[0]!;
  return categoryIdByPath.get(primaryPath) ?? null;
}

export function buildCategoryTree(rows: CsvProductRow[]): {
  categories: NormalizedCategory[];
  collectionTagsBySku: Map<string, string[]>;
  categoryIdByPath: Map<string, string>;
} {
  const pathOrder = new Map<string, number>();
  const collectionTagsBySku = new Map<string, string[]>();
  let pathSequence = 0;

  for (const row of rows) {
    const collectionSlugs = extractCollectionSlugs(row.Tags);

    if (collectionSlugs.length > 0) {
      collectionTagsBySku.set(row.SKU, collectionSlugs);
    }

    for (const tag of splitTags(row.Tags)) {
      if (!isValidCategoryTag(tag)) {
        continue;
      }

      for (const path of categoryPathsFromTag(tag)) {
        if (!pathOrder.has(path)) {
          pathOrder.set(path, pathSequence);
          pathSequence += 1;
        }
      }
    }
  }

  const sortedPaths = [...pathOrder.keys()].sort((left, right) => {
    const depthDiff = pathDepth(left) - pathDepth(right);

    if (depthDiff !== 0) {
      return depthDiff;
    }

    return (pathOrder.get(left) ?? 0) - (pathOrder.get(right) ?? 0);
  });

  const categoryIdByPath = new Map<string, string>();
  const categories: NormalizedCategory[] = [];
  const siblingOrderByParent = new Map<string, number>();

  const usedSlugs = new Set<string>();

  for (const path of sortedPaths) {
    const id = deterministicId("category", path);
    categoryIdByPath.set(path, id);

    const parent = parentPath(path);
    const siblingKey = parent ?? "__root__";
    const megaMenuOrder = siblingOrderByParent.get(siblingKey) ?? 0;
    siblingOrderByParent.set(siblingKey, megaMenuOrder + 1);

    const depth = pathDepth(path);
    const navPillar = navPillarForPath(path);
    const slug = dedupeSlug(slugify(path), usedSlugs);

    categories.push({
      id,
      name: pathName(path),
      slug,
      parent_id: parent ? categoryIdByPath.get(parent) ?? null : null,
      nav_pillar: navPillar,
      icon_key: null,
      mega_menu_image: null,
      mega_menu_order: megaMenuOrder,
      show_in_mega_menu: shouldShowInMegaMenu(depth, navPillar, slug),
      meta_title: null,
      meta_description: null,
    });
  }

  applyMegaMenuVisualChildren(categories);

  return {
    categories,
    collectionTagsBySku,
    categoryIdByPath,
  };
}

/** Surface depth-3 categories in the mega-menu visual panel when their L2 parent is curated. */
export function applyMegaMenuVisualChildren(categories: NormalizedCategory[]): void {
  const byId = new Map(categories.map((category) => [category.id, category]));

  for (const category of categories) {
    if (!category.parent_id) {
      continue;
    }

    const parent = byId.get(category.parent_id);
    if (!parent?.show_in_mega_menu || !parent.parent_id) {
      continue;
    }

    const grandparent = byId.get(parent.parent_id);
    if (!grandparent || grandparent.parent_id !== null) {
      continue;
    }

    category.show_in_mega_menu = true;
  }
}

/** Assign the first product image found per mega-menu category. */
export function assignMegaMenuImages(
  categories: NormalizedCategory[],
  rows: CsvProductRow[],
  categoryIdByPath: Map<string, string>,
): void {
  const imageByCategoryId = new Map<string, string>();

  for (const row of rows) {
    const imageUrl = mapRowImages(row, row.SKU)[0]?.url;

    if (!imageUrl) {
      continue;
    }

    for (const tag of splitTags(row.Tags)) {
      if (!isValidCategoryTag(tag)) {
        continue;
      }

      for (const path of categoryPathsFromTag(tag)) {
        const categoryId = categoryIdByPath.get(path);

        if (categoryId && !imageByCategoryId.has(categoryId)) {
          imageByCategoryId.set(categoryId, imageUrl);
        }
      }
    }
  }

  for (const category of categories) {
    if (!category.show_in_mega_menu) {
      continue;
    }

    category.mega_menu_image = imageByCategoryId.get(category.id) ?? null;
  }
}
