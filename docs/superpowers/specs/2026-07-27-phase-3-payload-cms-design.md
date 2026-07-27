# Phase 3 — Payload CMS & Minimal CRM — Design Specification

**Date:** 2026-07-27  
**Status:** Draft — pending user review  
**Project:** DavidEcomm (BDK Supply storefront)  
**Related:**
- [Infrastructure & CI Design](./2026-07-18-davidecomm-infra-ci-design.md)
- [Homepage Catalog-Driven Design](./2026-07-26-homepage-catalog-driven-design.md)
- [Checkout & Stripe Design](./2026-07-26-checkout-stripe-design.md)
- [BDK Catalog Integration Design](./2026-07-26-bdk-catalog-integration-design.md)

**Replaces:** Sanity CMS references in the infra spec for Phase 3. Payload is the selected CMS (100% open source, embedded in Next.js, Postgres-backed).

---

## 1. Problem

BDK Supply needs non-developer control of homepage merchandising (heroes, collection cards, promo banner, inspiration images, product carousels) without code deploys. Phase 1 ships homepage content via build-time `homepage.json`; Phase 2 adds orders in Supabase. Phase 3 must:

1. Let staff edit homepage content and product carousel picks from an admin UI.
2. Keep the product catalog on the existing CSV → JSON pipeline (~2,744 SKUs).
3. Provide minimal order visibility for a solo operator.
4. Stay fully open source with no third-party content cloud (Sanity rejected in favour of Payload).
5. Add CI gates without breaking PRs that lack a database.

**Non-goals (v1):** product editing in CMS, blog/landing pages, PostHog widgets in admin, support notes, customer auth (Phase 4), refunds (Phase 7).

---

## 2. Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CMS platform | **Payload 3** (embedded in Next.js) | OSS, TypeScript-native, same Postgres as Supabase, no sync webhook |
| Catalog source | **Unchanged** — CSV → `catalog:build` → JSON (`CATALOG_SOURCE=auto`) | Bulk supplier updates stay in pipeline; solo operator does not hand-edit 2,744 SKUs |
| CMS scope | Homepage merchandising + product carousel config | Matches business need; keeps Payload schema small |
| CRM scope | Read-only `/admin/orders` | Solo operator needs order visibility, not full CRM |
| Admin routes | `/cms` (Payload), `/admin` (CRM) | Avoid route collision |
| Auth (v1) | Payload login for `/cms`; cookie session for `/admin` | Temporary; unified Supabase Auth in Phase 4 |
| Media storage | Supabase Storage (S3-compatible adapter) | Vercel filesystem is ephemeral |
| Runtime reads | Payload Local API in server components | No HTTP round-trip; `unstable_cache` with tags |
| Fallback chain | Payload → `homepage.json` → Supabase `homepage_*` → mock | Storefront never 500s from CMS outage |

---

## 3. Architecture

### 3.1 System diagram

```
┌─────────────────────────────────────────────────────────┐
│              Next.js app (single Vercel deploy)          │
│                                                          │
│  /cms (Payload admin) ──► Payload Local API              │
│         │                        │                       │
│         │                        ▼                       │
│         │              Supabase Postgres                 │
│         │              ├── payload_* tables (CMS)        │
│         │              ├── orders, carts (Phase 2)       │
│         │              └── products (seed only)          │
│         │                                                │
│  Storefront ──► lib/homepage.ts ──► Payload Local API  │
│              └── lib/products.ts ──► JSON catalog      │
│                                                          │
│  /admin/orders ──► Supabase service role (CRM)          │
└─────────────────────────────────────────────────────────┘

CSV catalog:build ──► public/data/catalog/*.json (unchanged)
```

### 3.2 Feature flags

Add to `lib/config/features.ts`:

| Flag | Default (prod until launch) | When true |
|------|----------------------------|-----------|
| `ENABLE_CMS` | `false` | Payload is homepage source of truth |
| `ENABLE_ADMIN` | `false` | `/admin/orders` routes active |

Existing flags unchanged: `ENABLE_CHECKOUT`, `CATALOG_SOURCE=auto`, etc.

### 3.3 Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `PAYLOAD_SECRET` | Server only | Payload encryption (32+ chars) |
| `DATABASE_URL` | Server only | Supabase Postgres (transaction pooler, port 6543) |
| `ENABLE_CMS` | Vercel env | Gate Payload homepage reads |
| `ENABLE_ADMIN` | Vercel env | Gate CRM routes |
| `ADMIN_PASSWORD` | Server only | Shared password for `/admin/login` |
| `ADMIN_SESSION_SECRET` | Server only | Signs admin session cookie |
| Supabase Storage S3 keys | Server only | Media uploads via `@payloadcms/storage-s3` |

**Removed from Phase 3:** `SANITY_API_TOKEN`, Sanity project/dataset vars.

### 3.4 Database coexistence

Payload adds Drizzle-managed tables (`payload_*`, `media`, etc.) to the **same Supabase Postgres** project. Existing tables (`products`, `orders`, `homepage_*`) are untouched. Payload migrations live in `src/migrations/` (or `payload-migrations/`). Use Supabase transaction pooler (`?pgbouncer=true`) on Vercel to avoid connection exhaustion.

Legacy `homepage_*` Supabase tables remain as fallback only; Payload is source of truth when `ENABLE_CMS=true`. Deprecate table writes in a later cleanup PR.

---

## 4. Payload Content Model

### 4.1 Collections

#### `users` (built-in)

Payload admin accounts for `/cms`. Roles: `admin` only in v1. Separate from Phase 4 customer `auth.users`.

#### `media`

| Field | Type | Notes |
|-------|------|-------|
| `alt` | text | Required for accessibility |
| `file` | upload | Images only (webp, jpg, png) |

Stored in Supabase Storage bucket `cms-media` (public read). Existing Shopify CDN URLs use plain `externalImageUrl` text fields — no re-upload required.

### 4.2 Global: `homepage`

Single document — one place to edit the entire homepage.

| Section | Type | Maps to |
|---------|------|---------|
| `heroes` | array (max 5) | `HomepageHero[]` |
| `collections` | array (max 6) | `HomepageCollection[]` |
| `promo` | group | `HomepagePromo` |
| `inspiration` | array (max 8) | `InspirationImage[]` |
| `categoryShortcuts` | array | `CategoryShortcut[]` |
| `productCarousels` | array (max 4) | `ProductCarouselConfig[]` (new) |

#### Hero slide fields

`headline` (required), `subheadline`, `ctaText`, `ctaHref`, `image` (upload → media), `externalImageUrl` (fallback), `active` (default true).

#### Collection card fields

`name`, `slug` (links to `/collections/{slug}`), `description`, `ctaText`, `image`, `externalImageUrl`.

#### Promo banner fields

`eyebrow`, `headline` (required), `subtext`, `ctaText`, `ctaHref`, `image`, `externalImageUrl`, `active`.

#### Inspiration tile fields

`image`, `externalImageUrl`, `altText` (required), `active`.

#### Category shortcut fields

`slug` (category slug), `iconKey` (select matching `iconMap` in `category-icon-grid.tsx`).

#### Product carousel fields

| Field | Type | Notes |
|-------|------|-------|
| `key` | select | `featured`, `best-sellers`, `new-arrivals` |
| `title` | text | Section heading |
| `subtitle` | textarea | Section subheading |
| `viewAllHref` | text | "View all" link |
| `ctaLabel` | text | Default: "View collection" |
| `selectionMode` | select | `collection`, `manual`, `rule` |
| `collectionSlug` | text | When mode = `collection` |
| `productSlugs` | array of text | When mode = `manual` |
| `sort` | select | `featured`, `newest`, `price-asc`, `price-desc` (mode = `rule`) |
| `limit` | number | 1–12, default 4 |
| `active` | checkbox | Default true |

### 4.3 Mapper layer (`lib/homepage/payload.ts`)

Converts Payload global → existing storefront types. **No component changes.**

```ts
mapHero(slide)       → HomepageHero
mapCollection(card)  → HomepageCollection
mapPromo(promo)      → HomepagePromo
mapInspiration(img)  → InspirationImage
mapCarousel(config)  → ProductCarouselConfig
```

**Image resolution:** uploaded `media.url` first; else `externalImageUrl`. Admin validation rejects entries with neither.

Payload generates `payload-types.ts` at build. Mapper imports Payload types and outputs `lib/supabase/types` shapes.

### 4.4 Seed migration

`scripts/cms/seed-homepage.ts` imports current `public/data/catalog/homepage.json` into the Payload `homepage` global. Run once when enabling CMS in staging/production. Category shortcuts seed from existing `CATEGORY_SHORTCUTS` in `scripts/catalog/homepage.ts`.

**v2 enhancement:** custom Payload field component to search products by name and write slugs (reads JSON catalog at dev time). Not in v1.

---

## 5. Data Layer & Revalidation

### 5.1 Read priority (`lib/homepage.ts`)

```
getHeroes() / getCollections() / etc.
        │
        ▼
  isCmsEnabled() && DATABASE_URL?
        │ yes
        ▼
  getCachedHomepage()  ──► Payload Local API ──► mapper
        │ miss / error
        ▼
  getHomepageManifest()  (homepage.json)
        │ miss
        ▼
  Supabase homepage_* tables (legacy)
        │ miss
        ▼
  mock data (lib/mock/data.ts)
```

All getters share one cached fetch — one DB round-trip per request.

### 5.2 Caching

```ts
export const getCachedHomepage = unstable_cache(
  async () => { /* Payload findGlobal + map */ },
  ["homepage-cms"],
  { tags: ["homepage"], revalidate: 60 },
);
```

Matches `export const revalidate = 60` on `app/(storefront)/page.tsx`.

### 5.3 Product carousel resolution (`lib/homepage/resolve-carousel.ts`)

| `selectionMode` | Behaviour |
|-----------------|-----------|
| `collection` | `getProducts({ collection: collectionSlug, limit, sort })` |
| `manual` | Resolve products by slug list, preserve CMS order |
| `rule` | `getProducts({ limit, sort })` |

**Fallback:** when `productCarousels` is empty, use current hardcoded defaults in `page.tsx` so a fresh Payload install does not break the homepage.

### 5.4 Revalidation hooks

Payload `afterChange` on `homepage` global:

```ts
revalidateTag("homepage");
revalidatePath("/");
```

| Event | Action |
|-------|--------|
| Save homepage in `/cms` | On-demand revalidation |
| Upload media (v1) | Revalidate homepage (simple; acceptable for solo operator) |
| `catalog:build` | Unaffected — products from JSON |

**SLA:** homepage reflects CMS edits immediately on save, or within 60s ISR window.

### 5.5 Error handling

| Scenario | Behaviour |
|----------|-----------|
| Payload DB unreachable | Log error; fall back to `homepage.json` → mock |
| Global empty / not seeded | Fall back to JSON manifest |
| Invalid product slug in carousel | Skip product; warn in dev |
| Missing image | Skip slide/card; admin validation prevents publish |
| `ENABLE_CMS=true` without `DATABASE_URL` | CI build fails with clear error |

Fail **open** on storefront reads; fail **closed** on admin writes.

### 5.6 Payload + Next.js integration

| Piece | Location |
|-------|----------|
| `payload.config.ts` | Repo root |
| `payload/collections/` | `users`, `media` |
| `payload/globals/` | `homepage` |
| `payload/hooks/` | `revalidateHomepage.ts` |
| `app/(payload)/cms/[[...segments]]/page.tsx` | Admin UI at `/cms` |
| `app/(payload)/api/[...slug]/route.ts` | Payload REST API |
| `next.config.ts` | `withPayload()` wrapper |

---

## 6. Minimal CRM (`/admin/orders`)

### 6.1 Routes

| Route | Purpose |
|-------|---------|
| `/admin` | Redirect → `/admin/orders` |
| `/admin/login` | Password form (public) |
| `/admin/orders` | Paginated order list |
| `/admin/orders/[id]` | Order detail (read-only) |

### 6.2 Auth (temporary, pre–Phase 4)

`ADMIN_PASSWORD` → signed httpOnly cookie via `lib/admin/auth.ts`. Middleware protects `/admin/*` except `/admin/login`. Phase 4 replaces with Supabase Auth + `profiles.role = 'admin'`.

### 6.3 Order list

Columns: order ID (short), date, guest email, status, total (AUD). Status filter tabs: All, Paid, Pending, Failed. Highlight `pending` orders older than 1 hour (dead letter). Search by email substring. 25 per page, newest first.

### 6.4 Order detail

Reuses `lib/checkout/get-order.ts` patterns: customer contact, shipping address, line items, totals, Stripe Payment Intent dashboard link. **Read-only** — no refunds or status changes in v1.

### 6.5 Data access

`lib/admin/orders.ts` queries via `createServiceClient()` (service role). No RLS changes.

### 6.6 UI

Server-rendered tables using existing design tokens. `app/admin/layout.tsx` includes link to `/cms` ("Edit homepage").

---

## 7. CI & Testing

### 7.1 Additive CI jobs

| Job | Trigger | Checks |
|-----|---------|--------|
| `cms-migrate` | PR + push | `payload migrate` against CI Postgres |
| `cms-build` | PR + push | Build with `ENABLE_CMS=true` + test `DATABASE_URL` |
| `test-admin-auth` | PR + push | `GET /admin/orders` without cookie → 302 login |
| `test-homepage-cms` | PR + push | Vitest mapper + carousel resolver tests |

Existing `lint`, `typecheck`, `test`, `build`, `e2e` unchanged. Default `build` keeps `ENABLE_CMS=false` so PRs without DB pass.

### 7.2 Unit tests (`tests/unit/cms/`)

| File | Coverage |
|------|----------|
| `homepage-mapper.test.ts` | Payload shape → storefront types |
| `resolve-carousel.test.ts` | collection / manual / rule modes |
| `features.test.ts` | `isCmsEnabled()`, `isAdminEnabled()` |

Fixtures only — no live DB in unit tests.

### 7.3 E2E (`tests/e2e/admin.spec.ts`)

1. Unauthenticated `/admin/orders` → redirect to login.
2. Login with `ADMIN_PASSWORD` → orders page renders (or empty state).

Skipped when `ENABLE_ADMIN=false` in CI (same pattern as checkout flag).

### 7.4 Environment matrix

| Environment | `ENABLE_CMS` | `ENABLE_ADMIN` | Database |
|-------------|--------------|----------------|----------|
| Local (default) | `false` | `false` | None |
| Local (CMS dev) | `true` | `true` | Supabase staging |
| CI (default) | `false` | `false` | None |
| CI (`cms-*` jobs) | `true` | `true` | Postgres service container |
| Preview | `true` | `true` | Supabase staging |
| Production | `true` | `true` | Supabase production |

### 7.5 New npm scripts

```json
{
  "cms:migrate": "payload migrate",
  "cms:seed": "tsx scripts/cms/seed-homepage.ts",
  "generate:types": "payload generate:types"
}
```

---

## 8. Phase 3 Exit Criteria

- [ ] Homepage content editable at `/cms` without code deploy
- [ ] Homepage reflects CMS changes on save (or within 60s ISR)
- [ ] Product carousels configurable (collection, manual slugs, sort rule)
- [ ] `/admin/orders` lists and shows order detail when `ENABLE_ADMIN=true`
- [ ] Unauthenticated admin access blocked (CI test passes)
- [ ] `payload migrate` runs clean in CI
- [ ] Catalog still loads from JSON (`CATALOG_SOURCE=auto` unchanged)
- [ ] No Sanity dependencies or environment variables
- [ ] Infra spec updated to reference Payload instead of Sanity

---

## 9. Delivery Order (solo operator)

1. **3a — Payload CMS:** install Payload, schemas, media storage, mapper, `lib/homepage.ts` priority chain, revalidation hooks, seed script.
2. **3b — CRM slice:** `/admin/orders` + cookie auth middleware.
3. **3c — CI:** migrate job, mapper tests, admin auth test, update infra spec references.

---

## 10. Infra Spec Amendments

When implementing, update `2026-07-18-davidecomm-infra-ci-design.md`:

| Section | Change |
|---------|--------|
| Stack table | Sanity → Payload CMS (embedded Next.js) |
| Architecture diagram | Remove Sanity cloud; Payload inside Vercel box |
| Phase 3 infrastructure | Remove Sanity webhook sync; add Payload migrations |
| Secrets table | Replace `SANITY_API_TOKEN` with `PAYLOAD_SECRET`, `DATABASE_URL` |
| CI gates | `test-cms-sync` → `cms-migrate` + mapper unit tests |
| CMS data strategy | Payload Local API reads; Supabase for orders/stock; no sync layer for homepage |

---

## 11. Future Extensions (post–v1)

| Feature | Phase | Notes |
|---------|-------|-------|
| Product overrides in Payload | Phase 3+ | Editorial fields overlay CSV catalog |
| Unified auth (CMS + admin) | Phase 4 | Supabase Auth replaces cookie + Payload users |
| Blog / landing pages | Phase 3+ | New Payload collections |
| Slug 301 redirects | Phase 3+ | `url_redirects` table + Payload hook |
| Product search field in Studio | Phase 3 v2 | Custom field reading JSON catalog |
| Support notes | When needed | `support_notes` table from infra spec |

---

*Spec written 2026-07-27 — Phase 3 Payload CMS & Minimal CRM*
