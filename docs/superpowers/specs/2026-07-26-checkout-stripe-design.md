# DavidEcomm — Checkout & Stripe Integration Design

**Date:** 2026-07-26  
**Status:** Approved — pending user review of written spec  
**Project:** DavidEcomm (BDK Supply storefront)  
**Phase:** 2 — Payment System  
**Parent spec:** [Infrastructure & CI Design](./2026-07-18-davidecomm-infra-ci-design.md)

---

## 1. Overview

Phase 2 enables end-to-end purchases on the BDK Supply storefront: shopping cart, custom on-site checkout with Stripe Payment Element, algorithmic shipping estimates charged upfront, guest checkout, order persistence in Supabase, and server-side order finalization via Stripe webhooks.

This design aligns with the seven-phase roadmap in the infrastructure spec. Phase 2 ships a complete purchase flow while laying schema and extension hooks for Phases 4–7 (auth, inventory, Stripe Tax, fulfillment emails, abandoned cart, returns).

### Goals

- Custom-branded checkout on-site (not Stripe-hosted Checkout).
- Guest checkout with email and AU shipping address required.
- Algorithmic estimated shipping charged upfront with clear customer disclaimer.
- Server-authoritative pricing — client cart is never trusted for payment amounts.
- Orders persisted in Supabase; Stripe webhook is the source of truth for payment status.
- Hybrid cart: instant client UX plus Supabase persistence for future phases.
- Feature-flagged behind `ENABLE_CHECKOUT` until production approval.

### Non-Goals (Phase 2)

- Stripe Tax (Phase 6).
- Stock reservation and oversell prevention (Phase 5).
- Customer authentication and order history (Phase 4).
- Shipping method selection — single estimated rate only (Phase 6 adds method picker).
- Transactional order emails (Phase 6 — Resend).
- Returns and refunds (Phase 7).
- Real-time carrier rate APIs (Phase 6 uses config-driven rates; carrier APIs out of scope).
- PayPal as a separate integration (Stripe Payment Element wallet support only).

### Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Checkout UX | Custom on-site, Stripe Payment Element | Matches infra spec; full BDK branding |
| Checkout layout | 3-step wizard | Room for Phase 6 tax + shipping method in Step 2 |
| Cart architecture | Hybrid (localStorage + Supabase sync) | Infra spec: "client state + optional Supabase persistence"; enables Phase 4 merge and Phase 7 abandoned cart |
| Payment API | PaymentIntent + Payment Element | Phase 5 stock reservation hooks into `create-payment-intent` |
| Shipping | Dimensional weight + package type + postcode zone | CSV has weight/dimensions/package type; accurate for bulky fixtures |
| Shipping charge | Upfront in Stripe total | Customer pays subtotal + estimate; disclaimer on confirmation |
| Shipping tables | `shipping_zones` + `shipping_rates` in Phase 2 | Phase 6 extends with Stripe Tax and method selection — no table rewrite |

---

## 2. Architecture

### System Flow

```
Browse → Add to Cart (React Context + localStorage)
       → debounced sync to Supabase carts (anonymous cookie)
       → /cart (review, edit qty, remove)
       → /checkout (3-step wizard)
           Step 1: contact + AU address
           Step 2: POST /api/shipping/estimate → review totals + disclaimer
           Step 3: POST /api/checkout/create-payment-intent → Stripe Payment Element
       → customer confirms payment
       → Stripe webhook payment_intent.succeeded
           → idempotent order update (status: paid)
           → server-side purchase analytics
       → /checkout/confirmation/[orderId]
```

### Component Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Cart (P2)  │────▶│ Checkout wizard  │────▶│ Stripe Payment  │
│ localStorage│     │ 3 steps          │     │ Element (P2)    │
│ + Supabase  │     │                  │     └────────┬────────┘
│ carts table │     │ Step 2 gains:    │              │
└─────────────┘     │  · methods (P6)  │              ▼
                    │  · Stripe Tax(P6)│     ┌─────────────────┐
                    │ create-intent:   │     │ Webhook → order │
                    │  · stock hold(P5)│     │ status: paid    │
                    └──────────────────┘     └─────────────────┘
```

### Future Phase Extension Points

| Phase | Hook location | What gets added |
|-------|---------------|-----------------|
| 4 | Checkout + middleware | Supabase Auth, guest order linking by email, cart `user_id` merge |
| 5 | `create-payment-intent` | 15-minute stock reservation, oversell prevention, reservation release on failure |
| 6 | Checkout Step 2 | Stripe Tax, shipping method picker, `fulfillment_status` workflow, Resend emails |
| 7 | `carts` table + cron | Abandoned cart email sequence, checkout rate limiting (Upstash Redis) |

### Stack Additions (Phase 2)

| Concern | Technology |
|---------|------------|
| Payments | Stripe Payment Element + PaymentIntents |
| Cart state | React Context, localStorage, Supabase `carts` / `cart_items` |
| Shipping | Server-side calculator + Supabase rate config |
| Order storage | Supabase `orders` / `order_items` |
| Webhooks | `POST /api/webhooks/stripe` with signature verification |

---

## 3. Data Model

### Migration: `005_checkout_stripe.sql`

#### Product shipping fields (additive)

```sql
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_length_cm numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_width_cm numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_height_cm numeric;
ALTER TABLE products ADD COLUMN IF NOT EXISTS package_type text
  CHECK (package_type IN ('envelope', 'carton', 'skid'));
```

Variant-level overrides (optional): same columns on `product_variants` if variant dimensions differ from base product. Calculator checks variant first, falls back to product.

#### Carts

```sql
CREATE TABLE carts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    text UNIQUE NOT NULL,       -- anonymous cookie; merged to user_id in Phase 4
  user_id       uuid REFERENCES auth.users(id),  -- nullable until Phase 4
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE cart_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id       uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id),
  variant_id    uuid REFERENCES product_variants(id),
  quantity      integer NOT NULL CHECK (quantity > 0),
  UNIQUE (cart_id, product_id, variant_id)
);
```

#### Orders (future-ready schema)

```sql
CREATE TABLE orders (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid REFERENCES auth.users(id),  -- nullable: guest checkout
  guest_email              text NOT NULL,
  guest_phone              text,
  stripe_payment_intent_id text UNIQUE,
  status                   text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  subtotal_cents           integer NOT NULL,
  shipping_cents           integer NOT NULL DEFAULT 0,
  tax_cents                integer DEFAULT 0,              -- Phase 6
  total_cents              integer NOT NULL,
  shipping_address         jsonb NOT NULL,
  shipping_method          text,                           -- Phase 6
  fulfillment_status       text DEFAULT 'paid'             -- Phase 6 workflow
    CHECK (fulfillment_status IN ('paid', 'processing', 'shipped', 'delivered')),
  shipping_zone            text,                           -- metro | regional | remote
  shipping_disclaimer      text NOT NULL DEFAULT
    'Shipping is estimated. Final cost confirmed before dispatch.',
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);

CREATE TABLE order_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id),
  variant_id    uuid REFERENCES product_variants(id),
  product_name  text NOT NULL,          -- snapshot at purchase
  variant_name  text,
  sku           text NOT NULL,
  quantity      integer NOT NULL CHECK (quantity > 0),
  unit_price    integer NOT NULL        -- cents at time of purchase
);
```

#### Shipping configuration (Phase 6 tables, used in Phase 2)

```sql
CREATE TABLE shipping_zones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,          -- e.g. Metro, Regional, Remote
  slug          text UNIQUE NOT NULL,   -- metro | regional | remote
  postcode_ranges jsonb NOT NULL,       -- [{ "from": "2000", "to": "2234" }, ...]
  countries     text[] DEFAULT '{AU}'
);

CREATE TABLE shipping_rates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id         uuid NOT NULL REFERENCES shipping_zones(id),
  package_type    text NOT NULL CHECK (package_type IN ('envelope', 'carton', 'skid')),
  min_weight_kg   numeric NOT NULL DEFAULT 0,
  max_weight_kg   numeric,              -- null = no upper limit
  rate_cents      integer NOT NULL,
  multi_item_surcharge_pct numeric DEFAULT 0  -- e.g. 15 for +15% on 2+ skid items
);
```

#### Indexes

```sql
CREATE INDEX orders_guest_email_idx ON orders(guest_email);
CREATE INDEX orders_stripe_pi_idx ON orders(stripe_payment_intent_id);
CREATE INDEX orders_status_created_idx ON orders(status, created_at DESC);
CREATE INDEX cart_items_cart_id_idx ON cart_items(cart_id);
```

#### RLS (Phase 2)

- `carts` / `cart_items`: service role for sync API; no public anon access in Phase 2.
- `orders` / `order_items`: service role only until Phase 4 RLS policies.
- `shipping_zones` / `shipping_rates`: public read for estimate API (or server-only via service role).

---

## 4. Shipping Estimate Algorithm

**Module:** `lib/shipping/estimate.ts`

### Inputs

Per cart line (server-fetched from Supabase):

- `weight_kg`
- `shipping_length_cm`, `shipping_width_cm`, `shipping_height_cm`
- `package_type` (`envelope` | `carton` | `skid`)

### Calculation Steps

1. **Billable weight per item:** `max(weight_kg, (L × W × H) / 5000)` — standard AU volumetric divisor (5000 cm³/kg).
2. **Package multiplier:** applied via rate lookup per package type (default multipliers: envelope 0.6×, carton 1.0×, skid 1.4× — stored in rate config, not hardcoded long-term).
3. **Cart aggregate:** sum billable weights across lines; freight class = largest `package_type` in cart.
4. **Zone lookup:** postcode → `shipping_zones.slug` (metro / regional / remote).
5. **Rate lookup:** match `shipping_rates` by zone + package type + weight bracket → `rate_cents`.
6. **Multi-item surcharge:** if cart has 2+ skid-class items, apply `multi_item_surcharge_pct` from rate row.

### Fallbacks

- Missing weight/dimensions on a product → use highest rate tier for that package type; log warning server-side.
- Postcode not matching any zone → reject with user-facing message: "We couldn't estimate shipping for this postcode. Please contact us."
- Inactive or deleted product in cart → remove line and return validation error.

### API

**`POST /api/shipping/estimate`**

Request:

```json
{
  "items": [{ "product_id": "uuid", "variant_id": "uuid|null", "quantity": 1 }],
  "postcode": "2000",
  "state": "NSW"
}
```

Response:

```json
{
  "subtotal_cents": 169242,
  "shipping_cents": 8900,
  "tax_cents": 0,
  "total_cents": 178142,
  "zone": "metro",
  "disclaimer": "Shipping is estimated. Final cost confirmed before dispatch."
}
```

Server always re-fetches product prices and shipping attributes from Supabase. Client-supplied prices are ignored.

### Phase 6 Extension

Same endpoint adds `tax_cents` via Stripe Tax and optional `shipping_methods[]` when `ENABLE_SHIPPING=true`. Checkout Step 2 UI gains method selection without changing the core calculator interface.

---

## 5. UI & Pages

### Cart — `/cart`

- Line items: thumbnail, name, variant label, unit price, quantity stepper, remove button.
- Summary sidebar: subtotal, note "Shipping calculated at checkout".
- Empty state with "Continue shopping" CTA (replaces Phase 1 placeholder).
- Gated by `ENABLE_CHECKOUT`.

### Checkout — `/checkout` (3-step wizard)

| Step | Fields / content | Primary action |
|------|------------------|----------------|
| **1 — Details** | Email, phone, address line 1, line 2, suburb, state, postcode | Continue → fetch shipping estimate |
| **2 — Review** | Line items, subtotal, estimated shipping, total, disclaimer | Continue to payment; "Create account" checkbox (disabled stub for Phase 4) |
| **3 — Payment** | Stripe Payment Element (cards, Apple Pay, Google Pay) | Place order |

Progress indicator at top. Back navigation preserves entered data. Mobile: one step visible at a time.

### Confirmation — `/checkout/confirmation/[orderId]`

- Order reference, guest email, line items, subtotal, shipping, total.
- Shipping address and estimated shipping disclaimer.
- Purchase JSON-LD on page.
- "Continue shopping" CTA.

### Global updates

- **PDP:** Enable "Add to cart" using selected variant; track `add_to_cart` analytics event.
- **Header:** Cart badge count from cart context (replaces hardcoded `0`).
- **Mini-cart drawer:** Out of scope for Phase 2 v1; badge + `/cart` link is sufficient.

### New components

```
components/cart/
  cart-provider.tsx       -- Context + localStorage + Supabase sync
  cart-line-item.tsx
  cart-summary.tsx

components/checkout/
  checkout-wizard.tsx     -- Step state machine
  shipping-form.tsx       -- AU address form with validation
  order-review.tsx
  payment-form.tsx        -- Stripe Elements wrapper
```

Styling follows existing BDK patterns: `gold-cta`, `site-shell`, `brand-eyebrow-dark`, `font-heading`.

---

## 6. Payment Flow

### Create Payment Intent

**`POST /api/checkout/create-payment-intent`**

1. Validate `ENABLE_CHECKOUT`.
2. Re-validate cart items against Supabase (prices, active status).
3. Re-run shipping estimate for submitted address (never trust Step 2 client totals).
4. Create `orders` row with `status: pending`.
5. Create `order_items` rows with price/name snapshots.
6. Create Stripe PaymentIntent for `total_cents` (AUD).
7. Return `{ clientSecret, orderId }`.

**Phase 5 extension:** insert stock reservation before step 6; release on payment failure or 15-minute timeout.

### Client confirmation

Step 3 loads Stripe Payment Element with `clientSecret`. Customer submits → `stripe.confirmPayment()`. On success, redirect to confirmation page. On failure, display Stripe error; cart preserved; order remains `pending`.

### Webhook

**`POST /api/webhooks/stripe`**

- Verify Stripe signature on every request.
- Handle `payment_intent.succeeded`:
  - Idempotency: skip if `stripe_payment_intent_id` already `paid`.
  - Update order `status` to `paid`.
  - Fire server-side `purchase` analytics event via `lib/analytics/track.ts`.
- Handle `payment_intent.payment_failed`:
  - Update order `status` to `failed`.
- Return 500 on processing errors so Stripe retries.

**Dead letter:** orders in `pending` > 1 hour flagged for admin review (Phase 3 CRM widget).

---

## 7. Cart Sync Strategy

### Client-first

- `CartProvider` wraps storefront layout.
- State: `{ items: CartItem[] }` with product_id, variant_id, quantity, cached display fields.
- Persist to `localStorage` key `bdk-cart` on every change.
- Hydrate from localStorage on mount.

### Supabase sync (debounced, 2s)

- Anonymous `session_id` cookie (`bdk_session`, httpOnly set by API route or client-generated UUID in cookie).
- `POST /api/cart/sync` upserts `carts` + `cart_items` via service role.
- Sync is best-effort; checkout always re-validates from live product data.
- Failures do not block add-to-cart UX.

### Phase 4 merge

When user logs in, merge anonymous cart into user cart by `session_id` → `user_id`. Defined in Phase 4 spec; schema ready in Phase 2.

---

## 8. Analytics

Extend `lib/analytics/events.ts`:

| Event | Phase | Trigger | Key properties |
|-------|-------|---------|----------------|
| `add_to_cart` | 2 | Add to cart click | `product_id`, `variant_id`, `quantity`, `cart_value` |
| `begin_checkout` | 2 | Checkout page load | `cart_value`, `item_count` |
| `purchase` | 2 | Webhook `payment_intent.succeeded` | `order_id`, `value`, `items[]` |

Rules (from infra spec):

- All tracking through `lib/analytics/track.ts`.
- `purchase` is server-side only from webhook handler.
- `ANALYTICS_ENABLED=false` in local dev and CI.

---

## 9. Environment Variables

Add to `.env.example`:

```
# Stripe (Phase 2)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Already present
ENABLE_CHECKOUT=false
```

Per-environment keys: test mode in preview/local, live mode in production (per infra spec secrets table).

---

## 10. Error Handling

| Scenario | Behavior |
|----------|----------|
| Card declined | Show Stripe error message; preserve cart; order stays `pending` |
| Webhook processing failure | Return 500; Stripe retries; log to Vercel |
| Duplicate webhook | Idempotent skip via `stripe_payment_intent_id` |
| Invalid postcode | Step 1 validation error with clear message |
| Missing product shipping data | Highest rate tier fallback + server log |
| Product deactivated mid-checkout | Remove from cart server-side; return error to re-review |
| Payment abandoned | Order `pending` > 1 hr; cleanup job marks failed (Phase 3 admin visibility) |
| Cart sync failure | Silent fail; localStorage remains source for UX |

**Phase 5 addition:** release stock reservation on payment failure.

---

## 11. Security

- No card data touches our servers (Stripe Payment Element — PCI scope minimized).
- Webhook signature verification required.
- Cart sync and checkout APIs use server-side Supabase service role.
- Payment amounts computed server-side only.
- CSP headers updated for `js.stripe.com` and Stripe iframe domains.
- Checkout routes return 404 when `ENABLE_CHECKOUT=false`.

---

## 12. Data Import

Seed script (or migration seed) reads `public/data/BDKSUPPLY All Products.csv`:

| CSV column | DB column |
|------------|-----------|
| Product Weight | `weight_kg` |
| Shipping Length | `shipping_length_cm` |
| Shipping Width | `shipping_width_cm` |
| Shipping Height | `shipping_height_cm` |
| Shipping Package Type | `package_type` (normalized: Skid → skid, etc.) |

Initial `shipping_zones` and `shipping_rates` seeded with sensible AU defaults (metro/regional/remote). Rates tunable without code deploy.

---

## 13. Testing & CI

Aligned with infra spec Phase 2 gates:

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Shipping calculator, cart utils, address/postcode validation |
| Integration | Vitest + MSW | `create-payment-intent`, `shipping/estimate`, webhook handler |
| E2E | Playwright | Add to cart → checkout 3 steps → test card `4242 4242 4242 4242` → confirmation |
| Webhook | Integration test | Mock `payment_intent.succeeded`; assert order `paid` + analytics |

**CI assertions:**

- Server-side `purchase` event fires from webhook (not client-only).
- Order total matches subtotal + shipping_cents.
- Idempotent webhook does not duplicate orders.

---

## 14. Feature Flag

`ENABLE_CHECKOUT=false` (default in production until Phase 2 exit criteria met):

- PDP add-to-cart button disabled/hidden.
- `/checkout` routes return 404 or redirect.
- Checkout API routes return 403.
- `/cart` shows Phase 1 placeholder when disabled; live cart UI when enabled.
- `/checkout` and checkout API routes return 404/403 when disabled.

**Exit criteria (Phase 2):**

- End-to-end purchase works in preview (Stripe test mode).
- Orders persisted with nullable `user_id` (guest orders).
- Estimated shipping included in Stripe charge.
- `purchase` events tracked server-side.
- `ENABLE_CHECKOUT=true` in production when client approves.

---

## 15. Dependencies

Add to `package.json`:

- `stripe` — server SDK
- `@stripe/stripe-js` — client loader
- `@stripe/react-stripe-js` — Payment Element React bindings

---

## 16. Related Documents

| Document | Purpose |
|----------|---------|
| [Infrastructure & CI Design](./2026-07-18-davidecomm-infra-ci-design.md) | Master phase plan, CI gates, cross-cutting layers |
| Phase 4 spec (future) | Auth, RLS, guest order linking |
| Phase 5 spec (future) | Stock reservation at checkout |
| Phase 6 spec (future) | Stripe Tax, shipping methods, fulfillment emails |

---

*Spec written 2026-07-26 — DavidEcomm Phase 2 Checkout & Stripe Integration*
