import type { Category } from "@/lib/supabase/types";

export const MEGA_MENU_VISUAL_CHILD_LIMIT = 8;

export const MEGA_MENU_PROMO_LINKS = [
  { label: "Clearance", href: "/collections/clearance" },
  { label: "Best sellers", href: "/collections/best-sellers" },
  { label: "Bundle deals", href: "/collections/bundle-deals" },
] as const;

export function buildMegaMenuVisualChildrenIndex(
  categories: Category[],
): Map<string, Category[]> {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const index = new Map<string, Category[]>();

  for (const category of categories) {
    if (!category.show_in_mega_menu || !category.parent_id) {
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

    const siblings = index.get(parent.id) ?? [];
    siblings.push(category);
    index.set(parent.id, siblings);
  }

  for (const [parentId, siblings] of index) {
    index.set(
      parentId,
      [...siblings].sort(
        (left, right) => left.mega_menu_order - right.mega_menu_order,
      ),
    );
  }

  return index;
}

export function getMegaMenuVisualChildren(
  parentCategory: Category,
  visualChildrenIndex: Map<string, Category[]>,
  limit = MEGA_MENU_VISUAL_CHILD_LIMIT,
): Category[] {
  const visualChildren = (visualChildrenIndex.get(parentCategory.id) ?? []).slice(
    0,
    limit,
  );

  return visualChildren.length > 0 ? visualChildren : [parentCategory];
}

export function selectMegaMenuChildSlug(
  current: Record<string, string>,
  pillarSlug: string,
  childSlug: string,
): Record<string, string> {
  return {
    ...current,
    [pillarSlug]: childSlug,
  };
}
