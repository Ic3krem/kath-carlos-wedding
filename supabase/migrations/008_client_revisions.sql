-- Run this in the Supabase SQL Editor.
-- Client revision pass: ceremony sponsors (light/veil/cord), split dress-code
-- copy for entourage vs guests, RSVP due date + hero message, per-invitee
-- guest caps, and RSVPs without email/phone.

-- 1. Entourage: widen the category list to add the ceremony sponsors.
alter table entourage_members drop constraint if exists entourage_members_category_check;
alter table entourage_members add constraint entourage_members_category_check
  check (category in (
    'parents', 'godparents', 'best_man', 'maid_of_honor', 'groomsmen',
    'bridesmaids', 'flower_girls', 'ring_bearer', 'coin_bearer',
    'bible_bearer', 'ceremony_sponsors', 'other'
  ));

-- 2. Theme details: separate entourage attire from guest attire, plus the
--    guest notes shown under the guest attire (colours, what to avoid, comfort).
alter table theme_details add column if not exists godparents_gentlemen_detail text not null default '';
alter table theme_details add column if not exists godparents_ladies_detail text not null default '';
alter table theme_details add column if not exists guest_note text not null default '';
alter table theme_details add column if not exists avoid_note text not null default '';
alter table theme_details add column if not exists comfort_note text not null default '';

update theme_details set
  godparents_gentlemen_detail = coalesce(nullif(godparents_gentlemen_detail, ''), 'Black suit and pants, tie'),
  godparents_ladies_detail = coalesce(nullif(godparents_ladies_detail, ''), 'Formal gown in the wedding colours'),
  guest_note = coalesce(nullif(guest_note, ''), 'We encourage everyone to dress according to our wedding colors and the overall style of the event.'),
  avoid_note = coalesce(nullif(avoid_note, ''), 'Please refrain from wearing white, denim, and slippers.'),
  comfort_note = coalesce(nullif(comfort_note, ''), 'Most importantly, wear something you feel comfortable and confident in, while complementing on our wedding theme.')
where id = 1;

-- 3. Settings: RSVP due date + the hero message shown above the RSVP button.
alter table settings add column if not exists rsvp_due_date timestamptz;
alter table settings add column if not exists hero_message text not null default '';

update settings set
  hero_message = coalesce(nullif(hero_message, ''), 'By God''s grace, and surrounded by your love, we, together with our families, invite you to celebrate our marriage.')
where id = 1;

-- 4. Per-invitee guest allocation: the guest types their full name on the
--    RSVP form (no dropdown); the server looks it up here to cap their party
--    size instead of letting them enter any number.
create table if not exists invite_allocations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  max_guests int not null default 1,
  sort_order int not null default 0
);
alter table invite_allocations enable row level security;

-- 5. RSVPs: email and phone are no longer collected on the public form.
alter table rsvps alter column email drop not null;
