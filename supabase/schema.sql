create table if not exists settings (
  id int primary key default 1,
  couple_names text not null default 'Kath & Carlos',
  wedding_date timestamptz not null default now(),
  hero_image_url text,
  theme text not null default 'classic-green',
  maps_address text,
  maps_embed_url text,
  constraint settings_singleton check (id = 1)
);
insert into settings (id) values (1) on conflict (id) do nothing;

create table if not exists our_story (
  id int primary key default 1,
  image_url text,
  title text not null default 'How we Begin',
  excerpt text not null default '',
  full_story text not null default '',
  button_label text not null default 'Continue Reading',
  constraint our_story_singleton check (id = 1)
);
insert into our_story (id) values (1) on conflict (id) do nothing;

create table if not exists entourage_members (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('parents', 'godparents', 'other')),
  role_label text not null,
  name text not null,
  side text check (side in ('bride', 'groom')),
  sort_order int not null default 0
);

create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  sort_order int not null default 0
);

create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  attending boolean not null,
  guest_count int not null default 1,
  meal_preference text,
  message text,
  created_at timestamptz not null default now()
);

alter table settings enable row level security;
alter table our_story enable row level security;
alter table entourage_members enable row level security;
alter table gallery_images enable row level security;
alter table rsvps enable row level security;
