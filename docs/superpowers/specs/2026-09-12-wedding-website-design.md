# Wedding Website — Design Spec

Date: 2026-09-12

## Overview

A single-page wedding website (Kath & Carlos) built from the Figma design
(`AcVqr5UPVvQkk3DbpeYs4A`, node `22:15`), with a password-gated admin panel
at `/admin` for managing all editable content and RSVP responses. Deployed
to Vercel; developed and testable locally first.

## Stack

- **Framework:** Next.js 14 (App Router), TypeScript
- **Styling:** Tailwind CSS (matches the Figma-generated reference code)
- **Database:** Supabase (Postgres) — used directly via `@supabase/supabase-js`,
  no ORM. Local dev runs against a hosted (free-tier) Supabase project —
  no local Postgres/Docker needed.
- **Image storage:** Vercel Blob (`@vercel/blob`) for all uploaded images
  (hero background, our-story photo, entourage/gallery photos)
- **Admin auth:** single shared admin password. Password hash stored in an
  env var (`ADMIN_PASSWORD_HASH`). Login route verifies and sets a signed,
  httpOnly session cookie; Next.js middleware protects all `/admin/*` routes
  and `/api/admin/*` routes.
- **Hosting:** Vercel (primary target). Runs locally via `next dev` first.

## Page structure (single page, `/`)

All sections render top-to-bottom on one page, matching the Figma frame
order:

1. **Hero** — couple names, background image, "Get Started" CTA (scrolls to
   Our Story) and an "RSVP" trigger (opens the RSVP modal — see below).
2. **Live Countdown** — client component, ticks down to `wedding_date` from
   `settings`, computed client-side from the stored date (months/weeks/days/
   hours/minutes/seconds, matching the Figma layout).
3. **Our Story** — image, title ("How we Begin"), excerpt text, "Continue
   Reading" button that opens a **modal** with the full story text.
4. **Gallery** — grid of images (`gallery_images`), admin-managed.
5. **Entourage** — grouped list: Parents, Godparents/Principal Sponsors,
   Other, each with name + role + side (bride/groom), admin-managed.
6. **Maps** — embedded Google Maps iframe using the stored venue address/
   embed URL.
7. **RSVP** — NOT an inline section. Triggered via a button (present in the
   Hero and/or a persistent nav) that opens a **modal** containing the RSVP
   form. Submits to an API route that inserts into `rsvps`.
8. **Theme** — not a visible section; a global style layer (color palette /
   font pairing) selected in admin `settings.theme` and applied via a
   CSS-variable class on the page root.

## Admin panel (`/admin`)

- `/admin/login` — password form, sets session cookie on success.
- `/admin` — dashboard with links to each editor below.
- **Site Settings editor** — couple names, wedding date/time, hero image
  (upload), theme picker, maps address + embed URL.
- **Our Story editor** — image (upload), title, excerpt, full story (rich
  text/plain textarea), button label.
- **Entourage editor** — add/edit/remove members: name, role label,
  category (parents/godparents/other), side (bride/groom), sort order.
- **Gallery manager** — upload/remove images, captions, sort order.
- **RSVP dashboard** — table of all responses (name, email, phone,
  attending, guest count, meal preference, message, submitted date), with
  CSV export.

All admin editors write directly to Supabase via API routes protected by
the same session-cookie middleware. Public page reads are server-rendered
(`dynamic = 'force-dynamic'`, or revalidated via `revalidatePath` after an
admin save) so edits appear immediately without a rebuild.

## Data model (Supabase Postgres)

```sql
-- singleton row (id = 1)
settings (
  id int primary key default 1,
  couple_names text,
  wedding_date timestamptz,
  hero_image_url text,
  theme text,               -- e.g. 'classic-green', 'blush', etc.
  maps_address text,
  maps_embed_url text
)

-- singleton row (id = 1)
our_story (
  id int primary key default 1,
  image_url text,
  title text,
  excerpt text,
  full_story text,
  button_label text
)

entourage_members (
  id uuid primary key default gen_random_uuid(),
  category text,            -- 'parents' | 'godparents' | 'other'
  role_label text,          -- e.g. "Mother of the Bride"
  name text,
  side text,                -- 'bride' | 'groom' | null
  sort_order int
)

gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  caption text,
  sort_order int
)

rsvps (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  attending boolean,
  guest_count int,
  meal_preference text,
  message text,
  created_at timestamptz default now()
)
```

## RSVP modal

- Opened from a button in the Hero (and optionally a fixed nav) — not an
  inline page section.
- Fields: name, email, phone, attending (yes/no), guest count, meal
  preference, message.
- Submits via `POST /api/rsvp`, inserts into `rsvps`, shows a success state
  in the modal.

## Image uploads

Admin upload widgets `POST` to `/api/admin/upload`, which calls
`@vercel/blob`'s `put()` and returns the resulting URL; the admin form then
saves that URL into the relevant Supabase row.

## Setup requirements (external services, user-provided)

- A Supabase project (free tier is enough): `SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- A Vercel Blob token: `BLOB_READ_WRITE_TOKEN`.
- `ADMIN_PASSWORD_HASH` — a bcrypt hash of the chosen admin password.

These will be documented in a README with exact steps (where to find each
value in the Supabase/Vercel dashboards) since they can't be created by the
agent.

## Responsiveness & dynamic content

- **Responsive:** every section (Hero, Countdown, Our Story, Gallery,
  Entourage, Maps, RSVP modal, and all `/admin` editors) must be built
  mobile-first with Tailwind breakpoints — single-column stacked layouts on
  mobile, matching the Figma desktop layout at `md`/`lg` widths. No fixed
  pixel widths that break below ~375px; images/embeds scale fluidly.
- **Dynamic:** no hardcoded content in components. All couple names, dates,
  images, story text, entourage members, gallery images, theme, and maps
  data are read from Supabase at request time, so admin edits reflect on
  the public page without a redeploy. The countdown itself computes
  dynamically client-side from the stored `wedding_date`.

## Out of scope

- Multi-user admin accounts (single shared password only).
- Payment/gift registry integration.
- Multi-language support.
