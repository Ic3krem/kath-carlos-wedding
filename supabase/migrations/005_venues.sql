-- Run this in the Supabase SQL Editor.
-- The wedding has two locations, so the single maps_address / maps_embed_url
-- pair becomes a ceremony block and a reception block. The old columns stay in
-- place as the fallback for sites that never fill the new ones in.

alter table settings add column if not exists ceremony_name text;
alter table settings add column if not exists ceremony_address text;
alter table settings add column if not exists ceremony_embed_url text;
alter table settings add column if not exists reception_name text;
alter table settings add column if not exists reception_address text;
alter table settings add column if not exists reception_embed_url text;

-- Seed the actual venues, but never overwrite values already entered in /admin.
update settings set
  ceremony_name = coalesce(ceremony_name, 'Alasasin Church of Christ'),
  ceremony_address = coalesce(ceremony_address, 'Alasasin, Mariveles, Bataan'),
  ceremony_embed_url = coalesce(
    ceremony_embed_url,
    'https://www.google.com/maps?q=Alasasin+Church+of+Christ,+Mariveles,+Bataan&output=embed'
  ),
  reception_name = coalesce(reception_name, 'Mt. Tarak Guest House and Restaurant'),
  reception_address = coalesce(reception_address, 'Alasasin, Mariveles, Bataan'),
  reception_embed_url = coalesce(
    reception_embed_url,
    'https://www.google.com/maps?q=Mt.+Tarak+Guest+House+and+Restaurant,+Mariveles,+Bataan&output=embed'
  )
where id = 1;
