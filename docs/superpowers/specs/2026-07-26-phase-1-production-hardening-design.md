# Phase 1 Production Hardening — Design Specification

**Date:** 2026-07-26  
**Status:** Approved — 2026-07-26 (default decisions applied)  
**Project:** DavidEcomm (BDK Supply storefront)  
**Related:**
- [Infrastructure & CI Design](./2026-07-18-davidecomm-infra-ci-design.md)
- [BDK Catalog Integration Design](./2026-07-26-bdk-catalog-integration-design.md)
- [Homepage Catalog-Driven Design](./2026-07-26-homepage-catalog-driven-design.md)

---

## 1. Goal

Make the **live Vercel storefront production-ready for Phase 1 exit criteria**: reliable catalog browsing, correct SEO/metadata, clean navigation, and a verified path to Phase 2 checkout — without enabling payments yet.

**Not in scope:** Stripe go-live, checkout flag enablement, Sanity CMS, customer accounts (Phases 2–4).

---

## 2. Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Production catalog source | **JSON-first** (`CATALOG_SOURCE=auto`) | Already working on Vercel; zero DB dependency for reads; fastest path to stable launch |
| Supabase in Phase 1 | Provision + migrate; seed optional until Phase 2 | Checkout and orders need Supabase; catalog browse does not |
| Category strategy | **Curate mega-menu** + filter noisy tags at build time | 406 raw categories remain for PLP; nav shows ~3 pillars + curated children only |
| Domain | Vercel URL now; custom domain documented as optional follow-up | `david-ecomm-johnson-dev1.vercel.app` is current production URL |
| Analytics | Enable PostHog in production when key available | Phase 1 exit criteria include product click/view events |

---

## 3. Current State vs Target

| Area | Current | Target |
|------|---------|--------|
| Homepage | Catalog-driven manifest + Unsplash inspiration | ✅ Done |
| Product catalog | 2,744 products via JSON | ✅ Done |
| Best sellers / category grid | Fixed in PR #2 | ✅ Done |
| Mega-menu | 42 `show_in_mega_menu` items incl. noise | ≤15 curated items per pillar |
| Category tree | Duplicate top-level tags (`Bathroom;Bathroom`) | Filtered at build; no duplicate nav entries |
| Vercel env | Partial / defaults | All Phase 1 vars set |
| Supabase prod | Project exists; catalog may be unseeded | Migrations applied; seed deferred or smoke-seeded |
| Custom domain | Not wired | Optional checklist item |
| Checkout | Built, flag off | Remains off until Phase 2 launch |

---

## 4. Architecture

### 4.1 Production data flow (JSON-first)

```
BDK CSV export
     ↓
npm run catalog:build
     ↓
public/data/catalog/
  products.json | categories.json | homepage.json | search-index.json
     ↓
Vercel deployment (CATALOG_SOURCE=auto)
     ↓
lib/products.ts + lib/categories.ts + lib/homepage.ts
     ↓
Storefront (ISR, revalidate 60s)
```

Supabase is **not** on the hot path for catalog reads in Phase 1 production. It is prepared for Phase 2 (`orders`, `carts`, webhooks).

### 4.2 Category curation (build-time)

Extend `scripts/catalog/categories.ts`:

1. **Filter collection-only tags** — already excluded from category paths
2. **Reject malformed root tags** — skip tags containing `;` at root level (Shopify export artefact)
3. **Curate mega-menu** — only categories under the three `nav_pillar` roots with `depth <= 2` AND matching an allowlist of slug prefixes:
   - `bathroom-*` (top subcategories: vanities, toilets, tapware, showers, basins)
   - `doors-hardware-*` (entrance doors, handles & locks, hardware)
   - `kitchen-laundry-*` (sinks, laundry tubs, tapware)
4. **Set `mega_menu_image`** — first product image from that category when available (optional enhancement)

PLP routes for all 406 categories remain unchanged; only navigation is curated.

### 4.3 Vercel environment (production)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://david-ecomm-johnson-dev1.vercel.app` |
| `CATALOG_SOURCE` | `auto` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `ANALYTICS_ENABLED` | `true` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key |
| `ENABLE_CHECKOUT` | `false` |
| `NEXT_PUBLIC_ENABLE_CHECKOUT` | `false` |

Preview environments mirror production except Stripe keys use test mode when Phase 2 testing begins.

---

## 5. Implementation Tasks

### 5.1 Category build cleanup
- Add malformed-tag filter in `categoryPathsFromTag` or `buildCategoryTree`
- Add `MEGA_MENU_SLUG_ALLOWLIST` for curated nav
- Regenerate `categories.json` via `catalog:build`
- Update unit tests in `tests/unit/catalog/categories.test.ts` to match real BDK slugs

### 5.2 Mega-menu component
- `MegaMenu` reads only `show_in_mega_menu === true` categories (already does)
- Verify three pillars render with ≤6 children each after curation

### 5.3 Production verification script (optional)
- Add `scripts/verify-production.mjs` — checks homepage has no broken category links, sample PDPs return 200, sitemap lists products

### 5.4 Documentation
- Add production launch checklist to this spec (Section 7)
- Update README with Vercel env setup steps

### 5.5 Supabase prep (no catalog cutover)
- Apply migrations `001`–`005` on production project
- Do **not** set `CATALOG_SOURCE=supabase` until Phase 2 requires it
- Optional: run `npm run catalog:seed` so Phase 2 checkout tests against real SKUs

---

## 6. Testing

| Test | Pass criteria |
|------|---------------|
| `npm run catalog:build` | Zero errors; warnings only for known missing bestseller patterns |
| `npm run test` | All catalog + homepage unit tests pass |
| `npm run build` | Production build succeeds |
| Manual: homepage | Hero, collections, category grid, inspiration render |
| Manual: mega-menu | 3 pillars, no `Bathroom;Bathroom` entries |
| Manual: PDP sample | 5 random products — images, price, JSON-LD |
| Manual: search | Known SKU returns result |
| Lighthouse (mobile) | Performance ≥ 90 on PDP template |

---

## 7. Production Launch Checklist

See user-facing checklist in project README or run through Section 7 items during go-live.

---

## 8. Exit Criteria (Phase 1 Complete)

- [ ] Vercel production env vars configured
- [ ] Storefront serves 2,744+ products with images on all key pages
- [ ] Mega-menu curated (no duplicate/noise categories)
- [ ] Homepage manifest live (no Unsplash on heroes/collections; inspiration gallery OK)
- [ ] Sitemap, robots.txt, JSON-LD valid
- [ ] PostHog receiving `product_click` / pageview events
- [ ] Checkout remains disabled in production
- [ ] Supabase migrations applied (ready for Phase 2)
- [ ] CI green on `main`

---

## 9. What Comes After (Phase 2 Preview)

1. Stripe test-mode E2E checkout on preview
2. `npm run catalog:seed` → Supabase production
3. Enable `ENABLE_CHECKOUT=true`
4. Stripe live keys + webhook URL on production
5. First real order test

---

*Spec written 2026-07-26 — Phase 1 Production Hardening*
