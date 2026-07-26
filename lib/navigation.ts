import { getCachedCategories } from "@/lib/categories";
import type { NavigationPillar, NavPillarKey } from "@/lib/supabase/types";

const pillarLabels: Record<NavPillarKey, string> = {
  bathroom: "Bathroom",
  "doors-hardware": "Doors & Hardware",
  "kitchen-laundry": "Kitchen & Laundry",
};

const NAV_PILLAR_KEYS = new Set<NavPillarKey>(Object.keys(pillarLabels) as NavPillarKey[]);

function isNavPillarKey(value: string | null): value is NavPillarKey {
  return value !== null && NAV_PILLAR_KEYS.has(value as NavPillarKey);
}

export async function getNavigationTree(): Promise<NavigationPillar[]> {
  const categories = await getCachedCategories();
  const pillars = categories.filter(
    (category) =>
      category.parent_id === null &&
      isNavPillarKey(category.nav_pillar) &&
      category.show_in_mega_menu,
  );

  return pillars
    .sort((left, right) => left.mega_menu_order - right.mega_menu_order)
    .map((pillar) => ({
      slug: pillar.nav_pillar as NavPillarKey,
      label: pillarLabels[pillar.nav_pillar as NavPillarKey],
      category: pillar,
      children: categories
        .filter(
          (category) =>
            category.parent_id === pillar.id &&
            category.show_in_mega_menu &&
            !category.name.includes(";"),
        )
        .sort((left, right) => left.mega_menu_order - right.mega_menu_order),
    }));
}
