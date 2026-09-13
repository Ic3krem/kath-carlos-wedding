-- Run this in the Supabase SQL Editor.
-- Widens the entourage category list so every role in the reference layout has
-- its own group, and seeds a sample entourage so the section renders out of the
-- box. The sample rows only insert when the table is still empty.

-- 1. Replace the three-value category check with the full role list.
alter table entourage_members drop constraint if exists entourage_members_category_check;
alter table entourage_members add constraint entourage_members_category_check
  check (category in (
    'parents',
    'godparents',
    'best_man',
    'maid_of_honor',
    'groomsmen',
    'bridesmaids',
    'flower_girls',
    'ring_bearer',
    'coin_bearer',
    'bible_bearer',
    'other'
  ));

-- 2. Sample entourage. `side` drives the left/right columns on the public page:
--    groom = left, bride = right. Placeholder names — edit them in /admin/entourage.
insert into entourage_members (category, role_label, name, side, sort_order)
select * from (values
  ('parents', 'Father of the Groom', 'Mr. Ramon A. Reyes', 'groom', 0),
  ('parents', 'Mother of the Groom', 'Mrs. Lourdes A. Reyes', 'groom', 1),
  ('parents', 'Father of the Bride', 'Mr. Eduardo P. Santos', 'bride', 2),
  ('parents', 'Mother of the Bride', 'Mrs. Teresita P. Santos', 'bride', 3),

  ('godparents', 'Ninong', 'Mr. Roberto Dela Cruz', 'groom', 10),
  ('godparents', 'Ninong', 'Mr. Manuel Aguilar', 'groom', 11),
  ('godparents', 'Ninong', 'Mr. Rodrigo Villanueva', 'groom', 12),
  ('godparents', 'Ninong', 'Mr. Mario Bautista', 'groom', 13),
  ('godparents', 'Ninong', 'Mr. Wilfredo Navarro', 'groom', 14),
  ('godparents', 'Ninong', 'Mr. Joel Marquez', 'groom', 15),
  ('godparents', 'Ninong', 'Mr. Aries Salvador', 'groom', 16),
  ('godparents', 'Ninang', 'Mrs. Rochelle Dela Cruz', 'bride', 17),
  ('godparents', 'Ninang', 'Mrs. Joana Aguilar', 'bride', 18),
  ('godparents', 'Ninang', 'Mrs. Maria Teresa Villanueva', 'bride', 19),
  ('godparents', 'Ninang', 'Mrs. Evangeline Bautista', 'bride', 20),
  ('godparents', 'Ninang', 'Mrs. Regina Navarro', 'bride', 21),
  ('godparents', 'Ninang', 'Mrs. Guia Marquez', 'bride', 22),
  ('godparents', 'Ninang', 'Mrs. Vina Salvador', 'bride', 23),

  ('best_man', 'Best Man', 'Mr. Miguel A. Reyes', null, 30),
  ('maid_of_honor', 'Maid of Honor', 'Ms. Patricia S. Santos', null, 31),

  ('groomsmen', 'Groomsman', 'Mr. Julian Cruz', 'groom', 40),
  ('groomsmen', 'Groomsman', 'Mr. Francis Dizon', 'groom', 41),
  ('groomsmen', 'Groomsman', 'Mr. Christian Ilagan', 'groom', 42),
  ('bridesmaids', 'Bridesmaid', 'Ms. Rhea Calma', 'bride', 43),
  ('bridesmaids', 'Bridesmaid', 'Ms. Denise Fajardo', 'bride', 44),
  ('bridesmaids', 'Bridesmaid', 'Ms. Abigail Manalo', 'bride', 45),

  ('ring_bearer', 'Ring Bearer', 'Stephen Miguel Lopez', 'groom', 50),
  ('bible_bearer', 'Bible Bearer', 'Nathan Brielle Lim', 'groom', 51),
  ('coin_bearer', 'Coin Bearer', 'Jacob Reyes', 'groom', 52),
  ('coin_bearer', 'Coin Bearer', 'Caleb Christopher Reyes', 'groom', 53),

  ('flower_girls', 'Flower Girl', 'Sofia Reyes', 'bride', 60),
  ('flower_girls', 'Flower Girl', 'Faith Santos', 'bride', 61),
  ('flower_girls', 'Flower Girl', 'Ayah Cruz', 'bride', 62),
  ('flower_girls', 'Flower Girl', 'Daniella Lim', 'bride', 63),
  ('flower_girls', 'Flower Girl', 'Jasmine Tolentino', 'bride', 64)
) as seed(category, role_label, name, side, sort_order)
where not exists (select 1 from entourage_members);
