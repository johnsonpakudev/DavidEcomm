export const MARKETING_ASSETS = {
  carousel: "/Carousel.png",
  clearanceBanner: "/ON CLEARANCE.png",
  essentialCard: "/Essential.png",
  premiumCard: "/Premium.png",
  valueCard: "/Value.png",
} as const;

export const HOMEPAGE_COLLECTION_SECTIONS = [
  {
    title: "Shop by Essentials",
    cards: [
      {
        id: "collection-essential",
        name: "Essentials",
        slug: "essential",
        priceTier: "$$",
        imageUrl: MARKETING_ASSETS.essentialCard,
        ctaText: "Shop essentials",
        description: "Reliable everyday fixtures and hardware that complete the room beautifully.",
      },
    ],
  },
  {
    title: "Shop by collection",
    cards: [
      {
        id: "collection-premium",
        name: "Premium",
        slug: "premium",
        priceTier: "$$$",
        imageUrl: MARKETING_ASSETS.premiumCard,
        ctaText: "Shop premium",
        description: "Designer-led fixtures, elevated materials and signature detailing.",
      },
      {
        id: "collection-value",
        name: "Value",
        slug: "best-value",
        priceTier: "$$$",
        imageUrl: MARKETING_ASSETS.valueCard,
        ctaText: "Shop value",
        description: "Practical, durable and renovation-ready pieces with standout value.",
      },
    ],
  },
] as const;

export const MARKETING_HERO_SLIDE = {
  id: "marketing-carousel",
  headline: "",
  subheadline: null,
  cta_text: null,
  cta_href: null,
  image_url: MARKETING_ASSETS.carousel,
  sort_order: 0,
  active: true,
} as const;
