insert into site_config (id, promo_text, phone, email, address, trading_hours, social_links)
values (
  1,
  'Direct from the manufacturer, to you.',
  '0412 615 143',
  'orders@bdksupply.com.au',
  '27A Coolibar Street, Canley Heights NSW 2166',
  'Mon-Fri 9am-5pm AEST',
  '{}'::jsonb
)
on conflict (id) do update set
  promo_text = excluded.promo_text,
  phone = excluded.phone,
  email = excluded.email,
  address = excluded.address,
  trading_hours = excluded.trading_hours,
  social_links = excluded.social_links;

insert into categories (
  id, name, slug, parent_id, nav_pillar, icon_key, mega_menu_image, mega_menu_order, show_in_mega_menu, meta_title, meta_description
)
values
  ('00000000-0000-0000-0000-000000000001', 'Bathroom', 'bathroom', null, 'bathroom', 'bathroom', null, 0, true, 'Bathroom Fixtures & Fittings', 'Premium bathroom fixtures, vanities, tapware, mirrors and accessories.'),
  ('00000000-0000-0000-0000-000000000101', 'Vanities', 'vanities', '00000000-0000-0000-0000-000000000001', 'bathroom', 'vanities', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', 1, true, 'Bathroom Vanities', 'Discover premium wall hung and floor standing bathroom vanities.'),
  ('00000000-0000-0000-0000-000000000102', 'Wall Hung Vanities', 'wall-hung-vanities', '00000000-0000-0000-0000-000000000101', 'bathroom', null, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80', 2, false, null, null),
  ('00000000-0000-0000-0000-000000000103', 'Floor Standing Vanities', 'floor-standing-vanities', '00000000-0000-0000-0000-000000000101', 'bathroom', null, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80', 3, false, null, null),
  ('00000000-0000-0000-0000-000000000104', 'Tapware', 'tapware', '00000000-0000-0000-0000-000000000001', 'bathroom', 'tapware', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80', 4, true, 'Bathroom Tapware', 'Basin mixers, bath fillers, shower mixers and designer tapware.'),
  ('00000000-0000-0000-0000-000000000105', 'Basin Mixers', 'basin-mixers', '00000000-0000-0000-0000-000000000104', 'bathroom', null, 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=900&q=80', 5, false, null, null),
  ('00000000-0000-0000-0000-000000000106', 'Toilets', 'toilets', '00000000-0000-0000-0000-000000000001', 'bathroom', 'toilets', 'https://images.unsplash.com/photo-1620735692151-26a7e0748429?auto=format&fit=crop&w=900&q=80', 6, true, 'Designer Toilets', 'Wall faced, back to wall and in-wall cistern toilet suites.'),
  ('00000000-0000-0000-0000-000000000107', 'Basins', 'basins', '00000000-0000-0000-0000-000000000001', 'bathroom', 'basins', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80', 7, true, 'Bathroom Basins', 'Above counter, under counter and vessel basins in premium finishes.'),
  ('00000000-0000-0000-0000-000000000108', 'Showers', 'showers', '00000000-0000-0000-0000-000000000001', 'bathroom', 'showers', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=900&q=80', 8, true, 'Showers', 'Shower systems, rails, heads and premium bathroom showerware.'),
  ('00000000-0000-0000-0000-000000000109', 'Baths & Spas', 'baths-spas', '00000000-0000-0000-0000-000000000001', 'bathroom', 'baths', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=900&q=80', 9, true, 'Baths & Spas', 'Freestanding baths, spa baths and built-in tubs.'),
  ('00000000-0000-0000-0000-000000000110', 'Mirrors & Cabinets', 'mirrors-cabinets', '00000000-0000-0000-0000-000000000001', 'bathroom', 'mirrors', 'https://images.unsplash.com/photo-1620735692151-26a7e0748429?auto=format&fit=crop&w=900&q=80', 10, true, 'Mirrors & Cabinets', 'LED mirrors, shaving cabinets and mirrored storage.'),
  ('00000000-0000-0000-0000-000000000111', 'Accessories', 'accessories', '00000000-0000-0000-0000-000000000001', 'bathroom', 'accessories', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=900&q=80', 11, true, 'Bathroom Accessories', 'Towel rails, robe hooks, shelves and bathroom accessories.'),
  ('00000000-0000-0000-0000-000000000112', 'Waste & Drains', 'waste-drains', '00000000-0000-0000-0000-000000000001', 'bathroom', 'drains', 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=900&q=80', 12, true, 'Waste & Drains', 'Designer floor wastes, basin wastes and architectural grates.'),
  ('00000000-0000-0000-0000-000000000002', 'Doors & Hardware', 'doors-hardware', null, 'doors-hardware', 'doors-hardware', null, 0, true, 'Doors & Hardware', 'Premium handles, locks, hinges and architectural door hardware.'),
  ('00000000-0000-0000-0000-000000000201', 'Door Handles', 'door-handles', '00000000-0000-0000-0000-000000000002', 'doors-hardware', 'door-handles', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80', 1, true, 'Door Handles', 'Lever handles, pull handles and architectural hardware.'),
  ('00000000-0000-0000-0000-000000000202', 'Locks & Latches', 'locks-latches', '00000000-0000-0000-0000-000000000002', 'doors-hardware', 'locks', 'https://images.unsplash.com/photo-1600566753051-f0b74ff74d27?auto=format&fit=crop&w=900&q=80', 2, true, 'Locks & Latches', 'Entrance locks, privacy sets and deadbolts.'),
  ('00000000-0000-0000-0000-000000000203', 'Hinges', 'hinges', '00000000-0000-0000-0000-000000000002', 'doors-hardware', 'hinges', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=80', 3, true, 'Door Hinges', 'Butt hinges, concealed hinges and pivot hardware.'),
  ('00000000-0000-0000-0000-000000000204', 'Sliding Door Hardware', 'sliding-door-hardware', '00000000-0000-0000-0000-000000000002', 'doors-hardware', 'sliding-door', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=900&q=80', 4, true, 'Sliding Door Hardware', 'Barn door tracks, pocket door systems and fittings.'),
  ('00000000-0000-0000-0000-000000000205', 'Cabinet Hardware', 'cabinet-hardware', '00000000-0000-0000-0000-000000000002', 'doors-hardware', 'cabinet-hardware', 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80', 5, true, 'Cabinet Hardware', 'Cabinet knobs, pulls, catches and finishing details.'),
  ('00000000-0000-0000-0000-000000000206', 'Window Hardware', 'window-hardware', '00000000-0000-0000-0000-000000000002', 'doors-hardware', 'window-hardware', 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=900&q=80', 6, true, 'Window Hardware', 'Window handles, locks and stay arms.'),
  ('00000000-0000-0000-0000-000000000003', 'Kitchen & Laundry', 'kitchen-laundry', null, 'kitchen-laundry', 'kitchen-laundry', null, 0, true, 'Kitchen & Laundry', 'Sinks, tapware, tubs, handles and laundry accessories.'),
  ('00000000-0000-0000-0000-000000000301', 'Kitchen Sinks', 'kitchen-sinks', '00000000-0000-0000-0000-000000000003', 'kitchen-laundry', 'kitchen-sinks', 'https://images.unsplash.com/photo-1564540583246-934409427776?auto=format&fit=crop&w=900&q=80', 1, true, 'Kitchen Sinks', 'Undermount, topmount and butler sinks in premium finishes.'),
  ('00000000-0000-0000-0000-000000000302', 'Kitchen Tapware', 'kitchen-tapware', '00000000-0000-0000-0000-000000000003', 'kitchen-laundry', 'kitchen-tapware', 'https://images.unsplash.com/photo-1582582429416-c0f5e2f1ff8e?auto=format&fit=crop&w=900&q=80', 2, true, 'Kitchen Tapware', 'Sink mixers, filter taps and pot fillers.'),
  ('00000000-0000-0000-0000-000000000303', 'Laundry Tubs', 'laundry-tubs', '00000000-0000-0000-0000-000000000003', 'kitchen-laundry', 'laundry', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80', 3, true, 'Laundry Tubs', 'Single tubs, double tubs and cabinet laundry units.'),
  ('00000000-0000-0000-0000-000000000304', 'Cabinet Handles', 'cabinet-handles', '00000000-0000-0000-0000-000000000003', 'kitchen-laundry', 'cabinet-handles', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80', 4, true, 'Cabinet Handles', 'Bar handles, cup pulls and knurled knobs for kitchens and laundries.'),
  ('00000000-0000-0000-0000-000000000305', 'Splashbacks', 'splashbacks', '00000000-0000-0000-0000-000000000003', 'kitchen-laundry', 'splashbacks', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80', 5, true, 'Kitchen Splashbacks', 'Glass and acrylic splashbacks for premium kitchens.'),
  ('00000000-0000-0000-0000-000000000306', 'Kitchen Accessories', 'kitchen-accessories', '00000000-0000-0000-0000-000000000003', 'kitchen-laundry', 'kitchen-accessories', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80', 6, true, 'Kitchen Accessories', 'Sink grids, colanders and accessories for hardworking spaces.')
on conflict (slug) do update set
  name = excluded.name,
  parent_id = excluded.parent_id,
  nav_pillar = excluded.nav_pillar,
  icon_key = excluded.icon_key,
  mega_menu_image = excluded.mega_menu_image,
  mega_menu_order = excluded.mega_menu_order,
  show_in_mega_menu = excluded.show_in_mega_menu,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description;

insert into homepage_heroes (id, headline, subheadline, cta_text, cta_href, image_url, sort_order, active)
values
  ('10000000-0000-0000-0000-000000000001', 'Premium fixtures for the spaces that matter most.', 'Refined bathroom, kitchen and hardware collections with honest pricing.', 'Shop premium vanities', '/collections/premium', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80', 0, true),
  ('10000000-0000-0000-0000-000000000002', 'Architectural details, built on quality and trust.', 'Discover statement handles, brass tapware and timeless utility pieces.', 'Explore best sellers', '/collections/best-sellers', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1800&q=80', 1, true)
on conflict (id) do update set
  headline = excluded.headline,
  subheadline = excluded.subheadline,
  cta_text = excluded.cta_text,
  cta_href = excluded.cta_href,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into homepage_promos (id, eyebrow, headline, subtext, cta_text, cta_href, image_url, active)
values
  ('10000000-0000-0000-0000-000000000003', 'Limited time only', 'On Sale', 'Save on curated bathroom, door and laundry favourites while stocks last.', 'Shop the sale', '/sale', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80', true)
on conflict (id) do update set
  eyebrow = excluded.eyebrow,
  headline = excluded.headline,
  subtext = excluded.subtext,
  cta_text = excluded.cta_text,
  cta_href = excluded.cta_href,
  image_url = excluded.image_url,
  active = excluded.active;

insert into homepage_collections (id, name, slug, description, image_url, cta_text, sort_order)
values
  ('10000000-0000-0000-0000-000000000004', 'Premium Collection', 'premium', 'Elevated finishes, bespoke silhouettes and designer-level detail.', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80', 'SHOP PREMIUM →', 0),
  ('10000000-0000-0000-0000-000000000005', 'Best Value', 'best-value', 'Durable, high-performing essentials chosen for everyday renovation budgets.', 'https://images.unsplash.com/photo-1564540583246-934409427776?auto=format&fit=crop&w=1200&q=80', 'SHOP BEST VALUE →', 1),
  ('10000000-0000-0000-0000-000000000006', 'Essential', 'essential', 'Reliable fixtures and hardware that bring polish to every room.', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80', 'SHOP ESSENTIAL →', 2)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  cta_text = excluded.cta_text,
  sort_order = excluded.sort_order;

insert into inspiration_images (id, image_url, alt_text, sort_order, active)
values
  ('10000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80', 'Warm oak bathroom vanity styling', 0, true),
  ('10000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80', 'Luxury bathroom interior with stone finishes', 1, true),
  ('10000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1564540583246-934409427776?auto=format&fit=crop&w=1000&q=80', 'Contemporary kitchen sink and joinery', 2, true),
  ('10000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1000&q=80', 'Laundry room with integrated storage', 3, true),
  ('10000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1000&q=80', 'Freestanding bath in premium bathroom', 4, true),
  ('10000000-0000-0000-0000-000000000016', 'https://images.unsplash.com/photo-1620735692151-26a7e0748429?auto=format&fit=crop&w=1000&q=80', 'Modern mirror and vanity styling', 5, true),
  ('10000000-0000-0000-0000-000000000017', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=80', 'Architectural door hardware close-up', 6, true),
  ('10000000-0000-0000-0000-000000000018', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1000&q=80', 'Sliding door hardware in a modern interior', 7, true)
on conflict (id) do update set
  image_url = excluded.image_url,
  alt_text = excluded.alt_text,
  sort_order = excluded.sort_order,
  active = excluded.active;

insert into footer_links (id, column_name, label, href, sort_order)
values
  ('10000000-0000-0000-0000-000000000021', 'Shop', 'Bathroom', '/categories/bathroom', 0),
  ('10000000-0000-0000-0000-000000000022', 'Shop', 'Doors & Hardware', '/categories/doors-hardware', 1),
  ('10000000-0000-0000-0000-000000000023', 'Shop', 'Kitchen & Laundry', '/categories/kitchen-laundry', 2),
  ('10000000-0000-0000-0000-000000000024', 'Shop', 'Sale', '/sale', 3),
  ('10000000-0000-0000-0000-000000000025', 'Customer Care', 'Shipping & Delivery', '#shipping', 0),
  ('10000000-0000-0000-0000-000000000026', 'Customer Care', 'Returns & Refunds', '#returns', 1),
  ('10000000-0000-0000-0000-000000000027', 'Customer Care', 'FAQ', '#faq', 2),
  ('10000000-0000-0000-0000-000000000028', 'Customer Care', 'Contact Us', '#contact', 3),
  ('10000000-0000-0000-0000-000000000029', 'Explore', 'Inspiration', '/inspiration', 0),
  ('10000000-0000-0000-0000-000000000030', 'Explore', 'Best Sellers', '/collections/best-sellers', 1),
  ('10000000-0000-0000-0000-000000000031', 'Explore', 'Premium Collection', '/collections/premium', 2),
  ('10000000-0000-0000-0000-000000000032', 'Explore', 'Account', '/account', 3)
on conflict (id) do update set
  column_name = excluded.column_name,
  label = excluded.label,
  href = excluded.href,
  sort_order = excluded.sort_order;

insert into products (
  id, name, slug, description, price, category_id, sku, brand, attributes, meta_title, meta_description, og_image_url, stock_quantity, in_stock, active, featured, badge, collection_slugs, rating, review_count, created_at
)
values
  ('20000000-0000-0000-0000-000000000001', 'Avila 1500 Fluted Oak Vanity', 'avila-1500-fluted-oak', 'A statement vanity with fluted oak detailing, a slim stone top and soft-close drawers.', 245000, '00000000-0000-0000-0000-000000000101', 'DAV-1500-FO', 'DavidEcomm Atelier', '{"width":"1500mm","finish":"Natural Oak","basin":"Double Basin"}'::jsonb, 'Avila 1500 Fluted Oak Vanity | DavidEcomm', 'A statement vanity with fluted oak detailing, a slim stone top and soft-close drawers.', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 5, true, true, true, 'best_seller', '{premium,best-sellers}', 4.9, 47, '2026-07-01T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000002', 'Lina 900 Wall Hung Vanity', 'lina-900-wall-hung', 'Compact floating vanity with integrated basin and warm timber shelving.', 139500, '00000000-0000-0000-0000-000000000102', 'DAV-900-WH', 'DavidEcomm Atelier', '{"width":"900mm","finish":"White Ash","basin":"Single Basin"}'::jsonb, 'Lina 900 Wall Hung Vanity | DavidEcomm', 'Compact floating vanity with integrated basin and warm timber shelving.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', 6, true, true, true, 'new', '{essential,new}', 4.7, 12, '2026-07-12T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000003', 'Carrara 1200 Floor Standing Vanity', 'carrara-1200-floor-standing', 'Classic shaker-inspired vanity with stone top and generous under-basin storage.', 179900, '00000000-0000-0000-0000-000000000103', 'DAV-1200-FS', 'DavidEcomm Atelier', '{"width":"1200mm","finish":"Matte White","basin":"Single Basin"}'::jsonb, 'Carrara 1200 Floor Standing Vanity | DavidEcomm', 'Classic shaker-inspired vanity with stone top and generous under-basin storage.', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', 7, true, true, false, null, '{best-value}', 4.5, 18, '2026-06-02T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000004', 'Serra Brushed Brass Basin Mixer', 'serra-brushed-brass-basin-mixer', 'Solid brass basin mixer with refined silhouette and durable PVD finish.', 42900, '00000000-0000-0000-0000-000000000105', 'DAV-BBM-001', 'DavidEcomm Atelier', '{"finish":"Brushed Brass","installation":"Deck Mounted"}'::jsonb, 'Serra Brushed Brass Basin Mixer | DavidEcomm', 'Solid brass basin mixer with refined silhouette and durable PVD finish.', 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80', 18, true, true, true, 'best_seller', '{premium,best-sellers}', 4.8, 63, '2026-05-11T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000005', 'Orion Rimless Wall Faced Toilet Suite', 'orion-rimless-wall-faced-toilet-suite', 'Minimal wall faced toilet suite with soft-close seat and efficient dual flush system.', 98900, '00000000-0000-0000-0000-000000000106', 'DAV-WFT-100', 'DavidEcomm Select', '{"finish":"Gloss White","seat":"Soft Close"}'::jsonb, 'Orion Rimless Wall Faced Toilet Suite | DavidEcomm', 'Minimal wall faced toilet suite with soft-close seat and efficient dual flush system.', 'https://images.unsplash.com/photo-1620735692151-26a7e0748429?auto=format&fit=crop&w=1200&q=80', 9, true, true, false, null, '{best-value}', 4.6, 21, '2026-04-14T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000006', 'Mila Stone Composite Vessel Basin', 'mila-stone-composite-vessel-basin', 'Smooth matte vessel basin designed for contemporary bathroom schemes.', 51900, '00000000-0000-0000-0000-000000000107', 'DAV-VB-330', 'DavidEcomm Atelier', '{"finish":"Matte Sand","material":"Stone Composite"}'::jsonb, 'Mila Stone Composite Vessel Basin | DavidEcomm', 'Smooth matte vessel basin designed for contemporary bathroom schemes.', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', 14, true, true, false, 'new', '{premium,new}', 4.7, 7, '2026-07-10T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000007', 'Lucent Rain Shower Rail Set', 'lucent-rain-shower-rail-set', 'Brushed nickel shower rail with overhead rain head and hand shower.', 86500, '00000000-0000-0000-0000-000000000108', 'DAV-SRS-220', 'DavidEcomm Select', '{"finish":"Brushed Nickel","head":"250mm Rain Head"}'::jsonb, 'Lucent Rain Shower Rail Set | DavidEcomm', 'Brushed nickel shower rail with overhead rain head and hand shower.', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80', 8, true, true, true, 'sale', '{sale,best-value}', 4.5, 16, '2026-06-18T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000008', 'Solis 1700 Freestanding Bath', 'solis-1700-freestanding-bath', 'Elegant oval freestanding bath crafted for luxurious soaking comfort.', 229000, '00000000-0000-0000-0000-000000000109', 'DAV-FB-1700', 'DavidEcomm Atelier', '{"length":"1700mm","finish":"Matte White"}'::jsonb, 'Solis 1700 Freestanding Bath | DavidEcomm', 'Elegant oval freestanding bath crafted for luxurious soaking comfort.', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80', 4, true, true, false, null, '{premium}', 4.9, 29, '2026-05-21T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000009', 'Lumen Backlit LED Mirror', 'lumen-backlit-led-mirror', 'Soft halo LED mirror with demister pad and touch controls.', 69900, '00000000-0000-0000-0000-000000000110', 'DAV-LED-850', 'DavidEcomm Select', '{"width":"850mm","lighting":"Warm + Cool"}'::jsonb, 'Lumen Backlit LED Mirror | DavidEcomm', 'Soft halo LED mirror with demister pad and touch controls.', 'https://images.unsplash.com/photo-1620735692151-26a7e0748429?auto=format&fit=crop&w=1200&q=80', 10, true, true, false, 'best_seller', '{best-sellers,essential}', 4.8, 38, '2026-05-03T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000010', 'Knurled Brass Double Towel Rail', 'knurled-brass-double-towel-rail', 'A tactile double towel rail with a rich brass finish for premium bathrooms.', 22900, '00000000-0000-0000-0000-000000000111', 'DAV-TR-420', 'DavidEcomm Atelier', '{"finish":"Brushed Brass","width":"600mm"}'::jsonb, 'Knurled Brass Double Towel Rail | DavidEcomm', 'A tactile double towel rail with a rich brass finish for premium bathrooms.', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80', 20, true, true, false, 'sale', '{sale}', 4.4, 8, '2026-03-27T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000011', 'Linear Brushed Steel Floor Grate', 'linear-brushed-steel-floor-grate', 'Architectural floor grate with tiled insert capability for sleek wet areas.', 17900, '00000000-0000-0000-0000-000000000112', 'DAV-FG-900', 'DavidEcomm Select', '{"length":"900mm","finish":"Brushed Steel"}'::jsonb, 'Linear Brushed Steel Floor Grate | DavidEcomm', 'Architectural floor grate with tiled insert capability for sleek wet areas.', 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80', 22, true, true, false, null, '{essential}', 4.3, 6, '2026-04-09T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000012', 'Axton Matte Black Lever Handle Set', 'axton-matte-black-lever-handle-set', 'Architectural lever handle set with concealed fixings and crisp matte finish.', 18900, '00000000-0000-0000-0000-000000000201', 'DAV-DH-210', 'DavidEcomm Hardware', '{"finish":"Matte Black","function":"Passage"}'::jsonb, 'Axton Matte Black Lever Handle Set | DavidEcomm', 'Architectural lever handle set with concealed fixings and crisp matte finish.', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80', 30, true, true, false, 'best_seller', '{best-sellers,essential}', 4.8, 54, '2026-05-30T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000013', 'Harper Satin Brass Privacy Set', 'harper-satin-brass-privacy-set', 'Refined privacy set for bathrooms and ensuites with a satin brass finish.', 24900, '00000000-0000-0000-0000-000000000202', 'DAV-LK-310', 'DavidEcomm Hardware', '{"finish":"Satin Brass","function":"Privacy"}'::jsonb, 'Harper Satin Brass Privacy Set | DavidEcomm', 'Refined privacy set for bathrooms and ensuites with a satin brass finish.', 'https://images.unsplash.com/photo-1600566753051-f0b74ff74d27?auto=format&fit=crop&w=1200&q=80', 15, true, true, false, 'new', '{new,premium}', 4.6, 9, '2026-07-08T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000014', 'Atelier Concealed Pivot Hinge', 'atelier-concealed-pivot-hinge', 'Heavy duty concealed pivot hinge designed for modern interior doors.', 15900, '00000000-0000-0000-0000-000000000203', 'DAV-HG-110', 'DavidEcomm Hardware', '{"finish":"Satin Stainless","load":"80kg"}'::jsonb, 'Atelier Concealed Pivot Hinge | DavidEcomm', 'Heavy duty concealed pivot hinge designed for modern interior doors.', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 28, true, true, false, null, '{best-value}', 4.2, 5, '2026-03-19T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000015', 'Barn Door Track Kit 2400mm', 'barn-door-track-kit-2400mm', 'Complete barn door hardware kit with soft-close functionality.', 55900, '00000000-0000-0000-0000-000000000204', 'DAV-SD-2400', 'DavidEcomm Hardware', '{"finish":"Black","track":"2400mm"}'::jsonb, 'Barn Door Track Kit 2400mm | DavidEcomm', 'Complete barn door hardware kit with soft-close functionality.', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80', 12, true, true, false, 'sale', '{sale}', 4.5, 14, '2026-02-28T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000016', 'Knurl Cabinet Pull 224mm', 'knurl-cabinet-pull-224mm', 'A knurled cabinet pull that adds crisp texture to joinery and wardrobes.', 5900, '00000000-0000-0000-0000-000000000205', 'DAV-CP-224', 'DavidEcomm Hardware', '{"finish":"Brushed Brass","center":"224mm"}'::jsonb, 'Knurl Cabinet Pull 224mm | DavidEcomm', 'A knurled cabinet pull that adds crisp texture to joinery and wardrobes.', 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=80', 36, true, true, false, null, '{essential}', 4.7, 19, '2026-04-22T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000017', 'Casement Window Latch Set', 'casement-window-latch-set', 'Elegant latch set for casement windows with smooth operation and concealed fixings.', 12900, '00000000-0000-0000-0000-000000000206', 'DAV-WH-120', 'DavidEcomm Hardware', '{"finish":"Bronze","hand":"Universal"}'::jsonb, 'Casement Window Latch Set | DavidEcomm', 'Elegant latch set for casement windows with smooth operation and concealed fixings.', 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=1200&q=80', 16, true, true, false, 'new', '{new}', 4.4, 4, '2026-07-15T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000018', 'Haven Fireclay Butler Sink', 'haven-fireclay-butler-sink', 'Classic butler sink with generous depth and durable glazed fireclay construction.', 99900, '00000000-0000-0000-0000-000000000301', 'DAV-KS-800', 'DavidEcomm Atelier', '{"width":"800mm","installation":"Apron Front"}'::jsonb, 'Haven Fireclay Butler Sink | DavidEcomm', 'Classic butler sink with generous depth and durable glazed fireclay construction.', 'https://images.unsplash.com/photo-1564540583246-934409427776?auto=format&fit=crop&w=1200&q=80', 11, true, true, false, 'best_seller', '{premium,best-sellers}', 4.9, 33, '2026-06-06T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000019', 'Aspen Pull-Out Sink Mixer', 'aspen-pull-out-sink-mixer', 'Multi-function kitchen mixer with pull-out spray and flexible hose.', 47900, '00000000-0000-0000-0000-000000000302', 'DAV-KT-510', 'DavidEcomm Select', '{"finish":"Brushed Nickel","function":"Pull-Out Spray"}'::jsonb, 'Aspen Pull-Out Sink Mixer | DavidEcomm', 'Multi-function kitchen mixer with pull-out spray and flexible hose.', 'https://images.unsplash.com/photo-1582582429416-c0f5e2f1ff8e?auto=format&fit=crop&w=1200&q=80', 17, true, true, false, null, '{best-value}', 4.6, 17, '2026-06-16T00:00:00Z'),
  ('20000000-0000-0000-0000-000000000020', 'Utility 45L Laundry Tub Cabinet', 'utility-45l-laundry-tub-cabinet', 'Hardwearing laundry tub cabinet with stainless bowl and storage shelf.', 64900, '00000000-0000-0000-0000-000000000303', 'DAV-LT-450', 'DavidEcomm Select', '{"capacity":"45L","finish":"White Cabinet"}'::jsonb, 'Utility 45L Laundry Tub Cabinet | DavidEcomm', 'Hardwearing laundry tub cabinet with stainless bowl and storage shelf.', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80', 13, true, true, false, 'sale', '{sale,essential}', 4.4, 10, '2026-04-30T00:00:00Z')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category_id = excluded.category_id,
  sku = excluded.sku,
  brand = excluded.brand,
  attributes = excluded.attributes,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  og_image_url = excluded.og_image_url,
  stock_quantity = excluded.stock_quantity,
  in_stock = excluded.in_stock,
  active = excluded.active,
  featured = excluded.featured,
  badge = excluded.badge,
  collection_slugs = excluded.collection_slugs,
  rating = excluded.rating,
  review_count = excluded.review_count,
  created_at = excluded.created_at;

insert into product_images (id, product_id, url, alt_text, sort_order)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80', 'Avila 1500 Fluted Oak Vanity', 0),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', 'Lina 900 Wall Hung Vanity', 0),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80', 'Carrara 1200 Floor Standing Vanity', 0),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80', 'Serra Brushed Brass Basin Mixer', 0),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1620735692151-26a7e0748429?auto=format&fit=crop&w=1200&q=80', 'Orion Rimless Wall Faced Toilet Suite', 0),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80', 'Mila Stone Composite Vessel Basin', 0),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000007', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=80', 'Lucent Rain Shower Rail Set', 0),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80', 'Solis 1700 Freestanding Bath', 0),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1620735692151-26a7e0748429?auto=format&fit=crop&w=1200&q=80', 'Lumen Backlit LED Mirror', 0),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&w=1200&q=80', 'Knurled Brass Double Towel Rail', 0),
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=1200&q=80', 'Linear Brushed Steel Floor Grate', 0),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000012', 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80', 'Axton Matte Black Lever Handle Set', 0),
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000013', 'https://images.unsplash.com/photo-1600566753051-f0b74ff74d27?auto=format&fit=crop&w=1200&q=80', 'Harper Satin Brass Privacy Set', 0),
  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000014', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80', 'Atelier Concealed Pivot Hinge', 0),
  ('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80', 'Barn Door Track Kit 2400mm', 0),
  ('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000016', 'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=1200&q=80', 'Knurl Cabinet Pull 224mm', 0),
  ('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000017', 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=1200&q=80', 'Casement Window Latch Set', 0),
  ('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000018', 'https://images.unsplash.com/photo-1564540583246-934409427776?auto=format&fit=crop&w=1200&q=80', 'Haven Fireclay Butler Sink', 0),
  ('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000019', 'https://images.unsplash.com/photo-1582582429416-c0f5e2f1ff8e?auto=format&fit=crop&w=1200&q=80', 'Aspen Pull-Out Sink Mixer', 0),
  ('30000000-0000-0000-0000-000000000020', '20000000-0000-0000-0000-000000000020', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80', 'Utility 45L Laundry Tub Cabinet', 0)
on conflict (id) do update set
  product_id = excluded.product_id,
  url = excluded.url,
  alt_text = excluded.alt_text,
  sort_order = excluded.sort_order;
