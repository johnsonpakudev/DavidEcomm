import {
  mockFooterLinks,
  mockHomepageCollections,
  mockHomepageHeroes,
  mockHomepagePromos,
  mockInspirationImages,
  mockSiteConfig,
} from "@/lib/mock/data";
import { DEFAULT_PRODUCT_CAROUSELS } from "@/lib/homepage/defaults";
import { getHomepageManifest } from "@/lib/homepage/manifest";
import { mapHomepageManifest } from "@/lib/homepage/mapper";
import { getHomepageFromCms } from "@/lib/homepage/payload";
import type { MappedHomepage } from "@/lib/homepage/types";
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

async function loadHomepageContent(): Promise<MappedHomepage> {
  const cmsContent = await getHomepageFromCms();

  if (cmsContent) {
    return {
      ...cmsContent,
      productCarousels:
        cmsContent.productCarousels.length > 0
          ? cmsContent.productCarousels
          : DEFAULT_PRODUCT_CAROUSELS,
    };
  }

  const manifest = getHomepageManifest();

  if (manifest) {
    return {
      ...mapHomepageManifest(manifest),
      productCarousels: DEFAULT_PRODUCT_CAROUSELS,
    };
  }

  const [
    heroes,
    collections,
    promos,
    inspiration,
  ] = await Promise.all([
    selectAll<HomepageHero>("homepage_heroes", "sort_order"),
    selectAll<HomepageCollection>("homepage_collections", "sort_order"),
    selectAll<HomepagePromo>("homepage_promos"),
    selectAll<InspirationImage>("inspiration_images", "sort_order"),
  ]);

  if (heroes || collections || promos || inspiration) {
    return {
      heroes: heroes ?? [],
      collections: collections ?? [],
      promos: promos ?? [],
      inspiration: inspiration ?? [],
      categoryShortcuts: [],
      productCarousels: DEFAULT_PRODUCT_CAROUSELS,
    };
  }

  return {
    heroes: mockHomepageHeroes,
    collections: mockHomepageCollections,
    promos: mockHomepagePromos,
    inspiration: mockInspirationImages,
    categoryShortcuts: [],
    productCarousels: DEFAULT_PRODUCT_CAROUSELS,
  };
}

let homepageContentPromise: Promise<MappedHomepage> | null = null;

function getHomepageContent() {
  homepageContentPromise ??= loadHomepageContent();
  return homepageContentPromise;
}

export async function getHomepageContentSnapshot() {
  return getHomepageContent();
}

export async function getHeroes() {
  const content = await getHomepageContent();
  return content.heroes
    .filter((hero) => hero.active ?? true)
    .map((hero) => ({
      ...hero,
      layout: hero.layout ?? "standard",
    }))
    .sort((left, right) => left.sort_order - right.sort_order);
}

export async function getPromos() {
  const content = await getHomepageContent();
  return content.promos.filter((promo) => promo.active ?? true);
}

export async function getCollections() {
  const content = await getHomepageContent();
  return content.collections;
}

export async function getInspirationImages() {
  const content = await getHomepageContent();
  return content.inspiration.filter((image) => image.active ?? true);
}

export async function getCategoryShortcuts() {
  const content = await getHomepageContent();
  return content.categoryShortcuts;
}

export async function getProductCarousels() {
  const content = await getHomepageContent();
  return content.productCarousels;
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
