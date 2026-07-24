-- Multi-source product reviews
-- Supports native post-purchase, CSV import, and third-party syndication.

create type product_review_source as enum (
  'native',
  'import',
  'google',
  'trustpilot',
  'yotpo',
  'feefo',
  'productreview',
  'manual'
);

alter table product_reviews
  add column if not exists source product_review_source not null default 'native',
  add column if not exists external_id text,
  add column if not exists source_url text,
  add column if not exists imported_at timestamptz,
  add column if not exists author_location text,
  add column if not exists locale text not null default 'en-AU',
  add column if not exists include_in_rating boolean not null default true;

create unique index if not exists product_reviews_source_external_id_idx
  on product_reviews (source, external_id)
  where external_id is not null;

create index if not exists product_reviews_source_idx
  on product_reviews (product_id, source, created_at desc);

-- Backfill existing rows as native imports from seed data
update product_reviews
set
  source = 'import',
  external_id = 'seed:' || id::text,
  imported_at = coalesce(created_at, now())
where external_id is null;

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
        and include_in_rating = true
    ), 0),
    review_count = coalesce((
      select count(*)::integer
      from product_reviews
      where product_id = target_product_id
        and published = true
        and include_in_rating = true
    ), 0)
  where id = target_product_id;

  return coalesce(new, old);
end;
$$;
