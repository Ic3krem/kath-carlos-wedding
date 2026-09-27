-- Run this in the Supabase SQL Editor.
-- Redesign pass (dusty-blue single page): officiant role, venue directions,
-- the wedding-day timeline cards, attire copy for life godparents, and
-- gallery blob bookkeeping. Safe to re-run.

-- 1. Entourage: add the officiant.
alter table entourage_members drop constraint if exists entourage_members_category_check;
alter table entourage_members add constraint entourage_members_category_check
  check (category in (
    'parents', 'officiant', 'godparents', 'best_man', 'maid_of_honor', 'groomsmen',
    'bridesmaids', 'flower_girls', 'ring_bearer', 'coin_bearer',
    'bible_bearer', 'ceremony_sponsors', 'other'
  ));

-- 2. Settings: step-by-step directions shown in each venue's "Open Guide"
--    modal (one step per line), and the note under the timeline.
alter table settings add column if not exists ceremony_directions text not null default '';
alter table settings add column if not exists reception_directions text not null default '';
alter table settings add column if not exists timeline_note text not null default '';

update settings set
  timeline_note = coalesce(nullif(timeline_note, ''), 'We will start the program promptly on the scheduled timeline, so we kindly ask that we arrive on time at each part of the celebration — your punctuality is greatly appreciated.')
where id = 1;

-- 3. Wedding-day timeline (the icon cards under When & Where).
create table if not exists timeline_items (
  id uuid primary key default gen_random_uuid(),
  time_label text not null default '',
  label text not null default '',
  icon text not null default 'heart'
    check (icon in ('people', 'church', 'camera', 'dining', 'heart', 'music', 'car', 'ring')),
  sort_order int not null default 0
);
alter table timeline_items enable row level security;

insert into timeline_items (time_label, label, icon, sort_order)
select * from (values
  ('2:00 PM', 'Assembly', 'people', 0),
  ('3:00 PM', 'Wedding Ceremony', 'church', 1),
  ('5:00 PM', 'Pica-Pica and Photoshoot', 'camera', 2),
  ('6:00 PM', 'Reception', 'dining', 3),
  ('9:00 PM', 'End of Program and Send-Off', 'heart', 4)
) as seed(time_label, label, icon, sort_order)
where not exists (select 1 from timeline_items);

-- 4. Attire guide: what life godparents wear.
alter table theme_details add column if not exists life_godparents_detail text not null default '';
update theme_details set
  life_godparents_detail = coalesce(nullif(life_godparents_detail, ''), 'Wedding colours'),
  note = coalesce(nullif(note, ''), 'A guide, not a uniform — anything in these colours is perfect.')
where id = 1;

-- 5. Gift guide copy from the redesign.
update gift_guide set
  intro = coalesce(nullif(intro, ''), 'Your presence at our wedding is the greatest gift of all. However, if you wish to honor us with a gift, a monetary contribution toward our future together would be sincerely appreciated. To assist you, money envelopes will be provided at the reception.')
where id = 1;

