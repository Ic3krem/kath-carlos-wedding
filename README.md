# Carlos & Kath Wedding Website

Single-page wedding website (dusty-blue 2026 design) built with Next.js 14, Tailwind CSS, Supabase and Vercel Blob, with a password-gated admin panel at `/admin`.

## What the admin can do

| Page | What it edits |
| --- | --- |
| Gallery | Upload photos (many at once), caption, reorder, remove. The first six show on the page, the rest under "View more photos". |
| Guest list | Who can RSVP and how many seats each invitee has (seats include the guest). |
| RSVPs | Every response, with CSV export. A guest who RSVPs again updates their earlier answer. |
| Settings | Names, date/time, hero photo, RSVP deadline, venues, Maps embed and directions. |
| Our Story, Entourage, Timeline, Attire, Gifts | The content of each section. |

Any section that is empty in the database shows the design's own copy, so the site never looks broken.

### Photo compression

Every uploaded image goes through two steps before it is stored in Vercel Blob:

1. **In the browser** — files over 3.5 MB are shrunk to fit through Vercel's 4.5 MB request limit (so full-size camera files work).
2. **On the server** (`src/lib/image/compress.ts`, using `sharp`) — rotated upright, stripped of metadata (including GPS), resized to 2000 px on the longest edge (2400 px for the hero), and saved as WebP. A 20 MB camera JPEG usually ends up around 300–500 KB.

Removing a photo from the gallery also deletes its file from Blob storage.

## Setup

1. Install dependencies: `npm install`
2. Create a Supabase project. Copy the **Project URL**, **anon** and **service_role** keys into `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
3. In the Supabase **SQL Editor**, run `supabase/schema.sql`, then every file in `supabase/migrations/` in order (`002` … `009`).
   - Optional: `supabase/seed/content_2026.sql` **replaces** the entourage and Our Story rows with the names and copy from the 2026 design.
4. Create a Vercel Blob store (Vercel → Storage → Blob) and connect it to the project; it provides `BLOB_READ_WRITE_TOKEN`.
5. Generate the admin password hash:
   `node -e "require('bcryptjs').hash(process.argv[1], 10).then(console.log)" "your-password"` → `ADMIN_PASSWORD_HASH`
6. Generate a session secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` → `SESSION_SECRET`
7. Copy `.env.local.example` to `.env.local`, fill in the values, run `npm run dev`, and open `http://localhost:3000` and `/admin`.

## Testing

`npm test` runs the Vitest suite (utilities, auth, RSVP matching, image compression and all API routes).

## Deploying

The GitHub repo is connected to Vercel, so pushing to `main` deploys. Keep the six environment variables above set in Vercel → Settings → Environment Variables, and run any new migration in Supabase before (or right after) deploying the code that needs it.
