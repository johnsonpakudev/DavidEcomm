# Product Policies — Consideration Spec

**Date:** 2026-07-24  
**Status:** Consideration — not implemented  
**Related:** [Product Detail Data Model](./2026-07-24-product-detail-data-model.md), [Infrastructure & CI Design](./2026-07-18-davidecomm-infra-ci-design.md)

---

## Purpose

Premium fixture PDPs (e.g. The Blue Space reference) include accordion sections for **Specifications**, **Shipping**, and **Returns & Warranties**. Specifications are implemented via `product_specifications`. This document captures options for **product policies** content — shipping, returns, warranties, and related legal/operational copy — before committing to a schema or CMS approach.

---

## Requirements

| Policy type | Typical content | Scope |
|-------------|-----------------|-------|
| **Shipping** | Delivery times, free-shipping thresholds, metro vs regional, bulky goods surcharges | Site-wide default; optional per-category overrides |
| **Returns** | Return window, condition requirements, restocking fees, how to initiate | Site-wide default |
| **Warranties** | Manufacturer vs retailer warranty, claim process, exclusions | Per product or per brand |
| **Price match** | Eligibility, proof required, exclusions | Site-wide trust badge + detail page |
| **Lead times** | Made-to-order, back-order messaging | Per product or variant |

Policies appear in PDP accordions below the fold and may link to standalone policy pages (`/shipping`, `/returns`).

---

## Approach Options

### Option A — Static policy pages only (recommended for Phase 1.5)

- Store copy in markdown/MDX files or a `policy_pages` table with slug + body.
- PDP accordions link to `/shipping`, `/returns` or embed a short summary + "Read full policy" link.
- **Pros:** Simple, no per-product maintenance, legal copy updated in one place.
- **Cons:** Cannot vary shipping copy per SKU without code deploy.

**Best for:** Launch catalog with consistent AU-wide shipping/returns.

---

### Option B — Site-wide policies with product overrides

```text
policy_documents
  id, slug, title, body (markdown), updated_at

product_policy_overrides
  product_id, policy_slug, body (markdown)  -- nullable = use site default
```

- PDP accordion resolves: override → site default → fallback static copy.
- **Pros:** Handles warranty differences per brand without CMS complexity.
- **Cons:** Two tables; admin UI needed in Phase 3.

**Best for:** Mixed catalogue (some items made-to-order, some clearance).

---

### Option C — CMS-managed (Phase 3 alignment)

- Sanity document type `policy` referenced from product or category.
- Editorial team edits policy blocks; sync to Supabase or fetch at build time.
- **Pros:** Client self-service; supports rich formatting and versioning.
- **Cons:** Depends on Sanity rollout; overkill before CMS phase.

**Best for:** Post-Phase 3 when marketing team owns content.

---

### Option D — Embed in `product_specifications`

- Add rows with `group_name = 'Shipping'` or `'Returns'`.
- **Pros:** Zero new tables.
- **Cons:** Long HTML in value fields; duplicated across products; poor for legal updates.

**Not recommended** except as a one-off import shortcut.

---

## Recommendation

| Phase | Approach |
|-------|----------|
| **Now (1.5)** | **Option A** — static `/shipping` and `/returns` pages; PDP shows Specifications accordion only; policy accordions show 2–3 line summary + link |
| **Phase 3** | **Option B or C** — admin or Sanity manages overrides |
| **Phase 6** | Integrate live shipping rates and tax; policy copy references calculated thresholds |

---

## PDP Accordion Behaviour (target)

| Accordion | Phase 1.5 | Later |
|-----------|-----------|-------|
| Specifications | `product_specifications` table | Same |
| Shipping | Static summary + link to `/shipping` | Dynamic threshold from `site_config` or shipping engine |
| Returns & Warranties | Static summary + link to `/returns` | Per-brand override from `product_policy_overrides` |

---

## `site_config` extensions (lightweight interim)

Before a full policy schema, extend `site_config` with optional fields:

| Field | Example |
|-------|---------|
| `shipping_summary` | "Free shipping Australia wide on orders over $150." |
| `returns_summary` | "30-day change-of-mind returns on unused items." |
| `warranty_summary` | "Manufacturer warranties apply. See product specifications." |

PDP accordions read these for Shipping / Returns until per-product overrides exist.

**No migration in this PR** — documented here for next iteration.

---

## Content the client must supply

Before policy accordions go live, collect:

1. **Shipping policy** — carriers, timeframes, free-shipping threshold, bulky goods rules, PO box restrictions.
2. **Returns policy** — window, condition, refund method, who pays return freight.
3. **Warranty policy** — retailer vs manufacturer responsibility, how to claim.
4. **Price match** — if offered, terms and exclusions.
5. **Special categories** — made-to-order tapware, custom vanities, clearance "final sale" rules.

---

## Open Questions

1. Does BDK Supply offer **price matching**? (Reference competitor shows a badge.)
2. Are any products **made-to-order** with extended lead times?
3. Should **warranty** vary by supplier brand (MEIR, etc.)?
4. Will policies differ for **trade/B2B** accounts (Phase 4+)?

---

## Decision Log

| Date | Decision |
|------|----------|
| 2026-07-24 | Implement variants, specifications, relations, reviews. **Defer** product policies to this consideration spec. |
