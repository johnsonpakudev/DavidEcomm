-- Example rich PDP data for Serra Brushed Brass Basin Mixer
-- Run after 003_product_detail_extensions.sql

insert into product_variants (
  id, product_id, sku, name, option_type, option_value, price, image_url, swatch_color, stock_quantity, in_stock, is_default, sort_order
)
values
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000004',
    'BDK-BBM-BB',
    'Brushed Brass',
    'finish',
    'Brushed Brass',
    42900,
    'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80',
    '#C7B8A3',
    18,
    true,
    true,
    0
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000004',
    'BDK-BBM-MB',
    'Matte Black',
    'finish',
    'Matte Black',
    44900,
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    '#1E2B3B',
    12,
    true,
    false,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000004',
    'BDK-BBM-CH',
    'Chrome',
    'finish',
    'Chrome',
    39900,
    'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80',
    '#C0CFDD',
    24,
    true,
    false,
    2
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000004',
    'BDK-BBM-BG',
    'Brushed Gold',
    'finish',
    'Brushed Gold',
    45900,
    'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80',
    '#AB9678',
    9,
    true,
    false,
    3
  )
on conflict (sku) do update set
  product_id = excluded.product_id,
  name = excluded.name,
  option_type = excluded.option_type,
  option_value = excluded.option_value,
  price = excluded.price,
  image_url = excluded.image_url,
  swatch_color = excluded.swatch_color,
  stock_quantity = excluded.stock_quantity,
  in_stock = excluded.in_stock,
  is_default = excluded.is_default,
  sort_order = excluded.sort_order;

insert into product_specifications (id, product_id, group_name, label, value, sort_order)
values
  ('41000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', 'General', 'Brand', 'BDK Supply', 0),
  ('41000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', 'General', 'Installation', 'Deck mounted', 1),
  ('41000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 'General', 'Cartridge', '35mm ceramic disc', 2),
  ('41000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'Performance', 'WELS rating', '5 star / 5.5L per min', 3),
  ('41000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004', 'Performance', 'Connection', '15mm flexible hoses', 4),
  ('41000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', 'Dimensions', 'Height', '145mm', 5),
  ('41000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', 'Dimensions', 'Reach', '120mm', 6),
  ('41000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000004', 'Dimensions', 'Weight', '1.2kg', 7),
  ('41000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000004', 'Warranty', 'Manufacturer warranty', '15 years', 8)
on conflict (id) do update set
  group_name = excluded.group_name,
  label = excluded.label,
  value = excluded.value,
  sort_order = excluded.sort_order;

insert into product_relations (id, product_id, related_product_id, relation_type, sort_order)
values
  ('42000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000006', 'cross_sell', 0),
  ('42000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000010', 'cross_sell', 1),
  ('42000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000007', 'related', 0),
  ('42000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000009', 'related', 1)
on conflict (product_id, related_product_id, relation_type) do update set
  sort_order = excluded.sort_order;

insert into product_reviews (id, product_id, rating, title, body, author_name, verified_purchase, published, created_at)
values
  (
    '43000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000004',
    5,
    'Beautiful finish',
    'The brushed brass looks even better in person. Solid feel and smooth operation.',
    'Sarah M.',
    true,
    true,
    '2026-06-12T10:00:00Z'
  ),
  (
    '43000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000004',
    5,
    'Perfect for our ensuite',
    'Installed easily and matches our other brass fixtures perfectly.',
    'James T.',
    true,
    true,
    '2026-05-28T14:30:00Z'
  ),
  (
    '43000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000004',
    4,
    'Great quality tap',
    'Lovely design and good water flow. Took a week to arrive but worth the wait.',
    'Emma L.',
    true,
    true,
    '2026-05-03T09:15:00Z'
  )
on conflict (id) do update set
  rating = excluded.rating,
  title = excluded.title,
  body = excluded.body,
  author_name = excluded.author_name,
  verified_purchase = excluded.verified_purchase,
  published = excluded.published,
  created_at = excluded.created_at;

-- Refresh denormalised rating summary after seeding reviews
update products
set
  rating = (
    select round(avg(rating)::numeric, 1)
    from product_reviews
    where product_id = '20000000-0000-0000-0000-000000000004'
      and published = true
  ),
  review_count = (
    select count(*)::integer
    from product_reviews
    where product_id = '20000000-0000-0000-0000-000000000004'
      and published = true
  )
where id = '20000000-0000-0000-0000-000000000004';
