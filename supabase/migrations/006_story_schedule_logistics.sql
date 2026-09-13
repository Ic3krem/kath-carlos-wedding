-- Run this in the Supabase SQL Editor.
-- Adds the content the editorial sections need: dated story milestones, the
-- weekend itinerary, and the practical guest notes. Each table seeds sample
-- rows only while it is empty, so re-running is safe.

-- 1. Our Story milestones ---------------------------------------------------
create table if not exists story_milestones (
  id uuid primary key default gen_random_uuid(),
  era text not null default '',
  place text not null default '',
  title text not null default '',
  body text not null default '',
  quote text not null default '',
  image_url text,
  caption text not null default '',
  sort_order int not null default 0
);
alter table story_milestones enable row level security;

insert into story_milestones (era, place, title, body, quote, caption, sort_order)
select * from (values
  ('Autumn 2019', 'Angeles City, Pampanga', 'A Rainy Afternoon on Fields Avenue',
   'We took shelter under the same awning during a sudden October downpour. One shared table, two cups of barako, and three hours of talking about old films and older songs — and the compass was set.',
   'We knew within minutes that we had met the person we had been looking for all along.',
   'Where it started — Autumn 2019', 0),
  ('Summer 2021', 'Mariveles, Bataan', 'Sunrise at the Foot of Mt. Tarak',
   'We climbed before dawn and watched the bay turn gold from the ridge. Somewhere between the coffee and the long walk down, we promised each other that whatever came next, we would take it together.',
   'The mountain gave us our first real quiet — and we have been chasing it ever since.',
   'Mt. Tarak ridge — Summer 2021', 1),
  ('Winter 2024', 'Alasasin, Bataan', 'A Question by the Water',
   'On the shore below the church where we will marry, with family hiding badly behind the trees, the question was asked. It was answered before it was finished.',
   'A quiet promise by the water, and the beginning of everything after.',
   'Alasasin shore — December 2024', 2)
) as seed(era, place, title, body, quote, caption, sort_order)
where not exists (select 1 from story_milestones);

-- 2. Weekend itinerary ------------------------------------------------------
create table if not exists schedule_events (
  id uuid primary key default gen_random_uuid(),
  day_label text not null default '',
  date_label text not null default '',
  title text not null default '',
  time_label text not null default '',
  body text not null default '',
  attire text not null default '',
  /** newline-separated "time|what" rows; used instead of body when present */
  agenda text not null default '',
  is_highlight boolean not null default false,
  sort_order int not null default 0
);
alter table schedule_events enable row level security;

insert into schedule_events (day_label, date_label, title, time_label, body, attire, agenda, is_highlight, sort_order)
select * from (values
  ('Day I', 'Friday', 'Welcome Merienda', '4:00 PM - 8:00 PM',
   'Join us at Mt. Tarak Guest House for pancit, lechon kawali and cold drinks as everyone arrives. No programme, no seating chart — just the first hellos.',
   'Smart casual', '', false, 0),
  ('Day II', 'Saturday', 'The Wedding Day', '',
   '', 'Formal / Filipiniana-inspired',
   '2:00 PM|Guests seated - Alasasin Church of Christ
3:00 PM|Ceremony
5:00 PM|Cocktails and photos - Mt. Tarak garden
6:30 PM|Dinner and programme
9:00 PM|Dancing until the lights go out', true, 1),
  ('Day III', 'Sunday', 'Send-off Breakfast', '8:00 AM - 11:00 AM',
   'Silog, fresh pandesal and coffee by the garden before everyone heads home. Come as late as you like.',
   'However you woke up', '', false, 2)
) as seed(day_label, date_label, title, time_label, body, attire, agenda, is_highlight, sort_order)
where not exists (select 1 from schedule_events);

-- 3. Practical guest notes --------------------------------------------------
create table if not exists logistics (
  id int primary key default 1,
  dress_note text not null default '',
  stay_title text not null default '',
  stay_body text not null default '',
  travel_title text not null default '',
  travel_body text not null default '',
  constraint logistics_singleton check (id = 1)
);
alter table logistics enable row level security;
insert into logistics (id) values (1) on conflict (id) do nothing;

update logistics set
  dress_note = coalesce(nullif(dress_note, ''), 'We are keeping it formal with a Filipiniana heart. Barong or a dark suit for the gentlemen; a long dress or a modern terno for the ladies. Kindly leave white and ivory to the bride.'),
  stay_title = coalesce(nullif(stay_title, ''), 'Where to Stay'),
  stay_body = coalesce(nullif(stay_body, ''), 'Rooms are held at Mt. Tarak Guest House and at the inns along Alasasin Road under the name CAYANAN-LIM. Please book before the 1st of the month prior — the town fills up on weekends.'),
  travel_title = coalesce(nullif(travel_title, ''), 'Getting There'),
  travel_body = coalesce(nullif(travel_body, ''), 'Mariveles is roughly three hours from Manila via NLEX and the Roman Highway, or by ferry from Manila to Orion and a short drive down. Shuttles will run between the guest house and the church before and after the ceremony.')
where id = 1;
