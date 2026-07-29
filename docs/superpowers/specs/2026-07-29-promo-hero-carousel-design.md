# Promo Hero Carousel Overlay — Design Specification

**Date:** 2026-07-29  
**Status:** Approved — 2026-07-29  
**Project:** DavidEcomm (BDK Supply storefront)  
**Related:**
- [Homepage Catalog-Driven Content](./2026-07-26-homepage-catalog-driven-design.md)
- [Phase 3 Payload CMS Design](./2026-07-27-phase-3-payload-cms-design.md)

---

## 1. Problem

The homepage hero currently renders `/marketing/carousel.png` in `imageOnly` mode — a flat image with no text overlay. A reference design (`public/Carousel2.png`) shows the intended layout: promotional copy, pricing, feature icons, and a CTA composited over a clean background photo (`public/Carousel.png`).

**Goal:** Recreate the Carousel2 overlay programmatically (HTML/CSS/React) on top of `Carousel.png`. Carousel2 is a visual reference only — it must never be rendered as an image asset. The hero remains a multi-slide carousel where promo slides use the rich layout and other slides use the existing standard layout.

---

## 2. Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Carousel scope | Multi-slide with layout variants | User chose mixed slide types in one carousel |
| Implementation approach | Layout variants inside `HeroCarousel` | Single carousel, single data source, extensible |
| Content source | Hybrid CMS | Promo copy/pricing CMS-editable; feature icons hardcoded |
| Trust bar | Separate below carousel | Consistent when slides rotate; matches current `HeroTrustBar` |
| Background asset | Per-slide image (`/Carousel.png` for toilet promo) | Clean photo separate from overlay text |
| Reference image | Carousel2 never displayed | Text/UI built in code only |

---

## 3. Architecture

### 3.1 Component structure

```
HeroCarousel (extended)
├── StandardHeroSlide     — existing dark scrim + headline/subheadline/CTA
└── PromoHeroSlide (new)  — left gradient + promo content
    ├── PromoBadge        — eyebrow pill (e.g. "ON SPECIAL")
    ├── PromoHeadline     — brand name + product name
    ├── PromoPricing      — compare-at + sale price
    ├── PromoCta          — "SHOP NOW →" link button
    └── PromoFeatureRow   — 4 hardcoded trust/feature icons + labels

HeroTrustBar (unchanged)  — sticky bar below carousel, not inside slides
```

**New file:** `components/homepage/promo-hero-slide.tsx`  
**Modified files:** `components/homepage/hero-carousel.tsx`, `payload/globals/Homepage.ts`, `lib/homepage/mapper.ts`, `lib/supabase/types.ts`, `lib/homepage/marketing-assets.ts`, `app/(storefront)/page.tsx`

### 3.2 Data flow

```
Payload CMS homepage.heroes[]
        ↓
  mapHero() in lib/homepage/mapper.ts
        ↓
  HomepageHero (extended with layout + promo fields)
        ↓
  getHeroes() in lib/homepage.ts
  (fallback: marketing-assets.ts → homepage.json → Supabase → mock)
        ↓
  HeroCarousel — branches on slide.layout
        ↓
  StandardHeroSlide | PromoHeroSlide overlay on slide.image_url
```

**Homepage wiring change:** Replace hardcoded `MARKETING_HERO_SLIDE` + `imageOnly` with `await getHeroes()`. Remove `imageOnly` usage on the storefront homepage. Re-enable carousel autoplay and prev/next arrows when `slides.length > 1`.

---

## 4. Data Model

### 4.1 Extended `HomepageHero` type

```ts
type HeroLayout = "standard" | "promo";

interface HomepageHero {
  id: string;
  layout: HeroLayout;           // NEW — default "standard"
  headline: string;
  subheadline: string | null;
  cta_text: string | null;
  cta_href: string | null;
  image_url: string;
  sort_order: number;
  active?: boolean;
  // Promo-only fields (nullable/optional on standard slides)
  badge?: string | null;        // e.g. "ON SPECIAL"
  brand_name?: string | null;   // e.g. "Baiachi"
  compare_at_price?: number | null;
  price?: number | null;
}
```

### 4.2 Payload CMS schema (heroes array)

| Field | Type | Required | Layout |
|-------|------|----------|--------|
| `layout` | select: `standard` \| `promo` | yes (default `standard`) | both |
| `headline` | text | yes | both — product name for promo |
| `subheadline` | textarea | no | both — tagline for promo |
| `ctaText` | text | no | both |
| `ctaHref` | text | no | both |
| `image` / `externalImageUrl` | media (existing `imageFields`) | yes | both |
| `badge` | text | no | promo only — admin conditional |
| `brandName` | text | no | promo only |
| `compareAtPrice` | number | no | promo only |
| `price` | number | no | promo only |
| `active` | checkbox | no | both |

Promo-specific fields use Payload `admin.condition` so they only appear when `layout === 'promo'`.

### 4.3 Seed / fallback content

`lib/homepage/marketing-assets.ts` exports `MARKETING_PROMO_HERO_SLIDE`:

```ts
{
  layout: "promo",
  image_url: "/Carousel.png",
  badge: "ON SPECIAL",
  brand_name: "Baiachi",
  headline: "Back-to-Wall Toilet",
  subheadline: "Modern design. Everyday comfort.",
  compare_at_price: 399,
  price: 279,
  cta_text: "Shop now",
  cta_href: "/categories/bathroom-toilets",
  active: true,
}
```

Used when CMS/manifest/Supabase return no heroes. Additional standard slides may be added to the fallback array for local multi-slide testing.

### 4.4 Hardcoded feature row (not CMS)

Four fixed items rendered by `PromoFeatureRow`:

| Icon (lucide-react) | Label |
|---------------------|-------|
| `Shield` (with "20") | 20 YEAR WARRANTY |
| `Droplets` | WATER EFFICIENT |
| Custom toilet/flush icon or nearest lucide equivalent | POWERFUL FLUSH |
| `BadgeCheck` | QUALITY GUARANTEED |

These do not vary per slide in v1.

---

## 5. Visual Specification

Matches `public/Carousel2.png` using existing design tokens from `app/globals.css`.

### 5.1 Background

- Full-bleed `MarketingImage` with `object-cover`
- Container: `min-h-[480px]` mobile, `min-h-[560px]` desktop
- Image source: slide's `image_url` (toilet promo uses `/Carousel.png`)

### 5.2 Left gradient overlay

CSS gradient layer over the image (not baked into the photo):

```css
background: linear-gradient(
  to right,
  rgba(255, 255, 255, 0.92) 0%,
  rgba(255, 255, 255, 0.75) 45%,
  transparent 70%
);
```

On mobile, increase opacity so text remains legible over the full width.

### 5.3 Typography and colors

| Element | Style |
|---------|-------|
| Badge | `bg-warm-stone-600`, white uppercase pill, small tracking |
| Brand name | Bold `text-tangaroa`, ~48px desktop |
| Product name (`headline`) | Bold `text-tangaroa`, ~28px |
| Tagline (`subheadline`) | Regular `text-inkjet` |
| Was price | Strikethrough `text-slate-grey`, "WAS $399" |
| Now label | Bold `text-tangaroa`, "NOW ONLY" |
| Sale price | Large `text-warm-stone-600`, ~56px, formatted as `$279` |
| CTA | `bg-tangaroa` pill, white uppercase text, trailing `→` |

Price formatting uses existing currency conventions (AUD, no decimals for whole dollars).

### 5.4 Standard slide (unchanged behavior)

When `layout === 'standard'`, render the existing overlay: dark scrim (`bg-tangaroa/55`), left-aligned headline, subheadline, and gold CTA.

---

## 6. Responsive Behavior

| Breakpoint | Promo slide behavior |
|------------|---------------------|
| Desktop (≥768px) | Left-aligned content within gradient zone; feature row in one horizontal row |
| Mobile (<768px) | Stronger full-width light backdrop; stacked typography; feature row in 2×2 grid; reduced price font size |

Trust bar (`HeroTrustBar`) remains full-width below the carousel at all breakpoints.

---

## 7. Carousel Behavior

- Autoplay: 6s delay (existing), enabled when multiple slides
- Loop: enabled when multiple slides
- Prev/next arrows: shown when `slides.length > 1`
- First slide image: `priority` for LCP

---

## 8. Out of Scope (v1)

- Per-slide custom feature icons via CMS
- Trust bar integrated inside hero slides
- Using `Carousel2.png` as a rendered asset
- Product price synced automatically from catalog (prices are CMS/static fields)
- Animations beyond existing carousel transitions

---

## 9. Testing

| Check | Expected |
|-------|----------|
| Promo slide with `/Carousel.png` | Text overlay matches Carousel2 reference; Carousel2 image not used |
| Standard slide in same carousel | Dark scrim layout renders correctly |
| Single slide | No arrows; no autoplay loop requirement |
| CMS promo fields | Badge, brand, pricing editable in Payload admin |
| Fallback (no CMS) | `MARKETING_PROMO_HERO_SLIDE` renders from marketing-assets |
| Mobile | Text legible; feature grid 2×2 |
| Trust bar | Visible below carousel on all slides |
| `getHeroes()` wired | Homepage no longer uses `imageOnly` hardcode |

---

## 10. Migration Notes

1. Extend Payload `Homepage` global schema and run `cms:migrate` / `cms:push` as appropriate.
2. Update `mapHero()` and regenerate types via `generate:types`.
3. Seed first promo slide in CMS or `seed-homepage.ts` with `/Carousel.png` and Baiachi content.
4. Update `homepage.json` manifest heroes entry if manifest fallback is used.
5. Switch `app/(storefront)/page.tsx` from `MARKETING_HERO_SLIDE` + `imageOnly` to `getHeroes()`.
