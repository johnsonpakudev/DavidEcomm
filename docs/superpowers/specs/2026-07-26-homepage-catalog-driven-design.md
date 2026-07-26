# Homepage Catalog-Driven Content — Design Specification

**Date:** 2026-07-26  
**Status:** Approved — 2026-07-26  
**Project:** DavidEcomm (BDK Supply storefront)  
**Related:**
- [BDK Catalog Integration Design](./2026-07-26-bdk-catalog-integration-design.md)
- [Frontend Design Specification](./2026-07-18-davidecomm-frontend-design.md)
- [Infrastructure & CI Design](./2026-07-18-davidecomm-infra-ci-design.md)

---

## 1. Problem

The homepage renders **Phase 1 mock content** (Unsplash lifestyle imagery, premium-renovation copy, fictional collection slugs) on top of the **real BDK JSON catalog** (~2,744 products). This causes:

- Hero, collection cards, promo, and inspiration sections showing stock photos unrelated to BDK products
- "Best sellers" querying the `clearance` collection (284 Vellena vanities) instead of actual bestsellers
- "Shop by category" icon grid empty (hardcoded slugs like `vanities` do not exist; catalog uses `bathroom-vanities`, etc.)
- Collection cards linking to `premium` / `best-value` / `essential` — collections that do not exist in the catalog
- Copy tone ("premium fixtures") misaligned with BDK brand ("Direct from the manufacturer, to you")

**Goal:** Bring every homepage section to **8+/10** catalog and business alignment using a **catalog-driven** approach that remains compatible with Phase 3 CMS.

---

## 2. Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Content strategy | Catalog-driven (Approach A) | Homepage derives from BDK JSON catalog at build time; no separate CMS yet |
| Best sellers | Tag + SKU fallback (A+C hybrid) | No `Best Sellers` tag in CSV today; seed from known Shopify homepage SKUs until tag exists |
| Inspiration | Keep 4-tile grid format | Same component; replace Unsplash with catalog product mosaic (one image per nav pillar) |
| Component changes | Minimal | Existing layout preserved; data source swap only |
| Phase 3 path | Same `lib/homepage.ts` API | CMS/Supabase overrides manifest without component rewrites |

---

## 3. Architecture

### 3.1 Data flow

```
BDKSUPPLY All Products.csv
        ↓
  catalog:build (scripts/catalog/build.ts)
        ↓
  public/data/catalog/
    ├── products.json      (existing)
    ├── categories.json    (existing)
    ├── search-index.json  (existing)
    └── homepage.json      (NEW — heroes, collections, promos, inspiration, category shortcuts)
        ↓
  lib/homepage.ts
    when useJsonCatalog() → read homepage.json
    else → Supabase tables (if configured)
    else → lib/mock/data.ts fallback
        ↓
  Existing homepage components (unchanged layout)
```

### 3.2 Homepage manifest schema

`homepage.json` mirrors existing TypeScript types:

```ts
interface HomepageManifest {
  heroes: HomepageHero[];
  promos: HomepagePromo[];
  collections: HomepageCollection[];
  inspiration: InspirationImage[];
  categoryShortcuts: Array<{
    slug: string;       // real catalog category slug
    iconKey: string;    // maps to lucide icon in category-icon-grid
  }>;
}
```

### 3.3 Phase 3 compatibility

| Now | Phase 3 |
|-----|---------|
| `homepage.json` generated at build | `homepage_*` Supabase tables synced from Sanity |
| `getHeroes()` reads manifest | `getHeroes()` reads Supabase (already stubbed in `lib/homepage.ts`) |
| Best sellers from tag/SKU list | Marketing team manages in Sanity |
| Inspiration from product mosaic | Real project/lifestyle photos from CMS |

No component API changes required at Phase 3 — only the data source behind `lib/homepage.ts` getters changes.

---

## 4. Per-Section Merchandising Rules

### 4.1 Hero carousel

- **Images:** Primary product image from top 2–3 bestseller/featured products (Shopify CDN)
- **Headline:** BDK brand voice — e.g. "Direct from the manufacturer, to you"
- **Subheadline:** Category-specific (vanities, toilets, doors)
- **CTA:** Link to relevant category or collection
- **Selection:** Prefer products with landscape-friendly images; must have `images[0].url`

### 4.2 Featured products

- **Query:** `getProducts({ collection: "featured", limit: 4 })` — unchanged
- **Source:** 8 products tagged `Featured` in CSV

### 4.3 Collection cards

Replace mock `premium` / `best-value` / `essential` with real catalog collections:

| Card | Collection slug | Image source |
|------|----------------|--------------|
| Featured | `featured` | Highest-res image from featured products |
| Clearance | `clearance` | Representative clearance product image |
| Bundle Deals | `bundle-deals` | Representative bundle product image |

### 4.4 Shop by category (icon grid)

Replace hardcoded mock slugs with real catalog slugs:

| Icon key | Catalog slug |
|----------|--------------|
| vanities | `bathroom-vanities` |
| toilets | `bathroom-toilets` |
| basins | `bathroom-basins` |
| tapware | `bathroom-tapware` |
| showers | `bathroom-showers` |
| mirrors-cabinets | `bathroom-mirrors-cabinets` |
| accessories | `bathroom-accessories` |
| door-handles | `doors-hardware-hardware-handles-locks` |
| kitchen-sinks | `kitchen-laundry-kitchen-laundry-sinks` |
| laundry-tubs | `kitchen-laundry-laundry-tubs` |
| cabinet-handles | `doors-hardware-hardware-pull-handles` |

Slugs are validated against `categories.json` at build time. If a slug is missing, the builder logs a warning and omits that shortcut (never emits a broken link).

### 4.5 Promo banner

- **Source:** Clearance collection (largest merchandising collection)
- **Copy:** "Save on clearance favourites" / link to `/collections/clearance`
- **Image:** Top clearance product with strong visual

### 4.6 Best sellers

**Primary rule:** Map `Best Sellers` Shopify tag → `best-sellers` collection slug in `COLLECTION_TAGS` (future-proof).

**Fallback rule:** Until tag exists, seed `best-sellers` from curated SKU list in `scripts/catalog/best-sellers.json`:

| SKU / product match | Product |
|---------------------|---------|
| Match by name contains | Ivana 600mm PVC vanity |
| Match by name contains | Baiachi Vortex Rimless Tornado Toilet Suite |
| Match by name contains | 820X2040 entrance door |
| Match by name contains | Tile Insert Floor Waste |
| Match by name contains | 440X440mm Handmade Kitchen Sink |

Homepage query changes from `collection: "clearance"` to `collection: "best-sellers"`.

### 4.7 New arrivals

- **Query:** `getProducts({ limit: 4, sort: "newest" })` — unchanged
- Products sorted by `created_at` descending

### 4.8 Inspiration grid

- **Format:** Keep existing 4-tile grid linking to `/inspiration`
- **Images:** One representative product image per nav pillar:
  - Bathroom (vanity or toilet)
  - Doors & Hardware (entrance door)
  - Kitchen & Laundry (sink or tub)
  - Fourth tile: featured or bundle product
- **Alt text:** Product name from catalog
- **No Unsplash URLs**

### 4.9 Copy and messaging

Replace premium-renovation language with BDK voice across manifest-generated copy:

| Before | After |
|--------|-------|
| "Premium fixtures for the spaces that matter most" | "Direct from the manufacturer, to you" |
| "Curated edits for premium renovations" | "Building and renovation supplies across Australia" |
| "Brass tapware and timeless utility" | Brand-led (Baiachi, IKON, ACL) |

---

## 5. Build Pipeline Changes

### 5.1 New files

| File | Purpose |
|------|---------|
| `scripts/catalog/homepage.ts` | Derives `HomepageManifest` from normalized products + categories |
| `scripts/catalog/best-sellers.json` | Fallback SKU/name patterns for bestseller seeding |
| `public/data/catalog/homepage.json` | Generated output (committed) |

### 5.2 Modified files

| File | Change |
|------|--------|
| `scripts/catalog/categories.ts` | Add `Best Sellers` → `best-sellers` to `COLLECTION_TAGS` |
| `scripts/catalog/transform.ts` | Apply bestseller fallback after collection slug extraction |
| `scripts/catalog/build.ts` | Call `buildHomepageManifest()` and write `homepage.json` |
| `lib/homepage.ts` | Read `homepage.json` when `useJsonCatalog()` |
| `app/(storefront)/page.tsx` | Fix best-sellers query to `collection: "best-sellers"` |
| `components/homepage/category-icon-grid.tsx` | Read `categoryShortcuts` from homepage manifest |

### 5.3 `buildHomepageManifest()` logic

1. Load normalized products and categories from transform output
2. Resolve bestseller products (tag first, SKU fallback second)
3. Build 2–3 hero slides from bestsellers/featured with images
4. Build 3 collection cards from `featured`, `clearance`, `bundle-deals`
5. Pick promo from clearance collection
6. Pick 4 inspiration tiles (pillar diversity, prefer square images)
7. Export category shortcut list with icon keys
8. Write `homepage.json`

### 5.4 Product image selection heuristic

When picking a representative image for a collection or pillar:

1. Prefer products with `images.length >= 1`
2. Prefer images with URL containing `cdn.shopify.com`
3. Prefer products in `featured` or `best-sellers` collections
4. Tie-break by lowest `sort_order` or first alphabetically

---

## 6. Component Changes

**No layout or styling changes.** Only data wiring:

```tsx
// page.tsx — fix best sellers
getProducts({ collection: "best-sellers", limit: 4, sort: "featured" })

// category-icon-grid.tsx — read shortcuts from manifest
const shortcuts = await getCategoryShortcuts();
```

All other components (`HeroCarousel`, `CollectionCards`, `PromoBanner`, `InspirationGrid`, `ProductCarousel`) receive the same props — only the data behind `getHeroes()` etc. changes.

---

## 7. Error Handling

| Scenario | Behaviour |
|----------|-----------|
| `homepage.json` missing | Fall back to `lib/mock/data.ts` (existing behaviour) |
| Collection has zero products | Omit that collection card; log warning in build report |
| Best-seller SKU not found in CSV | Skip that SKU; log warning; continue with matches found |
| Category shortcut slug not in catalog | Omit from icon grid; log warning at build time |
| Product has no images | Skip for hero/inspiration selection; use next candidate |

Build must not fail on missing optional merchandising data — degrade gracefully with warnings in `ImportReport`.

---

## 8. Testing

### 8.1 Unit tests (`scripts/catalog/homepage.test.ts`)

- Hero builder selects products with images
- Collection cards map to real slugs (`featured`, `clearance`, `bundle-deals`)
- Best-seller fallback resolves known SKU patterns
- Inspiration picks one product per pillar
- Category shortcuts use real catalog slugs
- No output URL contains `unsplash.com`

### 8.2 Integration

- `npm run catalog:build` produces valid `homepage.json`
- Homepage renders 11 category icons (not zero)
- Best sellers section shows Ivana/Vortex-class products, not clearance Vellena block

### 8.3 E2E (`tests/e2e/smoke-catalog.spec.ts`)

- Update hero headline assertion to BDK copy
- Assert category grid has visible links
- Assert no `unsplash.com` in page HTML when JSON catalog active

---

## 9. Success Criteria

| Section | Before | Target | Pass test |
|---------|--------|--------|-----------|
| Hero | 2/10 | 8/10 | Real product images; BDK tagline; no Unsplash |
| Featured | 5/10 | 8/10 | 4 featured products with Shopify images |
| Collections | 1/10 | 8/10 | 3 real collections; clickable; real photos |
| Category grid | 0/10 | 8/10 | 11 visible categories; all links resolve |
| Promo | 3/10 | 8/10 | Clearance promo with real product image |
| Best sellers | 2/10 | 9/10 | Matches Shopify homepage products |
| New arrivals | 4/10 | 8/10 | Recent products with images |
| Inspiration | 2/10 | 8/10 | 4 catalog product photos; pillar diversity |

**Global:** Zero `unsplash.com` URLs on homepage when JSON catalog is active.

---

## 10. Non-Goals

- Sanity CMS integration (Phase 3)
- New homepage sections or layout redesign
- AI-generated copy or images
- Automated sync from live Shopify API (CSV export remains source of truth)
- Custom photography upload workflow

---

## 11. Implementation Order

1. Add `best-sellers.json` + extend `COLLECTION_TAGS`
2. Implement `scripts/catalog/homepage.ts` builder
3. Wire into `catalog:build` → generate `homepage.json`
4. Update `lib/homepage.ts` to read manifest
5. Fix `page.tsx` best-sellers query
6. Update `category-icon-grid.tsx` shortcuts
7. Run `catalog:build`, verify homepage visually
8. Add unit + e2e tests

---

*Spec written 2026-07-26 — Homepage Catalog-Driven Content*
