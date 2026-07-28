-- Update top banner: remove "FREE" from promo text and set international phone format.
update site_config
set
  promo_text = 'SHIPPING AUSTRALIA WIDE*',
  phone = '+61412615143'
where id = 1;
