-- Run this in the Supabase SQL Editor.
-- Adds the second Our Story block, gallery shape hints, and makes the
-- Theme / Gift Guide / Footer-contacts sections database-driven.

-- 1. Our Story: second image + second paragraph (reference 2 layout)
alter table our_story add column if not exists image_url_2 text;
alter table our_story add column if not exists excerpt_2 text not null default '';

-- 2. Gallery: optional shape override; null = auto-templated
alter table gallery_images add column if not exists shape text
  check (shape is null or shape in ('square', 'tall', 'wide'));

-- 3. Theme section
create table if not exists theme_details (
  id int primary key default 1,
  headline text not null default '',
  note text not null default '',
  ladies_detail text not null default '',
  gentlemen_detail text not null default '',
  constraint theme_details_singleton check (id = 1)
);
insert into theme_details (id) values (1) on conflict (id) do nothing;

create table if not exists theme_colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  hex text not null,
  sort_order int not null default 0
);

-- 4. Gift Guide section
create table if not exists gift_guide (
  id int primary key default 1,
  intro text not null default '',
  constraint gift_guide_singleton check (id = 1)
);
insert into gift_guide (id) values (1) on conflict (id) do nothing;

create table if not exists gift_options (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  detail text not null default '',
  lines text not null default '',
  sort_order int not null default 0
);

-- 5. Footer contacts
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  name text not null,
  phone text,
  email text,
  sort_order int not null default 0
);

alter table theme_details enable row level security;
alter table theme_colors enable row level security;
alter table gift_guide enable row level security;
alter table gift_options enable row level security;
alter table contacts enable row level security;
