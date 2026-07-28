-- Phase 2 checkout tables: enable RLS with no public policies.
-- Server routes use the service role (bypasses RLS); anon/authenticated API access is blocked.

alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table shipping_zones enable row level security;
alter table shipping_rates enable row level security;
