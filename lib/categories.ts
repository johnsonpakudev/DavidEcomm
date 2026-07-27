import { unstable_cache } from "next/cache";

import { getJsonCategories } from "@/lib/catalog/loader";
import { prefersJsonCatalog } from "@/lib/catalog/source";
import { createPublicClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/supabase/types";

async function fetchSupabaseCategories() {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("mega_menu_order");

  if (error || !data) {
    return null;
  }

  return data as Category[];
}

export async function getCategories() {
  if (prefersJsonCatalog()) {
    return getJsonCategories();
  }

  const categories = await fetchSupabaseCategories();

  return categories ?? getJsonCategories();
}

export const getCachedCategories = unstable_cache(getCategories, ["categories"], {
  revalidate: 60,
  tags: ["categories"],
});

export async function getCategoryBySlug(slug: string) {
  const categories = await getCachedCategories();

  return categories.find((category) => category.slug === slug) ?? null;
}

export async function getCategoryChildren(parentId: string | null) {
  const categories = await getCachedCategories();

  return categories.filter((category) => category.parent_id === parentId);
}

export async function getCategoryAncestors(category: Category) {
  const categories = await getCachedCategories();
  const byId = new Map(categories.map((item) => [item.id, item]));
  const ancestors: Category[] = [];
  let current = category;

  while (current.parent_id) {
    const parent = byId.get(current.parent_id);

    if (!parent) {
      break;
    }

    ancestors.unshift(parent);
    current = parent;
  }

  return ancestors;
}

export async function getCategorySlugs() {
  const categories = await getCachedCategories();

  return categories.map((category) => category.slug);
}
