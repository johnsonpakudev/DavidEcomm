# BDK Supply Catalog Integration — Design Specification

**Date:** 2026-07-26  
**Status:** Draft — pending user review  
**Project:** DavidEcomm  
**Source data:** `public/data/BDKSUPPLY All Products.csv`  
**Related:**
- [Infrastructure & CI Design](./2026-07-18-davidecomm-infra-ci-design.md)
- [Frontend Design Specification](./2026-07-18-davidecomm-frontend-design.md)
- [Phase 1 Implementation Plan](../plans/2026-07-18-phase-1-catalog.md)

---

## 1. Overview

Integrate the BDK Supply product export (~3,338 CSV rows, ~2,746 active SKUs) into the existing DavidEcomm storefront UI. The integration replaces hand-authored mock catalog data with real product content while preserving the current data-access pattern: **Supabase when configured, generated JSON fallback otherwise**.

### Goals

- Import all **active** products with images, specs, pricing, and categories derived from CSV `Tags`.
- Group colour/finish variants into parent products with `product_variants` rows (hybrid grouping).
- Auto-generate the full category tree for PLP/filtering; **curate mega-menu** display and **update nav** for deeper real-world hierarchy.
- Fix responsive UI gaps exposed by real data volume (pagination, gallery thumbnails, HTML descriptions, Shopify CDN images).
- Remain compatible with Phase 2–7 roadmap (checkout per-SKU, inventory per variant, Sanity CMS sync in Phase 3).

### Non-Goals

- Checkout, cart persistence, or inventory reservation (Phase 2+).
- Sanity CMS wiring (Phase 3).
- Automated review import from external sources (separate feature; UI already exists).
- Re-importing inactive/draft CSV rows to the public storefront.
- AI vector search or on-site chat.

---

## 2. Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data layer | JSON fallback + Supabase production | Matches existing `lib/products.ts` pattern and README |
| Product model | Hybrid grouping | Uses existing `product_variants` schema; fewer PDPs; Phase 5 stock is per SKU |
| Grouping rules | Heuristic + `product-groups.json` overrides | SKU-prefix-only grouping over-merges basin types; title-only grouping under-merges colour families |
| Categories | Hybrid tree + nav update | Full tag depth for PLP; curated mega-menu for usability |
| Storefront scope | Active products only | 2,746 public SKUs; inactive rows excluded from browse/search |
| Transform approach | Shared build-time pipeline | Testable, repeatable when CSV updates; avoids runtime CSV parsing |

---

## 3. Architecture

### 3.1 Pipeline

```
BDKSUPPLY All Products.csv
        │
        ▼
scripts/catalog/transform.ts  ◄── product-groups.json (manual overrides)
        │
        ├──► public/data/catalog/products.json
        ├──► public/data/catalog/categories.json
        ├──► public/data/catalog/search-index.json
        └──► supabase/seed_catalog.sql (generated)
                │
                ▼
         lib/catalog/loader.ts
                │
    ┌───────────┴───────────┐
    ▼                       ▼
 Supabase (prod)      JSON bundle (local/preview)
    │                       │
    └───────────┬───────────┘
                ▼
     lib/products.ts / lib/categories.ts
                ▼
          Storefront UI
```

### 3.2 npm Scripts

| Script | Purpose |
|--------|---------|
| `npm run catalog:build` | Parse CSV, apply grouping, emit JSON bundle + import report |
| `npm run catalog:seed` | Apply `seed_catalog.sql` to configured Supabase project |
| `npm run catalog:validate` | Fail CI if slugs duplicate, prices invalid, or zero active products |

### 3.3 Loader Behaviour

`lib/catalog/loader.ts` becomes the single read path for categories and products:

1. If `NEXT_PUBLIC_SUPABASE_URL` + anon key present → query Supabase (unchanged API surface).
2. Otherwise → import JSON from `public/data/catalog/*.json`.
3. `lib/mock/data.ts` retains homepage heroes, promos, collections, footer, site config until Phase 3 CMS.

---

## 4. CSV Field Mapping

### 4.1 Core Product Fields

| CSV column | Target | Transform |
|------------|--------|-----------|
| `SKU` | `product_variants.sku` or `products.sku` | Preserve original; unique constraint |
| `Title` | `products.name` | Parent name strips embedded colour/finish tokens when grouped |
| `Description` | `products.description` | Store HTML; sanitize at render |
| `Vendor` | `products.brand` | Direct map |
| `Price` | `products.price` / variant `price` | `Math.round(parseFloat(price) * 100)` → AUD cents |
| `Status` | filter gate | Import only rows where `Status = active` |
| `Colour` | variant `name`, `option_value` | Finish label for variant picker |
| `Image 1`–`Image 15` | `product_images[]` | Skip empty cells; `sort_order` 0–14 |
| `UPC Barcode` | `products.gtin` | Direct map when present |
| `Tags` | `category_id`, `collection_slugs` | See §5 |
| `Warranty` | `product_specifications` | Parse JSON `{"text","url"}` → spec row with optional link |
| `Product Weight`, `Shipping Length/Width/Height` | `product_specifications` + `attributes` | Dimensions group; used later for Phase 6 shipping tiers |

### 4.2 Specification Columns

All non-empty columns prefixed with `Specific ` map to `product_specifications`:

- **Label:** strip prefix, title-case (e.g. `Specific Item Width` → "Item Width").
- **Groups:**
  - **Dimensions** — Item Height/Length/Width, Mirror Thickness, Glass Thickness, etc.
  - **Materials** — Basin Material, Cabinet Material, Leg Material, Glass, etc.
  - **Compliance** — Wels And Watermark Certified, Safety Glass, etc.
  - **Details** — all remaining `Specific *` fields.

Parent product inherits specs from default variant row. Variant-specific spec differences are out of scope for v1 unless values differ within a group (log warning in import report).

### 4.3 Collections from Tags

Leaf tags that are not category paths become `collection_slugs`:

| Tag | Collection slug |
|-----|-----------------|
| `Clearance` | `clearance` |
| `Featured` | `featured` |
| `Bundle Deals` | `bundle-deals` |

Collection pages reuse existing `/collections/[slug]` route.

---

## 5. Category Tree & Navigation

### 5.1 Tree Generation

1. Split each product's `Tags` field on `, ` to get individual tag paths.
2. Split each path on ` > ` to build nested nodes.
3. Assign stable slugs via slugify (lowercase, hyphenated).
4. Map top-level nodes to `nav_pillar`:
   - `Bathroom` → `bathroom`
   - `Doors & Hardware` → `doors-hardware`
   - `Kitchen & Laundry` → `kitchen-laundry`
5. Non-pillar top-level tags (`Clearance`, `Silicone & Adhesive`, etc.) → collections only; not nav pillars.
6. Assign each product's **deepest matching category path** as `category_id` (longest path wins when multiple tags apply).

### 5.2 Mega-Menu Curation

| Depth | Example | `show_in_mega_menu` | UI placement |
|-------|---------|---------------------|--------------|
| 1 | Bathroom | `true` (pillar) | Nav trigger |
| 2 | Vanities | `true` | Mega-menu left column |
| 3 | Wall Hung Vanities | `false` | Mega-menu right thumbnail panel when L2 hovered |
| 4–7 | 1500mm | `false` | Category PLP subcategory chips only |

Default `mega_menu_image`: first product image found in category, or null.

### 5.3 Nav Component Updates

**`lib/navigation.ts`** — no API change; consumes generated categories.

**`components/layout/mega-menu.tsx`:**

- Cap thumbnail grid at 8 items + "View all {category}" link.
- Apply `line-clamp-2` on long category/product labels.
- Handle empty `mega_menu_image` with text-only fallback tile.

**Mobile sheet nav (`site-header.tsx` or equivalent):**

- Accordion per pillar showing levels 2–3 links.
- "View all" link per pillar to `/categories/{pillar-slug}`.

---

## 6. Product Grouping

### 6.1 Algorithm

```
groupKey = normalizeTitle(title)
         + "|" + basinSuffix(sku)
         + "|" + specificSize
         + "|" + specificType

normalizeTitle:
  replace known finish tokens (Empire Oak, Wash White, Matte Black,
  Brushed Brass, Chrome, White Oak, Natural Oak, …) with {COLOUR}
  collapse whitespace

basinSuffix(sku):
  segment after final dash (E, ED, QD, VT, WT, …)
  prevents merging single-basin and double-basin SKUs

Group when:
  - 2+ rows share groupKey
  - Colour values differ
  - Not in forceStandalone overrides

Standalone when:
  - Single row for groupKey
  - forceStandalone override
  - forceGroup not applicable
```

Expected outcome on current CSV: ~213 colour families (~469 SKUs grouped); ~2,200+ standalone products.

Every CSV row **must** produce exactly one `product_variants` row when grouped, or one `products` row with optional single default variant when standalone.

### 6.2 Override File

Path: `scripts/catalog/product-groups.json`

```json
{
  "forceGroup": {
    "VELPVC150WH-EO-E": "group-vellena-1500-poly-single"
  },
  "forceStandalone": ["SOME-SKU"],
  "swatchColors": {
    "Empire Oak": "#C4A882",
    "Wash White": "#F5F5F0",
    "Matte Black": "#1E2B3B"
  }
}
```

- `forceGroup`: SKU → stable group id shared by all members.
- `forceStandalone`: SKUs that must not be merged.
- `swatchColors`: maps `Colour` column to hex for variant picker swatches.

### 6.3 Slugs & IDs

- **Product slug:** derived from normalized parent title + size token; dedupe with numeric suffix on collision.
- **Product id:** deterministic UUID v5 from slug (stable across re-imports).
- **Variant id:** deterministic UUID v5 from SKU.
- **PDP URL:** `/products/{parent-slug}` only; variants selected in-page.

---

## 7. Responsive UI Updates

| Issue | Root cause | Fix |
|-------|------------|-----|
| Images 404 | `next.config.ts` missing Shopify host | Add `{ protocol: "https", hostname: "cdn.shopify.com" }` |
| PLP slow / huge DOM | All products loaded at once | Server pagination: 24 products/page; `?page=` query param |
| Gallery unusable on mobile | 15 thumbnails in 4-col grid | Horizontal scroll strip; 64px thumbs mobile, 80px desktop |
| Description formatting lost | Plain-text render of HTML | Sanitize + `prose prose-sm max-w-none` on PDP only |
| Long PDP titles overflow | Fixed `text-4xl` | `text-2xl sm:text-3xl lg:text-4xl text-balance` |
| Category count wrong | Shows page length | Display total from paginated query metadata |
| Search slow on JSON path | Linear scan of 2,746 products | Pre-built `search-index.json` with tokenized fields |
| Mega-menu overflow | Deep real categories | 8-item cap + view-all; label truncation |

### 7.1 Pagination Contract

Category, collection, and search pages:

- Default `limit=24`, max `48`.
- Return `{ products, total, page, pageCount }` from data layer.
- Preserve sort/filter query params across pages.
- ISR `revalidate=60` unchanged.

---

## 8. Future Phase Compatibility

| Phase | Requirement | How this design satisfies |
|-------|-------------|---------------------------|
| 2 Checkout | Line items need SKU + price | Each variant retains original CSV SKU and price |
| 3 CMS | Editorial product source | Parent + variant model matches Sanity → Supabase sync pattern |
| 5 Inventory | Stock per SKU | `product_variants.stock_quantity` / `in_stock` ready for CSV or admin updates |
| 6 Shipping | Weight/dimensions per SKU | Imported to specs/attributes from CSV shipping columns |
| 7 Scale | 10k+ SKUs, LCP targets | Pagination, JSON search index, fewer PDPs via grouping |

---

## 9. Error Handling & Import Report

`catalog:build` emits a summary:

```
Active rows parsed:     2746
Products created:       ~1200 (est.)
Variants created:       ~469 (est.)
Categories created:     ~N
Unmapped tag paths:     [list]
Duplicate slug fixes:   [list]
Grouping warnings:      [same groupKey, same colour]
```

**Build fails when:**

- Duplicate product slugs after dedupe
- Duplicate variant SKUs
- Zero active products parsed
- Invalid price (NaN or negative)

**Build warns (non-blocking) when:**

- Tag path cannot map to a pillar
- Product has zero images
- Group shares groupKey but identical Colour values

---

## 10. Testing

### Unit (Vitest)

- Price conversion (dollars → cents, rounding)
- Tag path → category tree
- Grouping: colour family merges; single/double basin stays separate
- Slug deduplication
- Override file forceGroup / forceStandalone

### E2E (Playwright)

- Category PLP renders paginated grid with real product count
- PDP: gallery, specs accordion, variant picker when variants exist
- Mega-menu links resolve (no 404)
- Search returns results for known SKU

### CI

- Add `catalog:validate` to PR checks when CSV or transform scripts change
- Lighthouse product template still ≥ 90 after pagination

---

## 11. File Structure (deliverable)

```
scripts/catalog/
  transform.ts           # CSV → normalized catalog model
  export-json.ts         # Write public/data/catalog/*.json
  export-sql.ts          # Write supabase/seed_catalog.sql
  product-groups.json    # Manual overrides
  types.ts               # Normalized intermediate types
  __tests__/             # Grouping, mapping unit tests

public/data/catalog/
  products.json          # Generated (git-tracked or gitignored — see note)
  categories.json
  search-index.json

lib/catalog/
  loader.ts              # JSON / Supabase unified read

supabase/
  seed_catalog.sql       # Generated seed for active catalog
```

**Note:** Generated JSON may be git-tracked initially so Vercel preview works without a build step; switch to build-time generation in CI once `catalog:build` is wired into `npm run build`.

---

## 12. Implementation Order

1. Transform types + CSV parser + field mappers
2. Category tree generator + collection tag extractor
3. Grouping heuristics + override file support
4. JSON exporter + loader integration
5. Supabase SQL exporter
6. `next.config.ts` Shopify image host
7. PLP pagination (category, collection, search)
8. PDP HTML description + gallery scroll
9. Mega-menu + mobile nav updates
10. Tests + CI validation script

---

## 13. Open Items (resolved)

| Item | Resolution |
|------|------------|
| Data layer | JSON + Supabase (§2) |
| Grouping strategy | Hybrid heuristic + overrides (§6) |
| Category depth | Hybrid tree + curated mega-menu (§5) |
| Active scope | Active rows only (§2) |

No unresolved TBDs remain for implementation planning.
