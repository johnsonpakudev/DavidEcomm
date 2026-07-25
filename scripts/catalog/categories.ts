import type { NavPillarKey } from "@/lib/supabase/types";

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
};

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
  if (isCollectionTag(tag)) {
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
      if (isCollectionTag(tag)) {
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

    categories.push({
      id,
      name: pathName(path),
      slug: dedupeSlug(slugify(path), usedSlugs),
      parent_id: parent ? categoryIdByPath.get(parent) ?? null : null,
      nav_pillar: navPillarForPath(path),
      icon_key: null,
      mega_menu_image: null,
      mega_menu_order: megaMenuOrder,
      show_in_mega_menu: depth <= 2,
      meta_title: null,
      meta_description: null,
    });
  }

  return {
    categories,
    collectionTagsBySku,
    categoryIdByPath,
  };
}
