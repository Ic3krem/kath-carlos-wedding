-- Run this in the Supabase SQL Editor (after 009).
-- Adds the entourage members from the design that are not in the database:
-- three groomsman/bridesmaid pairs and the officiant. Anyone already present
-- (matched by name, ignoring case) is skipped, so re-running is safe.
-- The new pairs are placed before the existing ones, in the design's order:
--   To clothe us as One, To bind us together, To light our path,
--   then the existing To Remove the Veil and To Remain the Cord.

with base as (
  select coalesce(min(sort_order), 40) as b
  from entourage_members
  where category in ('groomsmen', 'bridesmaids')
),
seed(category, role_label, name, side, pos) as (
  values
    ('groomsmen',   'To clothe us as One', 'Mr. Karlo Macagba',          'groom', 1),
    ('groomsmen',   'To bind us together', 'Mr. Jhontrix Catorce',       'groom', 2),
    ('groomsmen',   'To light our path',   'Mr. Kristian Abines',        'groom', 3),
    ('bridesmaids', 'To clothe us as One', 'Ms. Kesia Jamel Corton',     'bride', 1),
    ('bridesmaids', 'To bind us together', 'Ms. Casielyn Marquez',       'bride', 2),
    ('bridesmaids', 'To light our path',   'Ms. Aira Mariz Delfinado',   'bride', 3)
)
insert into entourage_members (category, role_label, name, side, sort_order)
select s.category, s.role_label, s.name, s.side, base.b - 4 + s.pos
from seed s, base
where not exists (
  select 1 from entourage_members e
  where lower(regexp_replace(e.name, '^(mr|ms|mrs)\.?\s+', '', 'i'))
      = lower(regexp_replace(s.name, '^(mr|ms|mrs)\.?\s+', '', 'i'))
);

insert into entourage_members (category, role_label, name, side, sort_order)
select 'officiant', 'Officiant Pastor', 'Ptr. Rodel Reyes', null, 5
where not exists (select 1 from entourage_members where category = 'officiant');
