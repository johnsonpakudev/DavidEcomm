# DavidEcomm

Custom e-commerce platform for **[BDK Supply](https://david-ecomm-johnson-dev1.vercel.app)** — building and renovation supplies for bathrooms, doors & hardware, and kitchen & laundry.

**Website:** [david-ecomm-johnson-dev1.vercel.app](https://david-ecomm-johnson-dev1.vercel.app)

## Documentation

- **[Client Overview](./docs/DavidEcomm-Client-Overview.md)** — plain-language guide for stakeholders (platform & infrastructure)
- **[Estimation & Pricing Model](./docs/DavidEcomm-Estimation-Pricing-Model.md)** — SaaS, Stripe, and labour cost ranges (AUD)
- [Infrastructure & CI Design](./docs/superpowers/specs/2026-07-18-davidecomm-infra-ci-design.md)
- [Frontend Design Specification](./docs/superpowers/specs/2026-07-18-davidecomm-frontend-design.md)
- [Phase 1 Implementation Plan](./docs/superpowers/plans/2026-07-18-phase-1-catalog.md)

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The Phase 1 storefront is designed to work without any Supabase environment variables. When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing, the app falls back to the comprehensive mock catalog in `lib/mock/data.ts`.

Set `NEXT_PUBLIC_SITE_URL=https://david-ecomm-johnson-dev1.vercel.app` in production (Vercel) so metadata, sitemaps, and checkout redirects use the live domain.

## Production launch checklist (Phase 1)

Excludes Vercel env var wiring and PostHog — configure those in the Vercel dashboard separately.

1. **Catalog** — run `npm run catalog:build` and deploy so `public/data/catalog/*.json` is current (2,744+ products).
2. **Mega-menu** — curated at build time (`scripts/catalog/categories.ts`); verify with `npm run verify:production:local` (3 pillars, no `;` noise).
3. **Supabase** — apply migrations `001`–`005` on the production project; keep `CATALOG_SOURCE=auto` until Phase 2.
4. **Checkout** — leave `ENABLE_CHECKOUT=false` and `NEXT_PUBLIC_ENABLE_CHECKOUT=false` until Phase 2.
5. **SEO** — confirm `/sitemap.xml`, `/robots.txt`, and JSON-LD on sample PDPs after deploy.
6. **Smoke test** — `npm run verify:production` against the live URL (homepage, sitemap, sample PDPs).
7. **CI** — `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass on `main`.

See [Phase 1 Production Hardening Design](./docs/superpowers/specs/2026-07-26-phase-1-production-hardening-design.md) for full exit criteria.

## Useful scripts

- `npm run dev` — start the Next.js app
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript checks
- `npm run test` — run Vitest unit tests
- `npm run test:e2e` — run Playwright smoke tests
- `npm run build` — production build using mock data unless Supabase env vars are configured
- `npm run catalog:build` — transform BDK CSV export into JSON catalog
- `npm run catalog:seed` — seed Supabase from generated catalog
- `npm run verify:production` — HTTP smoke checks against the live site (homepage, sitemap, sample PDPs)
- `npm run verify:production:local` — validate curated mega-menu and homepage category links in generated JSON

## Supabase

- Schema migration: `supabase/migrations/001_phase1_schema.sql`
- Seed data: `supabase/seed.sql`

Apply these in Supabase when you are ready to connect the live catalog. Until then, the mock data path keeps the app buildable and previewable.
