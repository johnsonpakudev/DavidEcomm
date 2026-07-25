# DavidEcomm

Custom e-commerce platform for **[BDK Supply](https://bdksupply.com.au)** — building and renovation supplies for bathrooms, doors & hardware, and kitchen & laundry.

**Website:** [bdksupply.com.au](https://bdksupply.com.au)

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

Set `NEXT_PUBLIC_SITE_URL=https://bdksupply.com.au` in production (Vercel) so metadata, sitemaps, and checkout redirects use the live domain.

## Useful scripts

- `npm run dev` — start the Next.js app
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript checks
- `npm run test` — run Vitest unit tests
- `npm run test:e2e` — run Playwright smoke tests
- `npm run build` — production build using mock data unless Supabase env vars are configured
- `npm run catalog:build` — transform BDK CSV export into JSON catalog
- `npm run catalog:seed` — seed Supabase from generated catalog

## Supabase

- Schema migration: `supabase/migrations/001_phase1_schema.sql`
- Seed data: `supabase/seed.sql`

Apply these in Supabase when you are ready to connect the live catalog. Until then, the mock data path keeps the app buildable and previewable.
