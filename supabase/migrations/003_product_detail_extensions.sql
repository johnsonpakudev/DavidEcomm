-- Phase 1.5 — rich product detail page data model
-- Variants, specifications, relations, and reviews.
-- Product policies are deferred — see docs/superpowers/specs/2026-07-24-product-policies-consideration.md

create type product_relation_type as enum ('related', 'cross_sell', 'upsell');

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  sku text unique not null,
  name text not null,
  option_type text not null default 'finish',
  option_value text not null,
  price integer,
  compare_at_price integer,
  image_url text,
  swatch_color text,
  stock_quantity integer default 0,
  in_stock boolean default true,
  is_default boolean default false,
  sort_order integer default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create index if not exists product_variants_product_idx
  on product_variants(product_id, sort_order);

create table if not exists product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  group_name text,
  label text not null,
  value text not null,
  sort_order integer default 0
);

create index if not exists product_specifications_product_idx
  on product_specifications(product_id, sort_order);

create table if not exists product_relations (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  related_product_id uuid not null references products(id) on delete cascade,
  relation_type product_relation_type not null default 'related',
  sort_order integer default 0,
  created_at timestamptz default now(),
  constraint product_relations_no_self_reference
    check (product_id <> related_product_id),
  unique (product_id, related_product_id, relation_type)
);

create index if not exists product_relations_product_type_idx
  on product_relations(product_id, relation_type, sort_order);

create table if not exists product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  author_name text not null,
  verified_purchase boolean default false,
  published boolean default true,
  created_at timestamptz default now()
);

create index if not exists product_reviews_product_idx
  on product_reviews(product_id, created_at desc);

create or replace function public.refresh_product_review_summary()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  target_product_id uuid;
begin
  target_product_id := coalesce(new.product_id, old.product_id);

  update products
  set
    rating = coalesce((
      select round(avg(rating)::numeric, 1)
      from product_reviews
      where product_id = target_product_id
        and published = true
    ), 0),
    review_count = coalesce((
      select count(*)::integer
      from product_reviews
      where product_id = target_product_id
        and published = true
    ), 0)
  where id = target_product_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists product_reviews_summary_trigger on product_reviews;

create trigger product_reviews_summary_trigger
after insert or update or delete on product_reviews
for each row execute function public.refresh_product_review_summary();

alter table product_variants enable row level security;
alter table product_specifications enable row level security;
alter table product_relations enable row level security;
alter table product_reviews enable row level security;

drop policy if exists "Public read active product variants" on product_variants;
create policy "Public read active product variants" on product_variants
for select using (
  active = true
  and exists (
    select 1
    from products
    where products.id = product_variants.product_id
      and products.active = true
  )
);

drop policy if exists "Public read product specifications" on product_specifications;
create policy "Public read product specifications" on product_specifications
for select using (
  exists (
    select 1
    from products
    where products.id = product_specifications.product_id
      and products.active = true
  )
);

drop policy if exists "Public read product relations" on product_relations;
create policy "Public read product relations" on product_relations
for select using (
  exists (
    select 1
    from products source_product
    where source_product.id = product_relations.product_id
      and source_product.active = true
  )
  and exists (
    select 1
    from products related_product
    where related_product.id = product_relations.related_product_id
      and related_product.active = true
  )
);

drop policy if exists "Public read published product reviews" on product_reviews;
create policy "Public read published product reviews" on product_reviews
for select using (
  published = true
  and exists (
    select 1
    from products
    where products.id = product_reviews.product_id
      and products.active = true
  )
);
