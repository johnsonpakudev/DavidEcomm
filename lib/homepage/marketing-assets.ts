import type { HomepageHero } from "@/lib/supabase/types";

export const MARKETING_ASSETS = {
  carousel: "/Carousel.png",
  clearanceBanner: "/marketing/on-clearance.png",
  essentialCard: "/marketing/essential.png",
  premiumCard: "/marketing/premium.png",
  valueCard: "/marketing/value.png",
} as const;

export const HOMEPAGE_COLLECTION_SECTION = {
  title: "Shop by collection",
  subtitle:
    "Curated edits tailored to premium renovations, value-led projects and everyday finishing details.",
  cards: [
    {
      id: "collection-premium",
      name: "Premium Collection",
      slug: "premium",
      imageUrl: MARKETING_ASSETS.premiumCard,
      ctaText: "Shop premium",
      description:
        "Elevated finishes, bespoke silhouettes and designer-level detail.",
    },
    {
      id: "collection-value",
      name: "Best Value",
      slug: "best-value",
      imageUrl: MARKETING_ASSETS.valueCard,
      ctaText: "Shop best value",
      description:
        "Durable, high-performing essentials chosen for everyday renovation budgets.",
    },
    {
      id: "collection-essential",
      name: "Essential",
      slug: "essential",
      imageUrl: MARKETING_ASSETS.essentialCard,
      ctaText: "Shop essential",
      description: "Reliable fixtures and hardware that bring polish to every room.",
    },
  ],
} as const;

/** @deprecated Use HOMEPAGE_COLLECTION_SECTION */
export const HOMEPAGE_COLLECTION_SECTIONS = [HOMEPAGE_COLLECTION_SECTION] as const;

export const MARKETING_PROMO_HERO_SLIDE = {
  id: "marketing-promo-carousel",
  layout: "promo",
  badge: "ON SPECIAL",
  brand_name: "Baiachi",
  headline: "Back-to-Wall Toilet",
  subheadline: "Modern design. Everyday comfort.",
  compare_at_price: 399,
  price: 279,
  cta_text: "Shop now",
  cta_href: "/categories/bathroom-toilets",
  image_url: MARKETING_ASSETS.carousel,
  sort_order: 0,
  active: true,
} as const satisfies HomepageHero;

export const MARKETING_HERO_SLIDES = [MARKETING_PROMO_HERO_SLIDE] as const;

/** @deprecated Use MARKETING_HERO_SLIDES */
export const MARKETING_HERO_SLIDE = MARKETING_PROMO_HERO_SLIDE;

export function buildHomepageHeroSlides(heroes: HomepageHero[]): HomepageHero[] {
  if (heroes.length === 0) {
    return [...MARKETING_HERO_SLIDES];
  }

  return [...heroes].sort(
    (left, right) => left.sort_order - right.sort_order,
  );
}
