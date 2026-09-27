-- Run this in the Supabase SQL Editor (after 010).
-- The RSVP guest list: name + how many companions each invitee may bring.
-- Existing names (matched ignoring case/extra spaces) get their number
-- updated; new names are added. Nobody is deleted. Safe to re-run.
-- 63 invitees, 72 companion seats, 135 seats in total.

with seed(name, companions_allowed, pos) as (
  values
    ('Rodel Reyes', 4, 0),
    ('Marites Velches', 0, 1),
    ('Gina Zalavaria', 1, 2),
    ('Vilma Cioco', 2, 3),
    ('Michelle Binajbaj', 1, 4),
    ('Cherry Ann Inocencio', 2, 5),
    ('Guada Buena', 1, 6),
    ('Jessa Diwata', 2, 7),
    ('Larry Gloria', 1, 8),
    ('Joven Gloria', 1, 9),
    ('Dennis Velasco', 3, 10),
    ('Cris Salvador', 1, 11),
    ('Alvin Cervantes', 1, 12),
    ('Rene Torres', 1, 13),
    ('Sherwin Punzalan', 1, 14),
    ('Florante Malimban', 1, 15),
    ('Kesia Jamel Corton', 0, 16),
    ('Casielyn Marquez', 0, 17),
    ('Aira Mariz Delfinado', 1, 18),
    ('Cynthialyn Toledo', 3, 19),
    ('Recelyn Licaroz', 0, 20),
    ('Angelo Salayog', 0, 21),
    ('Kristian Abines', 3, 22),
    ('Rhobert Medilo', 2, 23),
    ('Jhontrix Catorce', 0, 24),
    ('Glen Barba', 3, 25),
    ('Roniel Diaz', 5, 26),
    ('Reziel Datiles', 5, 27),
    ('Talyn Diaz', 0, 28),
    ('Jay Velches', 0, 29),
    ('Robert Diaz', 0, 30),
    ('Fredelie Tarnate', 2, 31),
    ('Patrick Flores', 0, 32),
    ('Jethro Rosillon', 0, 33),
    ('Jerome Quintana', 1, 34),
    ('Mimi Vallinas', 0, 35),
    ('Judina Benjamin', 2, 36),
    ('Francine Napao', 0, 37),
    ('Katrina Padilla', 0, 38),
    ('Hazel Reyes', 2, 39),
    ('Lailanie Reyes', 1, 40),
    ('Gabriel Reyes', 1, 41),
    ('Apple Reyes', 1, 42),
    ('Angel Grace Reyes', 2, 43),
    ('Godofredo Gloria', 2, 44),
    ('Joko Gloria', 2, 45),
    ('Les Paul Gloria', 0, 46),
    ('Shane Gloria', 1, 47),
    ('Cynthia Martin', 1, 48),
    ('King Dave G. Martin', 1, 49),
    ('Jeremie Gloria', 0, 50),
    ('Jaycel B. Fernandez', 1, 51),
    ('Kaitleen Dela Cruz', 0, 52),
    ('Lylene Rose A. Rosales', 0, 53),
    ('Erlyn Joy Desuyo', 0, 54),
    ('Monica Reyes', 2, 55),
    ('Jhenin E. Ramones', 0, 56),
    ('Marx Lenin Sendon', 0, 57),
    ('Apolonia A. Palapar', 1, 58),
    ('Rafael Acebuche', 0, 59),
    ('Marxismo Pineda', 1, 60),
    ('Euegene Malabanan', 1, 61),
    ('Joanne Diwat', 2, 62)
),
updated as (
  update invite_allocations a
  set companions_allowed = s.companions_allowed
  from seed s
  where lower(regexp_replace(trim(a.name), '\s+', ' ', 'g')) = lower(s.name)
  returning a.id
)
insert into invite_allocations (name, companions_allowed, max_guests, sort_order)
select s.name, s.companions_allowed, s.companions_allowed + 1, s.pos
from seed s
where not exists (
  select 1 from invite_allocations a
  where lower(regexp_replace(trim(a.name), '\s+', ' ', 'g')) = lower(s.name)
);
