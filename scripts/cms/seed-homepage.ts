import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { CategoryIconKey } from "@/lib/homepage/icon-keys";
import { prepareCmsEnv } from "./prepare-env";

prepareCmsEnv();

interface HomepageManifest {
  heroes: Array<{
    layout?: string | null;
    headline: string;
    subheadline?: string | null;
    cta_text?: string | null;
    cta_href?: string | null;
    image_url: string;
    badge?: string | null;
    brand_name?: string | null;
    compare_at_price?: number | null;
    price?: number | null;
    active?: boolean;
  }>;
  promos: Array<{
    eyebrow?: string | null;
    headline: string;
    subtext?: string | null;
    cta_text?: string | null;
    cta_href?: string | null;
    image_url?: string | null;
    active?: boolean;
  }>;
  collections: Array<{
    name: string;
    slug: string;
    description?: string | null;
    image_url: string;
    cta_text?: string;
  }>;
  inspiration: Array<{
    image_url: string;
    alt_text: string;
    active?: boolean;
  }>;
  categoryShortcuts: Array<{
    slug: string;
    iconKey: string;
  }>;
}

const MANIFEST_PATH = join(process.cwd(), "public/data/catalog/homepage.json");

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed the Payload homepage global");
  }

  const manifest = JSON.parse(
    readFileSync(MANIFEST_PATH, "utf8"),
  ) as HomepageManifest;

  const { getPayload } = await import("payload");
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  await payload.updateGlobal({
    slug: "homepage",
    data: {
      heroes: manifest.heroes.map((hero) => ({
        layout: (hero.layout === "promo" ? "promo" : "standard") as
          | "standard"
          | "promo",
        headline: hero.headline,
        subheadline: hero.subheadline,
        ctaText: hero.cta_text,
        ctaHref: hero.cta_href,
        badge: hero.badge,
        brandName: hero.brand_name,
        compareAtPrice: hero.compare_at_price,
        price: hero.price,
        externalImageUrl: hero.image_url,
        active: hero.active ?? true,
      })),
      collections: manifest.collections.map((collection) => ({
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        ctaText: collection.cta_text,
        externalImageUrl: collection.image_url,
      })),
      promo: manifest.promos[0]
        ? {
            eyebrow: manifest.promos[0].eyebrow,
            headline: manifest.promos[0].headline,
            subtext: manifest.promos[0].subtext,
            ctaText: manifest.promos[0].cta_text,
            ctaHref: manifest.promos[0].cta_href,
            externalImageUrl: manifest.promos[0].image_url,
            active: manifest.promos[0].active ?? true,
          }
        : undefined,
      inspiration: manifest.inspiration.map((image) => ({
        altText: image.alt_text,
        externalImageUrl: image.image_url,
        active: image.active ?? true,
      })),
      categoryShortcuts: manifest.categoryShortcuts.map((shortcut) => ({
        slug: shortcut.slug,
        iconKey: shortcut.iconKey as CategoryIconKey,
      })),
      productCarousels: [
        {
          key: "featured",
          title: "Featured products",
          subtitle:
            "Quality building and renovation supplies curated for the BDK Supply point of view.",
          viewAllHref: "/categories/bathroom",
          ctaLabel: "View collection",
          selectionMode: "collection",
          collectionSlug: "featured",
          sort: "featured",
          limit: 4,
          active: true,
        },
        {
          key: "best-sellers",
          title: "Best sellers",
          subtitle:
            "The most-loved products in our bathroom, hardware and utility collections.",
          viewAllHref: "/collections/best-sellers",
          ctaLabel: "View all",
          selectionMode: "collection",
          collectionSlug: "best-sellers",
          sort: "featured",
          limit: 4,
          active: true,
        },
        {
          key: "new-arrivals",
          title: "New arrivals",
          subtitle: "Fresh additions across the three flagship navigation pillars.",
          viewAllHref: "/categories/bathroom",
          ctaLabel: "View arrivals",
          selectionMode: "rule",
          sort: "newest",
          limit: 4,
          active: true,
        },
      ],
    },
  });

  console.log("Seeded Payload homepage global from homepage.json");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
