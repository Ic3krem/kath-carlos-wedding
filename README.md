# Kath & Carlos Wedding Website

Single-page wedding website built with Next.js 14, Tailwind CSS, and Supabase, with a password-gated admin panel at `/admin`.

## Setup

1. Install dependencies: `npm install`
2. Create a free Supabase project at https://supabase.com/dashboard.
   - In **Project Settings → API**, copy the **Project URL** into `SUPABASE_URL`, the **anon public** key into `SUPABASE_ANON_KEY`, and the **service_role** key into `SUPABASE_SERVICE_ROLE_KEY`.
   - In the **SQL Editor**, paste and run the contents of `supabase/schema.sql`.
3. Create a Vercel Blob store: in the Vercel dashboard, go to **Storage → Create Database → Blob**, then copy the generated `BLOB_READ_WRITE_TOKEN`.
4. Choose an admin password and generate its hash:
   `node -e "require('bcryptjs').hash(process.argv[1], 10).then(console.log)" "your-password"`
   Put the printed hash in `ADMIN_PASSWORD_HASH`.
5. Generate a random session secret (32+ characters) for `SESSION_SECRET`, e.g.:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
6. Copy `.env.local.example` to `.env.local` and fill in all six values.
7. Run `npm run dev` and visit `http://localhost:3000`. Visit `http://localhost:3000/admin` and log in with your chosen password.

## Testing

`npm test` runs the full Vitest suite (utilities, auth, and all API routes).

## Deploying to Vercel

1. Push this repository to GitHub.
2. Import it in Vercel, and add the same six environment variables from `.env.local` in the Vercel project's **Settings → Environment Variables**.
3. Deploy. The admin panel is available at `https://<your-domain>/admin`.
