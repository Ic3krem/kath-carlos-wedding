-- OPTIONAL. Run in the Supabase SQL Editor after migration 009 to REPLACE the
-- entourage AND the Our Story milestones with the copy from the 2026 redesign.
-- This deletes every existing row in those two tables first — skip it if you
-- have already entered the real content in /admin.
--
-- Columns the public page reads:
--   parents            side groom / bride            -> "Parents of the Groom / Bride"
--   officiant                                         -> "Officiant Pastor"
--   godparents         side groom = left, bride = right
--   maid_of_honor / best_man                          -> "Bride's Best" / "Groom's Bests"
--   ceremony_sponsors  role_label = the pair's title, side groom = groomsman, bride = bridesmaid
--   ring/coin/bible_bearer, flower_girls

begin;
delete from entourage_members;
insert into entourage_members (category, role_label, name, side, sort_order) values
  ('parents', 'Father of the Groom', 'Mr. Nestor Diaz', 'groom', 0),
  ('parents', 'Mother of the Groom', 'Mrs. Ma. Criste Diaz', 'groom', 1),
  ('parents', 'Father of the Bride', 'Mr. Orlando Gloria', 'bride', 2),
  ('parents', 'Mother of the Bride', 'Mrs. Laura Gloria', 'bride', 3),

  ('officiant', 'Officiant Pastor', 'Ptr. Rodel Reyes', null, 5),

  ('godparents', 'Ninong', 'Mr. Dennis Velasco', 'groom', 10),
  ('godparents', 'Ninong', 'Mr. Crisanto Salvador', 'groom', 11),
  ('godparents', 'Ninong', 'Hon. Florante Malimban', 'groom', 12),
  ('godparents', 'Ninong', 'Mr. Larry Gloria', 'groom', 13),
  ('godparents', 'Ninong', 'Mr. Rene Torres', 'groom', 14),
  ('godparents', 'Ninong', 'Mr. Alvin Cervantes', 'groom', 15),
  ('godparents', 'Ninong', 'Mr. Sherwin Punzalan', 'groom', 16),
  ('godparents', 'Ninong', 'Mr. Joven Gloria', 'groom', 17),
  ('godparents', 'Ninang', 'Mrs. Marites Velches', 'bride', 20),
  ('godparents', 'Ninang', 'Mrs. Gina Zalavaria', 'bride', 21),
  ('godparents', 'Ninang', 'Mrs. Josa Diwata', 'bride', 22),
  ('godparents', 'Ninang', 'Mrs. Vilma Cioco', 'bride', 23),
  ('godparents', 'Ninang', 'Mrs. Michelle Binajbaj', 'bride', 24),
  ('godparents', 'Ninang', 'Mrs. Guada Buena', 'bride', 25),
  ('godparents', 'Ninang', 'Mrs. Carolyn Reyes', 'bride', 26),
  ('godparents', 'Ninang', 'Mrs. Cherry Ann Inocencio', 'bride', 27),

  ('maid_of_honor', 'Maid of Honor', 'Ms. Demi Francheska Gloria', null, 30),
  ('best_man', 'Best Man', 'Mr. John Cedrik Diaz', null, 31),
  ('best_man', 'Best Man', 'Mr. John Christopher Diaz', null, 32),

  ('ceremony_sponsors', 'To clothe us as One', 'Karlo Macagba', 'groom', 40),
  ('ceremony_sponsors', 'To clothe us as One', 'Kesia Jamel Corton', 'bride', 41),
  ('ceremony_sponsors', 'To bind us together', 'Jhontrix Catorce', 'groom', 42),
  ('ceremony_sponsors', 'To bind us together', 'Casielyn Marquez', 'bride', 43),
  ('ceremony_sponsors', 'To light our path', 'Kristian Abines', 'groom', 44),
  ('ceremony_sponsors', 'To light our path', 'Aira Mariz Delfinado', 'bride', 45),
  ('ceremony_sponsors', 'To Remove the Veil', 'Rhobert Medilo', 'groom', 46),
  ('ceremony_sponsors', 'To Remove the Veil', 'Cynthialyn Toledo', 'bride', 47),
  ('ceremony_sponsors', 'To Remain the Cord', 'Angelo Salayog', 'groom', 48),
  ('ceremony_sponsors', 'To Remain the Cord', 'Recelyn Licaroz', 'bride', 49),

  ('ring_bearer', 'Ring Bearer', 'Zane Ekon Delfinado', null, 50),
  ('coin_bearer', 'Coin Bearer', 'Gavin Rhylle O. Medilo', null, 51),
  ('bible_bearer', 'Bible Bearer', 'David Asher Malabanan', null, 52),

  ('flower_girls', 'Flower Girl', 'Christine Abines', 'bride', 60),
  ('flower_girls', 'Flower Girl', 'Ariella Reyes', 'bride', 61),
  ('flower_girls', 'Flower Girl', 'Fiona Reyes', 'bride', 62),
  ('flower_girls', 'Flower Girl', 'Sofia Mac Escario', 'bride', 63),
  ('flower_girls', 'Flower Girl', 'Desiree Ann Abines', 'bride', 64),
  ('flower_girls', 'Flower Girl', 'Ilya Nikolai Gloria', 'bride', 65),
  ('flower_girls', 'Flower Girl', 'Avianna Maxine Toledo', 'bride', 66);

delete from story_milestones;
insert into story_milestones (era, place, title, body, quote, image_url, caption, sort_order) values
  ('2019', 'Mariveles, Bataan', 'From NearGroup to Forever',
   'We took shelter under the same awning during a sudden October downpour. One shared table, two cups of barako, and three hours of talking about old films and older songs — and the compass was set.',
   'We knew within minutes that we had met the person we had been looking for all along.',
   '/story/story1.webp', 'Where it started — Alasasin 2019', 0),
  ('Summer 2021', 'Romalaines, Mariveles', 'March 10, 2021: Our Official Beginning',
   'We climbed before dawn and watched the bay turn gold from the ridge. Somewhere between the coffee and the long walk down, we promised each other that whatever came next, we would take it together.',
   'The mountain gave us our first real quiet — and we have been chasing it ever since.',
   '/story/story2.webp', 'Romalaines — Summer 2021', 1),
  ('December 2025', 'Balanga, Bataan', 'The Day She Said Yes to Forever',
   'On the shore below the church where we will marry, with family hiding badly behind the trees, the question was asked. It was answered before it was finished.',
   'A quiet promise by the water, and the beginning of everything after.',
   '/story/story3.webp', 'One Question, One Answer, Forever — December 2025', 2);
commit;
