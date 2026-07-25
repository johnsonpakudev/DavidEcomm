-- Phase 2 — checkout, orders, shipping estimates, cart persistence

alter table products add column if not exists weight_kg numeric;
alter table products add column if not exists shipping_length_cm numeric;
alter table products add column if not exists shipping_width_cm numeric;
alter table products add column if not exists shipping_height_cm numeric;
alter table products add column if not exists package_type text
  check (package_type is null or package_type in ('envelope', 'carton', 'skid'));

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  session_id text unique not null,
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id),
  variant_id uuid references product_variants(id),
  quantity integer not null check (quantity > 0),
  unique (cart_id, product_id, variant_id)
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  guest_email text not null,
  guest_phone text,
  stripe_payment_intent_id text unique,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded')),
  subtotal_cents integer not null,
  shipping_cents integer not null default 0,
  tax_cents integer default 0,
  total_cents integer not null,
  shipping_address jsonb not null,
  shipping_method text,
  fulfillment_status text default 'paid'
    check (fulfillment_status in ('paid', 'processing', 'shipped', 'delivered')),
  shipping_zone text,
  shipping_disclaimer text not null default
    'Shipping is estimated. Final cost confirmed before dispatch.',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  variant_id uuid references product_variants(id),
  product_name text not null,
  variant_name text,
  sku text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null
);

create table if not exists shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  postcode_ranges jsonb not null,
  countries text[] default '{AU}'
);

create table if not exists shipping_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references shipping_zones(id) on delete cascade,
  package_type text not null check (package_type in ('envelope', 'carton', 'skid')),
  min_weight_kg numeric not null default 0,
  max_weight_kg numeric,
  rate_cents integer not null,
  multi_item_surcharge_pct numeric default 0
);

create index if not exists orders_guest_email_idx on orders(guest_email);
create index if not exists orders_stripe_pi_idx on orders(stripe_payment_intent_id);
create index if not exists orders_status_created_idx on orders(status, created_at desc);
create index if not exists cart_items_cart_id_idx on cart_items(cart_id);

-- Default AU shipping zones
insert into shipping_zones (name, slug, postcode_ranges)
values
  (
    'Metro',
    'metro',
    '[
      {"from": 2000, "to": 2234},
      {"from": 3000, "to": 3207},
      {"from": 4000, "to": 4179},
      {"from": 5000, "to": 5199},
      {"from": 6000, "to": 6199}
    ]'::jsonb
  ),
  (
    'Remote',
    'remote',
    '[
      {"from": 800, "to": 899},
      {"from": 870, "to": 879},
      {"from": 4800, "to": 4899}
    ]'::jsonb
  ),
  (
    'Regional',
    'regional',
    '[
      {"from": 200, "to": 9999}
    ]'::jsonb
  )
on conflict (slug) do nothing;

-- Regional is catch-all; metro and remote checked first in application logic by sort order
-- Seed rates per zone and package type (AUD cents)
insert into shipping_rates (zone_id, package_type, min_weight_kg, max_weight_kg, rate_cents, multi_item_surcharge_pct)
select z.id, r.package_type, r.min_weight_kg, r.max_weight_kg, r.rate_cents, r.multi_item_surcharge_pct
from shipping_zones z
cross join (
  values
    ('envelope', 0::numeric, 1::numeric, 995, 0::numeric),
    ('envelope', 1::numeric, null::numeric, 1295, 0::numeric),
    ('carton', 0::numeric, 5::numeric, 1495, 0::numeric),
    ('carton', 5::numeric, 20::numeric, 2995, 0::numeric),
    ('carton', 20::numeric, null::numeric, 4995, 0::numeric),
    ('skid', 0::numeric, 50::numeric, 9900, 15::numeric),
    ('skid', 50::numeric, null::numeric, 14900, 15::numeric)
) as r(package_type, min_weight_kg, max_weight_kg, rate_cents, multi_item_surcharge_pct)
where z.slug = 'metro'
  and not exists (
    select 1 from shipping_rates sr
    where sr.zone_id = z.id and sr.package_type = r.package_type and sr.min_weight_kg = r.min_weight_kg
  );

insert into shipping_rates (zone_id, package_type, min_weight_kg, max_weight_kg, rate_cents, multi_item_surcharge_pct)
select z.id, r.package_type, r.min_weight_kg, r.max_weight_kg, r.rate_cents, r.multi_item_surcharge_pct
from shipping_zones z
cross join (
  values
    ('envelope', 0::numeric, 1::numeric, 1295, 0::numeric),
    ('envelope', 1::numeric, null::numeric, 1695, 0::numeric),
    ('carton', 0::numeric, 5::numeric, 1995, 0::numeric),
    ('carton', 5::numeric, 20::numeric, 3995, 0::numeric),
    ('carton', 20::numeric, null::numeric, 6495, 0::numeric),
    ('skid', 0::numeric, 50::numeric, 12900, 15::numeric),
    ('skid', 50::numeric, null::numeric, 18900, 15::numeric)
) as r(package_type, min_weight_kg, max_weight_kg, rate_cents, multi_item_surcharge_pct)
where z.slug = 'regional'
  and not exists (
    select 1 from shipping_rates sr
    where sr.zone_id = z.id and sr.package_type = r.package_type and sr.min_weight_kg = r.min_weight_kg
  );

insert into shipping_rates (zone_id, package_type, min_weight_kg, max_weight_kg, rate_cents, multi_item_surcharge_pct)
select z.id, r.package_type, r.min_weight_kg, r.max_weight_kg, r.rate_cents, r.multi_item_surcharge_pct
from shipping_zones z
cross join (
  values
    ('envelope', 0::numeric, 1::numeric, 1995, 0::numeric),
    ('envelope', 1::numeric, null::numeric, 2495, 0::numeric),
    ('carton', 0::numeric, 5::numeric, 2995, 0::numeric),
    ('carton', 5::numeric, 20::numeric, 5495, 0::numeric),
    ('carton', 20::numeric, null::numeric, 8995, 0::numeric),
    ('skid', 0::numeric, 50::numeric, 17900, 15::numeric),
    ('skid', 50::numeric, null::numeric, 24900, 15::numeric)
) as r(package_type, min_weight_kg, max_weight_kg, rate_cents, multi_item_surcharge_pct)
where z.slug = 'remote'
  and not exists (
    select 1 from shipping_rates sr
    where sr.zone_id = z.id and sr.package_type = r.package_type and sr.min_weight_kg = r.min_weight_kg
  );
