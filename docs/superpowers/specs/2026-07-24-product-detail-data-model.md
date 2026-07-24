# Product Detail Data Model

**Date:** 2026-07-24  
**Status:** Implemented (migration `003_product_detail_extensions.sql`)  
**Related:** [Product Policies Consideration](./2026-07-24-product-policies-consideration.md), [Infrastructure & CI Design](./2026-07-18-davidecomm-infra-ci-design.md)

---

## Overview

Extends the Phase 1 catalog schema to support premium product detail pages (PDP) comparable to high-end fixture retailers — finish swatches, structured specifications, curated merchandising, and customer reviews.

**Product policies** (shipping, returns, warranties accordion content) are **not** implemented in this migration. See the [policies consideration spec](./2026-07-24-product-policies-consideration.md).

---

## Entity Relationship

```
categories
    └── products
            ├── product_images
            ├── product_variants
            ├── product_specifications
            ├── product_reviews
            └── product_relations ──► products (related)
```

---

## Tables

### `product_variants`

Sellable options for a parent product (finish, size, colour).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `product_id` | uuid | FK → `products` |
| `sku` | text | Unique per variant |
| `name` | text | Display label, e.g. "Brushed Gold" |
| `option_type` | text | e.g. `finish`, `size` |
| `option_value` | text | Normalised value |
| `price` | integer | AUD cents; null inherits parent `products.price` |
| `compare_at_price` | integer | Optional was-price for sales |
| `image_url` | text | Variant-specific hero image |
| `swatch_color` | text | Hex for colour swatch UI |
| `stock_quantity` | integer | Per-variant stock (Phase 5 hooks here) |
| `in_stock` | boolean | |
| `is_default` | boolean | Pre-selected on PDP load |
| `sort_order` | integer | Swatch display order |
| `active` | boolean | |

**Import columns:** `parent_sku`, `variant_sku`, `finish`, `price`, `swatch_hex`, `image_url`, `stock`

---

### `product_specifications`

Structured key/value specs for the Specifications accordion.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `product_id` | uuid | FK → `products` |
| `group_name` | text | Optional grouping: General, Dimensions, Warranty |
| `label` | text | e.g. "WELS rating" |
| `value` | text | e.g. "5 star / 5.5L per min" |
| `sort_order` | integer | |

Replaces overloading `products.attributes` jsonb for PDP accordion display. Legacy `attributes` may remain for search/filter facets.

**Import columns:** `sku`, `group`, `label`, `value`, `sort_order`

---

### `product_relations`

Curated merchandising links between products.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `product_id` | uuid | Source product |
| `related_product_id` | uuid | Target product |
| `relation_type` | enum | `related`, `cross_sell`, `upsell` |
| `sort_order` | integer | |

| Type | PDP section |
|------|-------------|
| `cross_sell` | "Often bought with" |
| `related` | "You may also like" |
| `upsell` | Premium alternatives (future) |

**Import columns:** `source_sku`, `related_sku`, `relation_type`, `sort_order`

---

### `product_reviews`

Customer reviews displayed on the PDP from **multiple sources**. Summary fields `products.rating` and `products.review_count` are denormalised and refreshed by a database trigger (only `published` + `include_in_rating` rows count).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `product_id` | uuid | FK → `products` |
| `rating` | integer | 1–5 |
| `title` | text | Optional headline |
| `body` | text | Review text |
| `author_name` | text | Display name |
| `verified_purchase` | boolean | Show "Verified buyer" badge (typically `native` only) |
| `published` | boolean | Moderation gate |
| `source` | enum | `native`, `import`, `google`, `trustpilot`, `yotpo`, `feefo`, `productreview`, `manual` |
| `external_id` | text | Source-system ID for dedup on re-import |
| `source_url` | text | Link to original review (Google, Trustpilot, etc.) |
| `imported_at` | timestamptz | When review was synced/imported |
| `author_location` | text | Optional city/state |
| `locale` | text | Default `en-AU` |
| `include_in_rating` | boolean | Display review but exclude from aggregate if `false` |
| `created_at` | timestamptz | Original review date |

**Deduplication:** unique on `(source, external_id)` when `external_id` is set.

| Source | When to use |
|--------|-------------|
| `native` | Post-purchase reviews on BDK Supply (Phase 4) |
| `import` | Bulk CSV / spreadsheet import |
| `google` | Google Business / Maps reviews |
| `trustpilot` | Trustpilot syndication |
| `yotpo` | Yotpo API sync |
| `feefo` | Feefo import |
| `productreview` | productreview.com.au |
| `manual` | Admin-entered testimonials |

**Import columns:** `sku`, `source`, `external_id`, `rating`, `title`, `body`, `author_name`, `author_location`, `verified_purchase`, `source_url`, `review_date`, `include_in_rating`

Reviews are optional per product — products with no rows show the rating summary only (if set) or an empty state.

---

## RLS

All four tables have public `SELECT` policies scoped to active products (and `published` reviews, `active` variants). Writes are service-role only until Phase 3 admin routes exist.

---

## Seed Example

`supabase/seed_product_detail.sql` seeds the **Serra Brushed Brass Basin Mixer** with:

- 4 finish variants (Brass, Black, Chrome, Gold)
- 9 specification rows
- 2 cross-sells, 2 related products
- 3 published reviews

---

## CSV Import Template (client handoff)

| sheet | columns |
|-------|---------|
| products | sku, name, slug, price, category_slug, brand, description |
| variants | parent_sku, variant_sku, finish, price, swatch_hex, image_url |
| specifications | sku, group, label, value |
| relations | source_sku, related_sku, relation_type |
| reviews | sku, source, external_id, rating, title, body, author_name, author_location, verified, source_url, review_date |

---

## Deferred

- **Product policies** — shipping, returns, warranty accordion bodies → [consideration spec](./2026-07-24-product-policies-consideration.md)
- **Product content blocks** — long-form marketing sections with images (future migration)
- **Review submission** — customer write flow (Phase 4+ with auth)
