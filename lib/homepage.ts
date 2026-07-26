import {
  mockFooterLinks,
  mockHomepageCollections,
  mockHomepageHeroes,
  mockHomepagePromos,
  mockInspirationImages,
  mockSiteConfig,
} from "@/lib/mock/data";
import { getHomepageManifest } from "@/lib/homepage/manifest";
import { createPublicClient } from "@/lib/supabase/server";
import type {
  FooterLink,
  HomepageCollection,
  HomepageHero,
  HomepagePromo,
  InspirationImage,
  SiteConfig,
} from "@/lib/supabase/types";

async function selectAll<T>(table: string, orderBy?: string) {
  const supabase = createPublicClient();

  if (!supabase) {
    return null;
  }

  let query = supabase.from(table).select("*");

  if (orderBy) {
    query = query.order(orderBy);
  }

  const { data, error } = await query;

  if (error || !data) {
    return null;
  }

  return data as T[];
}

export async function getHeroes() {
  const manifest = getHomepageManifest();

  if (manifest) {
    return manifest.heroes.filter((hero) => hero.active ?? true);
  }

  return (
    (await selectAll<HomepageHero>("homepage_heroes", "sort_order")) ??
    mockHomepageHeroes
  ).filter((hero) => hero.active ?? true);
}

export async function getPromos() {
  const manifest = getHomepageManifest();

  if (manifest) {
    return manifest.promos.filter((promo) => promo.active ?? true);
  }

  return (
    (await selectAll<HomepagePromo>("homepage_promos")) ?? mockHomepagePromos
  ).filter((promo) => promo.active ?? true);
}

export async function getCollections() {
  const manifest = getHomepageManifest();

  if (manifest) {
    return manifest.collections;
  }

  return (
    (await selectAll<HomepageCollection>("homepage_collections", "sort_order")) ??
    mockHomepageCollections
  );
}

export async function getInspirationImages() {
  const manifest = getHomepageManifest();

  if (manifest) {
    return manifest.inspiration.filter((image) => image.active ?? true);
  }

  return (
    (await selectAll<InspirationImage>("inspiration_images", "sort_order")) ??
    mockInspirationImages
  ).filter((image) => image.active ?? true);
}

export async function getCategoryShortcuts() {
  const manifest = getHomepageManifest();

  if (manifest) {
    return manifest.categoryShortcuts;
  }

  return [];
}

export async function getFooterLinks() {
  return (
    (await selectAll<FooterLink>("footer_links", "sort_order")) ??
    mockFooterLinks
  );
}

export async function getSiteConfig() {
  const supabase = createPublicClient();

  if (!supabase) {
    return mockSiteConfig;
  }

  const { data, error } = await supabase
    .from("site_config")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return mockSiteConfig;
  }

  return data as SiteConfig;
}
