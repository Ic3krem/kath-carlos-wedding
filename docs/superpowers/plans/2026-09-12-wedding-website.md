# Wedding Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, fully responsive, database-driven wedding website (Kath & Carlos) from the Figma design, plus a password-gated `/admin` panel to manage all content and RSVPs.

**Architecture:** Next.js 14 App Router + TypeScript + Tailwind CSS, reading/writing content from Supabase Postgres via server-only route handlers, images stored in Vercel Blob. A single shared admin password gates `/admin/*` and `/api/admin/*` via middleware + a signed JWT session cookie. The public page is one route (`/`) composed of server-fetched sections; the RSVP form is a modal (not an inline section), opened via React context from a client trigger button.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, `@supabase/supabase-js`, `@vercel/blob`, `jose` (JWT), `bcryptjs`, `zod`, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-12-wedding-website-design.md`

## Global Constraints

- **Responsive:** every section and every `/admin` editor is mobile-first with Tailwind breakpoints (stacked single-column on mobile, matching the Figma desktop layout at `md`/`lg`). No fixed pixel widths that break under ~375px.
- **Dynamic:** no hardcoded couple names, dates, images, story text, entourage members, gallery images, theme, or maps data in components — everything is read from Supabase at request time.
- **RSVP is a modal**, triggered by a button (in the Hero), never an inline page section.
- **Admin location:** path-based at `/admin` (same Next.js app, no subdomain).
- **Admin auth:** one shared password (`ADMIN_PASSWORD_HASH` env var), no multi-user accounts.
- **Database:** Supabase Postgres, accessed only from the server (route handlers / server components) via the service-role key — never exposed to the client bundle.
- **Images:** uploaded through `/api/admin/upload` to Vercel Blob; forms store the returned URL.

---

## File Structure

```
supabase/schema.sql
src/
  middleware.ts
  lib/
    types.ts
    countdown.ts
    theme.ts
    supabase/server.ts
    auth/password.ts
    auth/session.ts
    validation/rsvp.ts
    rsvp-modal-context.tsx
  app/
    layout.tsx
    page.tsx
    globals.css
    api/
      rsvp/route.ts
      admin/
        login/route.ts
        logout/route.ts
        upload/route.ts
        settings/route.ts
        our-story/route.ts
        entourage/route.ts
        entourage/[id]/route.ts
        gallery/route.ts
        gallery/[id]/route.ts
        rsvps/route.ts
        rsvps/export/route.ts
    admin/
      layout.tsx
      login/page.tsx
      page.tsx
      settings/page.tsx
      our-story/page.tsx
      entourage/page.tsx
      gallery/page.tsx
      rsvps/page.tsx
  components/
    site/Hero.tsx
    site/RsvpTrigger.tsx
    site/RsvpModal.tsx
    site/Countdown.tsx
    site/OurStory.tsx
    site/StoryModal.tsx
    site/Gallery.tsx
    site/Entourage.tsx
    site/MapEmbed.tsx
    admin/AdminNav.tsx
    admin/LoginForm.tsx
    admin/ImageUploader.tsx
    admin/SettingsForm.tsx
    admin/OurStoryForm.tsx
    admin/EntourageEditor.tsx
    admin/GalleryManager.tsx
    admin/RsvpTable.tsx
tests/
  lib/countdown.test.ts
  lib/theme.test.ts
  lib/auth/password.test.ts
  lib/auth/session.test.ts
  lib/supabase/server.test.ts
  lib/validation/rsvp.test.ts
  middleware.test.ts
  api/rsvp.test.ts
  api/admin/upload.test.ts
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.js`, `vitest.config.ts`, `.env.local.example`, `.gitignore`, `README.md`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `tests/sanity.test.ts`

**Interfaces:**
- Produces: a runnable `npm run dev` Next.js app and a runnable `npm test` Vitest suite. All later tasks assume these scripts exist.

- [ ] **Step 1: Initialize package.json with all dependencies**

```json
{
  "name": "kath-carlos-wedding",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@supabase/supabase-js": "2.45.4",
    "@vercel/blob": "0.27.0",
    "jose": "5.9.6",
    "bcryptjs": "2.4.3",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "typescript": "5.6.3",
    "@types/node": "20.16.11",
    "@types/react": "18.3.11",
    "@types/react-dom": "18.3.0",
    "@types/bcryptjs": "2.4.6",
    "tailwindcss": "3.4.13",
    "postcss": "8.4.47",
    "autoprefixer": "10.4.20",
    "vitest": "2.1.2",
    "@vitejs/plugin-react": "4.3.2",
    "@testing-library/react": "16.0.1",
    "jsdom": "25.0.1"
  }
}
```

Run: `npm install`

- [ ] **Step 2: Add tsconfig.json with the `@/*` path alias**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Add next.config.mjs, tailwind.config.ts, postcss.config.js**

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
};
export default nextConfig;
```

`tailwind.config.ts`:
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
    },
  },
  plugins: [],
};
export default config;
```

`postcss.config.js`:
```js
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 4: Add baseline app files**

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #2f4f3a;
  --color-secondary: #f5f1e6;
  --color-accent: #c9a24b;
}

html, body {
  @apply bg-white text-black;
}
```

`src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kath & Carlos',
  description: 'Kath & Carlos wedding website',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx` (placeholder, replaced in Task 23):
```tsx
export default function HomePage() {
  return <main className="p-8">Coming soon.</main>;
}
```

- [ ] **Step 5: Add vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 6: Add a sanity test**

`tests/sanity.test.ts`:
```ts
import { describe, it, expect } from 'vitest';

describe('project scaffold', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 7: Add .env.local.example, .gitignore, README skeleton**

`.env.local.example`:
```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
BLOB_READ_WRITE_TOKEN=
ADMIN_PASSWORD_HASH=
SESSION_SECRET=
```

`.gitignore`:
```
node_modules
.next
.env.local
```

`README.md` (expanded fully in Task 24; for now a placeholder header):
```md
# Kath & Carlos Wedding Website
```

- [ ] **Step 8: Verify dev server and test runner both work**

Run: `npm run dev` — visit `http://localhost:3000`, confirm "Coming soon." renders. Stop the server.
Run: `npm test` — expect: `1 passed`.

- [ ] **Step 9: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Next.js + Tailwind + Vitest project"
```

---

### Task 2: Supabase schema and server client

**Files:**
- Create: `supabase/schema.sql`
- Create: `src/lib/types.ts`
- Create: `src/lib/supabase/server.ts`
- Test: `tests/lib/supabase/server.test.ts`

**Interfaces:**
- Produces: `getSupabaseServerClient(): SupabaseClient` — throws if `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are unset, otherwise returns a memoized client. Produces DB row types: `Settings`, `OurStory`, `EntourageMember`, `EntourageCategory`, `EntourageSide`, `GalleryImage`, `Rsvp`.

- [ ] **Step 1: Write supabase/schema.sql**

```sql
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
```

- [ ] **Step 2: Write src/lib/types.ts**

```ts
export interface Settings {
  id: number;
  couple_names: string;
  wedding_date: string;
  hero_image_url: string | null;
  theme: string;
  maps_address: string | null;
  maps_embed_url: string | null;
}

export interface OurStory {
  id: number;
  image_url: string | null;
  title: string;
  excerpt: string;
  full_story: string;
  button_label: string;
}

export type EntourageCategory = 'parents' | 'godparents' | 'other';
export type EntourageSide = 'bride' | 'groom' | null;

export interface EntourageMember {
  id: string;
  category: EntourageCategory;
  role_label: string;
  name: string;
  side: EntourageSide;
  sort_order: number;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export interface Rsvp {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  attending: boolean;
  guest_count: number;
  meal_preference: string | null;
  message: string | null;
  created_at: string;
}
```

- [ ] **Step 3: Write the failing test for the server client**

`tests/lib/supabase/server.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('getSupabaseServerClient', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...ORIGINAL_ENV };
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('throws when env vars are missing', async () => {
    const { getSupabaseServerClient } = await import('@/lib/supabase/server');
    expect(() => getSupabaseServerClient()).toThrow(/SUPABASE_URL/);
  });

  it('returns a client when env vars are present', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    const { getSupabaseServerClient } = await import('@/lib/supabase/server');
    const client = getSupabaseServerClient();
    expect(client.from).toBeInstanceOf(Function);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run tests/lib/supabase/server.test.ts`
Expected: FAIL — `Cannot find module '@/lib/supabase/server'`

- [ ] **Step 5: Implement src/lib/supabase/server.ts**

```ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  }
  if (!cachedClient) {
    cachedClient = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  }
  return cachedClient;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/lib/supabase/server.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 7: Commit**

```bash
git add supabase/schema.sql src/lib/types.ts src/lib/supabase/server.ts tests/lib/supabase/server.test.ts
git commit -m "feat: add Supabase schema, DB types, and server client"
```

---

### Task 3: Countdown utility

**Files:**
- Create: `src/lib/countdown.ts`
- Test: `tests/lib/countdown.test.ts`

**Interfaces:**
- Produces: `getCountdownParts(target: Date, now?: Date): CountdownParts` where `CountdownParts = { months: number; weeks: number; days: number; hours: number; minutes: number; seconds: number; isPast: boolean }`. Consumed by `src/components/site/Countdown.tsx` (Task 18).

- [ ] **Step 1: Write the failing tests**

`tests/lib/countdown.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { getCountdownParts } from '@/lib/countdown';

describe('getCountdownParts', () => {
  it('marks a past target as isPast with zeroed parts', () => {
    const now = new Date('2026-06-01T00:00:00Z');
    const target = new Date('2026-01-01T00:00:00Z');
    const result = getCountdownParts(target, now);
    expect(result).toEqual({ months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
  });

  it('breaks down a whole-month gap with no remainder', () => {
    const now = new Date('2026-01-15T00:00:00Z');
    const target = new Date('2026-04-15T00:00:00Z');
    const result = getCountdownParts(target, now);
    expect(result).toEqual({ months: 3, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });
  });

  it('breaks down hours/minutes/seconds within a day', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const target = new Date('2026-01-01T01:30:45Z');
    const result = getCountdownParts(target, now);
    expect(result).toEqual({ months: 0, weeks: 0, days: 0, hours: 1, minutes: 30, seconds: 45, isPast: false });
  });

  it('breaks down weeks and days after removing whole months', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const target = new Date('2026-02-16T00:00:00Z'); // 1 month + 15 days = 2 weeks + 1 day
    const result = getCountdownParts(target, now);
    expect(result).toEqual({ months: 1, weeks: 2, days: 1, hours: 0, minutes: 0, seconds: 0, isPast: false });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/countdown.test.ts`
Expected: FAIL — `Cannot find module '@/lib/countdown'`

- [ ] **Step 3: Implement src/lib/countdown.ts**

```ts
export interface CountdownParts {
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

export function getCountdownParts(target: Date, now: Date = new Date()): CountdownParts {
  if (target.getTime() <= now.getTime()) {
    return { months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  let months = 0;
  let cursor = new Date(now.getTime());
  while (addMonths(cursor, 1).getTime() <= target.getTime()) {
    cursor = addMonths(cursor, 1);
    months += 1;
  }

  let remainingSeconds = Math.floor((target.getTime() - cursor.getTime()) / 1000);

  const weeks = Math.floor(remainingSeconds / (7 * 86400));
  remainingSeconds -= weeks * 7 * 86400;

  const days = Math.floor(remainingSeconds / 86400);
  remainingSeconds -= days * 86400;

  const hours = Math.floor(remainingSeconds / 3600);
  remainingSeconds -= hours * 3600;

  const minutes = Math.floor(remainingSeconds / 60);
  remainingSeconds -= minutes * 60;

  const seconds = remainingSeconds;

  return { months, weeks, days, hours, minutes, seconds, isPast: false };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lib/countdown.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/countdown.ts tests/lib/countdown.test.ts
git commit -m "feat: add countdown breakdown utility"
```

---

### Task 4: Theme utility

**Files:**
- Create: `src/lib/theme.ts`
- Modify: `src/app/globals.css` (add per-theme CSS variable blocks)
- Test: `tests/lib/theme.test.ts`

**Interfaces:**
- Produces: `ThemeKey` (`'classic-green' | 'blush' | 'ivory-gold'`), `THEMES: Record<ThemeKey, ThemeDefinition>`, `DEFAULT_THEME: ThemeKey`, `isValidTheme(value: string): value is ThemeKey`. Consumed by `src/app/layout.tsx`/`page.tsx` (Task 16) and the admin theme picker in `SettingsForm.tsx` (Task 10).

- [ ] **Step 1: Write the failing tests**

`tests/lib/theme.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { THEMES, DEFAULT_THEME, isValidTheme } from '@/lib/theme';

describe('theme utility', () => {
  it('includes the default theme as a valid key', () => {
    expect(THEMES[DEFAULT_THEME]).toBeDefined();
  });

  it('validates known theme keys', () => {
    expect(isValidTheme('classic-green')).toBe(true);
    expect(isValidTheme('blush')).toBe(true);
    expect(isValidTheme('not-a-theme')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/theme.test.ts`
Expected: FAIL — `Cannot find module '@/lib/theme'`

- [ ] **Step 3: Implement src/lib/theme.ts**

```ts
export type ThemeKey = 'classic-green' | 'blush' | 'ivory-gold';

export interface ThemeDefinition {
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const THEMES: Record<ThemeKey, ThemeDefinition> = {
  'classic-green': {
    label: 'Classic Green',
    colors: { primary: '#2f4f3a', secondary: '#f5f1e6', accent: '#c9a24b' },
  },
  blush: {
    label: 'Blush',
    colors: { primary: '#b76e79', secondary: '#fff5f5', accent: '#d4af37' },
  },
  'ivory-gold': {
    label: 'Ivory & Gold',
    colors: { primary: '#8a6d3b', secondary: '#faf6ef', accent: '#c9a24b' },
  },
};

export const DEFAULT_THEME: ThemeKey = 'classic-green';

export function isValidTheme(value: string): value is ThemeKey {
  return Object.prototype.hasOwnProperty.call(THEMES, value);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lib/theme.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Add per-theme CSS variable overrides to globals.css**

Append to `src/app/globals.css`:
```css
[data-theme='classic-green'] {
  --color-primary: #2f4f3a;
  --color-secondary: #f5f1e6;
  --color-accent: #c9a24b;
}
[data-theme='blush'] {
  --color-primary: #b76e79;
  --color-secondary: #fff5f5;
  --color-accent: #d4af37;
}
[data-theme='ivory-gold'] {
  --color-primary: #8a6d3b;
  --color-secondary: #faf6ef;
  --color-accent: #c9a24b;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/theme.ts src/app/globals.css tests/lib/theme.test.ts
git commit -m "feat: add theme definitions and CSS variable overrides"
```

---

### Task 5: Admin password hashing utility

**Files:**
- Create: `src/lib/auth/password.ts`
- Test: `tests/lib/auth/password.test.ts`

**Interfaces:**
- Produces: `hashPassword(plain: string): Promise<string>`, `verifyAdminPassword(plain: string): Promise<boolean>` (compares against `process.env.ADMIN_PASSWORD_HASH`, throws if unset). Consumed by `/api/admin/login/route.ts` (Task 8).

- [ ] **Step 1: Write the failing tests**

`tests/lib/auth/password.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { hashPassword, verifyAdminPassword } from '@/lib/auth/password';

describe('password utility', () => {
  beforeEach(async () => {
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash('correct-horse', 10);
  });

  it('hashPassword produces a bcrypt-verifiable hash', async () => {
    const hash = await hashPassword('my-secret');
    expect(await bcrypt.compare('my-secret', hash)).toBe(true);
  });

  it('verifyAdminPassword returns true for the correct password', async () => {
    expect(await verifyAdminPassword('correct-horse')).toBe(true);
  });

  it('verifyAdminPassword returns false for the wrong password', async () => {
    expect(await verifyAdminPassword('wrong')).toBe(false);
  });

  it('verifyAdminPassword throws if ADMIN_PASSWORD_HASH is unset', async () => {
    delete process.env.ADMIN_PASSWORD_HASH;
    await expect(verifyAdminPassword('anything')).rejects.toThrow(/ADMIN_PASSWORD_HASH/);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/auth/password.test.ts`
Expected: FAIL — `Cannot find module '@/lib/auth/password'`

- [ ] **Step 3: Implement src/lib/auth/password.ts**

```ts
import bcrypt from 'bcryptjs';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyAdminPassword(plain: string): Promise<boolean> {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error('Missing ADMIN_PASSWORD_HASH env var');
  }
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lib/auth/password.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/password.ts tests/lib/auth/password.test.ts
git commit -m "feat: add admin password hashing/verification utility"
```

---

### Task 6: Admin session utility

**Files:**
- Create: `src/lib/auth/session.ts`
- Test: `tests/lib/auth/session.test.ts`

**Interfaces:**
- Produces: `SESSION_COOKIE_NAME: string`, `createSessionToken(): Promise<string>`, `verifySessionToken(token: string): Promise<boolean>`. Consumed by `src/middleware.ts` (Task 7) and `/api/admin/login`/`logout` routes (Task 8).

- [ ] **Step 1: Write the failing tests**

`tests/lib/auth/session.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createSessionToken, verifySessionToken } from '@/lib/auth/session';

describe('session utility', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long';
  });

  it('creates a token that verifies as valid', async () => {
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
  });

  it('rejects a garbage token', async () => {
    expect(await verifySessionToken('not-a-real-token')).toBe(false);
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken();
    process.env.SESSION_SECRET = 'a-completely-different-secret-value';
    expect(await verifySessionToken(token)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/auth/session.test.ts`
Expected: FAIL — `Cannot find module '@/lib/auth/session'`

- [ ] **Step 3: Implement src/lib/auth/session.ts**

```ts
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE_NAME = 'admin_session';
const ALG = 'HS256';

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('Missing SESSION_SECRET env var');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.admin === true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lib/auth/session.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/session.ts tests/lib/auth/session.test.ts
git commit -m "feat: add admin session token creation/verification"
```

---

### Task 7: Middleware protecting /admin and /api/admin

**Files:**
- Create: `src/middleware.ts`
- Test: `tests/middleware.test.ts`

**Interfaces:**
- Consumes: `SESSION_COOKIE_NAME`, `verifySessionToken` from `@/lib/auth/session` (Task 6).
- Produces: the `middleware(request: NextRequest)` function and `config.matcher`, enforced by Next.js on every request to `/admin/*` and `/api/admin/*`.

- [ ] **Step 1: Write the failing tests**

`tests/middleware.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { middleware } from '@/middleware';

describe('admin middleware', () => {
  beforeEach(() => {
    process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long';
  });

  it('allows /admin/login through without a session', async () => {
    const request = new NextRequest('http://localhost/admin/login');
    const response = await middleware(request);
    expect(response.status).toBe(200);
  });

  it('redirects unauthenticated page requests to /admin/login', async () => {
    const request = new NextRequest('http://localhost/admin');
    const response = await middleware(request);
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('/admin/login');
  });

  it('returns 401 for unauthenticated API requests', async () => {
    const request = new NextRequest('http://localhost/api/admin/settings');
    const response = await middleware(request);
    expect(response.status).toBe(401);
  });

  it('allows requests through with a valid session cookie', async () => {
    const token = await createSessionToken();
    const request = new NextRequest('http://localhost/admin', {
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
    const response = await middleware(request);
    expect(response.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/middleware.test.ts`
Expected: FAIL — `Cannot find module '@/middleware'`

- [ ] **Step 3: Implement src/middleware.ts**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = token ? await verifySessionToken(token) : false;

  if (!valid) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/middleware.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/middleware.ts tests/middleware.test.ts
git commit -m "feat: gate /admin and /api/admin behind session middleware"
```

---

### Task 8: Admin login/logout API + login page

**Files:**
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/logout/route.ts`
- Create: `src/components/admin/LoginForm.tsx`
- Create: `src/app/admin/login/page.tsx`
- Test: `tests/api/admin/login.test.ts`

**Interfaces:**
- Consumes: `verifyAdminPassword` (Task 5), `createSessionToken`, `SESSION_COOKIE_NAME` (Task 6).
- Produces: `POST /api/admin/login` (body `{ password: string }` → `{ success: true }` + sets cookie, or 400/401), `POST /api/admin/logout` (clears cookie). The login page renders `LoginForm`.

- [ ] **Step 1: Write the failing tests**

`tests/api/admin/login.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { POST as login } from '@/app/api/admin/login/route';

describe('POST /api/admin/login', () => {
  beforeEach(async () => {
    process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash('correct-horse', 10);
    process.env.SESSION_SECRET = 'test-secret-at-least-32-characters-long';
  });

  it('rejects a missing password with 400', async () => {
    const request = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const response = await login(request);
    expect(response.status).toBe(400);
  });

  it('rejects an incorrect password with 401', async () => {
    const request = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'wrong' }),
    });
    const response = await login(request);
    expect(response.status).toBe(401);
  });

  it('accepts the correct password and sets a session cookie', async () => {
    const request = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'correct-horse' }),
    });
    const response = await login(request);
    expect(response.status).toBe(200);
    expect(response.cookies.get('admin_session')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/api/admin/login.test.ts`
Expected: FAIL — `Cannot find module '@/app/api/admin/login/route'`

- [ ] **Step 3: Implement the login route**

`src/app/api/admin/login/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPassword } from '@/lib/auth/password';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (typeof password !== 'string' || password.length === 0) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 });
  }

  const valid = await verifyAdminPassword(password);
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
```

- [ ] **Step 4: Implement the logout route**

`src/app/api/admin/logout/route.ts`:
```ts
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return response;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/api/admin/login.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Build the login form and page (manual verification, no unit test)**

`src/components/admin/LoginForm.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? 'Login failed');
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold sm:text-2xl">Admin login</h1>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="w-full rounded-md border border-black/20 px-3 py-2"
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
```

`src/app/admin/login/page.tsx`:
```tsx
import { LoginForm } from '@/components/admin/LoginForm';

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4">
      <LoginForm />
    </main>
  );
}
```

Run: `npm run dev`, visit `http://localhost:3000/admin` — confirm redirect to `/admin/login`. (Full login flow is verified end-to-end once Task 9's `/admin` dashboard page exists.)

- [ ] **Step 7: Commit**

```bash
git add src/app/api/admin/login/route.ts src/app/api/admin/logout/route.ts src/components/admin/LoginForm.tsx src/app/admin/login/page.tsx tests/api/admin/login.test.ts
git commit -m "feat: add admin login/logout API and login page"
```

---

### Task 9: Image upload API + ImageUploader component

**Files:**
- Create: `src/app/api/admin/upload/route.ts`
- Create: `src/components/admin/ImageUploader.tsx`
- Test: `tests/api/admin/upload.test.ts`

**Interfaces:**
- Produces: `POST /api/admin/upload` (multipart form field `file` → `{ url: string }` or 400). `ImageUploader` props: `{ label: string; value: string | null; onUploaded: (url: string) => void }` — renders current image, a file input, and calls `onUploaded` once the upload completes. Consumed by `SettingsForm`, `OurStoryForm`, `GalleryManager` (Tasks 10, 11, 13).

- [ ] **Step 1: Write the failing test**

`tests/api/admin/upload.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (pathname: string) => ({ url: `https://example.public.blob.vercel-storage.com/${pathname}` })),
}));

import { put } from '@vercel/blob';
import { POST as upload } from '@/app/api/admin/upload/route';

describe('POST /api/admin/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
  });

  it('rejects a request with no file', async () => {
    const formData = new FormData();
    const request = new NextRequest('http://localhost/api/admin/upload', { method: 'POST', body: formData });
    const response = await upload(request);
    expect(response.status).toBe(400);
  });

  it('uploads the file via @vercel/blob and returns the url', async () => {
    const file = new File(['fake-bytes'], 'photo.png', { type: 'image/png' });
    const formData = new FormData();
    formData.set('file', file);
    const request = new NextRequest('http://localhost/api/admin/upload', { method: 'POST', body: formData });
    const response = await upload(request);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.url).toContain('photo.png');
    expect(put).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api/admin/upload.test.ts`
Expected: FAIL — `Cannot find module '@/app/api/admin/upload/route'`

- [ ] **Step 3: Implement the upload route**

`src/app/api/admin/upload/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return NextResponse.json({ url: blob.url });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api/admin/upload.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Build ImageUploader (manual verification later, once wired into Task 10)**

`src/components/admin/ImageUploader.tsx`:
```tsx
'use client';

import { useState } from 'react';

interface ImageUploaderProps {
  label: string;
  value: string | null;
  onUploaded: (url: string) => void;
}

export function ImageUploader({ label, value, onUploaded }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.set('file', file);
    const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
    setUploading(false);
    if (!response.ok) {
      setError('Upload failed');
      return;
    }
    const data = await response.json();
    onUploaded(data.url);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}</label>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt={label} className="h-32 w-full max-w-xs rounded-md object-cover sm:h-40" />
      )}
      <input type="file" accept="image/*" onChange={handleChange} disabled={uploading} />
      {uploading && <p className="text-sm text-black/60">Uploading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/upload/route.ts src/components/admin/ImageUploader.tsx tests/api/admin/upload.test.ts
git commit -m "feat: add Vercel Blob image upload API and uploader component"
```

---

### Task 10: Settings API + admin Settings page

**Files:**
- Create: `src/app/api/admin/settings/route.ts`
- Create: `src/components/admin/SettingsForm.tsx`
- Create: `src/app/admin/settings/page.tsx`
- Test: `tests/api/admin/settings.test.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient` (Task 2), `Settings` type (Task 2), `THEMES`/`isValidTheme` (Task 4), `ImageUploader` (Task 9).
- Produces: `GET /api/admin/settings` → `Settings`, `PUT /api/admin/settings` (body: `Partial<Settings>` minus `id`) → updated `Settings`. Consumed by `src/app/page.tsx` (Task 23, read-only via a similar server-side fetch).

- [ ] **Step 1: Write the failing test**

`tests/api/admin/settings.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ single: singleMock, select: () => ({ single: singleMock }) }));
const updateMock = vi.fn(() => ({ eq: eqMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock, update: updateMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET, PUT } from '@/app/api/admin/settings/route';

describe('/api/admin/settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({
      data: { id: 1, couple_names: 'Kath & Carlos', wedding_date: '2027-01-01T00:00:00Z', hero_image_url: null, theme: 'classic-green', maps_address: null, maps_embed_url: null },
      error: null,
    });
  });

  it('GET returns the settings row', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.couple_names).toBe('Kath & Carlos');
  });

  it('PUT updates the settings row', async () => {
    const request = new NextRequest('http://localhost/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify({ couple_names: 'Kath & Carlos', wedding_date: '2027-06-01T00:00:00Z', theme: 'blush', hero_image_url: null, maps_address: null, maps_embed_url: null }),
    });
    const response = await PUT(request);
    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api/admin/settings.test.ts`
Expected: FAIL — `Cannot find module '@/app/api/admin/settings/route'`

- [ ] **Step 3: Implement the settings route**

`src/app/api/admin/settings/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
  if (error) {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('settings')
    .update({
      couple_names: body.couple_names,
      wedding_date: body.wedding_date,
      hero_image_url: body.hero_image_url,
      theme: body.theme,
      maps_address: body.maps_address,
      maps_embed_url: body.maps_embed_url,
    })
    .eq('id', 1)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
  return NextResponse.json(data);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api/admin/settings.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Build SettingsForm and the admin Settings page (manual verification)**

`src/components/admin/SettingsForm.tsx`:
```tsx
'use client';

import { useState } from 'react';
import type { Settings } from '@/lib/types';
import { THEMES } from '@/lib/theme';
import { ImageUploader } from './ImageUploader';

export function SettingsForm({ initial }: { initial: Settings }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    const response = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(response.ok ? 'saved' : 'error');
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Couple names</label>
        <input
          className="rounded-md border border-black/20 px-3 py-2"
          value={form.couple_names}
          onChange={(e) => setForm({ ...form, couple_names: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Wedding date</label>
        <input
          type="datetime-local"
          className="rounded-md border border-black/20 px-3 py-2"
          value={form.wedding_date.slice(0, 16)}
          onChange={(e) => setForm({ ...form, wedding_date: new Date(e.target.value).toISOString() })}
        />
      </div>
      <ImageUploader
        label="Hero background image"
        value={form.hero_image_url}
        onUploaded={(url) => setForm({ ...form, hero_image_url: url })}
      />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Theme</label>
        <select
          className="rounded-md border border-black/20 px-3 py-2"
          value={form.theme}
          onChange={(e) => setForm({ ...form, theme: e.target.value })}
        >
          {Object.entries(THEMES).map(([key, def]) => (
            <option key={key} value={key}>{def.label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Venue address</label>
        <input
          className="rounded-md border border-black/20 px-3 py-2"
          value={form.maps_address ?? ''}
          onChange={(e) => setForm({ ...form, maps_address: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Google Maps embed URL</label>
        <input
          className="rounded-md border border-black/20 px-3 py-2"
          value={form.maps_embed_url ?? ''}
          onChange={(e) => setForm({ ...form, maps_embed_url: e.target.value })}
        />
      </div>
      <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit">
        {status === 'saving' ? 'Saving…' : 'Save settings'}
      </button>
      {status === 'saved' && <p className="text-sm text-green-700">Saved.</p>}
      {status === 'error' && <p className="text-sm text-red-600">Failed to save.</p>}
    </form>
  );
}
```

`src/app/admin/settings/page.tsx`:
```tsx
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/admin/SettingsForm';
import type { Settings } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).single<Settings>();
  return (
    <main className="flex justify-center">
      <SettingsForm initial={data as Settings} />
    </main>
  );
}
```

Run: `npm run dev`, log in at `/admin/login`, visit `/admin/settings`, edit couple names/date/theme, save, reload — confirm values persist (requires Supabase env vars from Task 2's schema to be set; if not yet configured, defer this manual check to Task 24's full verification pass).

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/settings/route.ts src/components/admin/SettingsForm.tsx src/app/admin/settings/page.tsx tests/api/admin/settings.test.ts
git commit -m "feat: add settings API and admin settings editor"
```

---

### Task 11: Our Story API + admin editor

**Files:**
- Create: `src/app/api/admin/our-story/route.ts`
- Create: `src/components/admin/OurStoryForm.tsx`
- Create: `src/app/admin/our-story/page.tsx`
- Test: `tests/api/admin/our-story.test.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient`, `OurStory` type, `ImageUploader`.
- Produces: `GET /api/admin/our-story` → `OurStory`, `PUT /api/admin/our-story` → updated `OurStory`. Consumed by `src/components/site/OurStory.tsx` (Task 19, via direct server-side Supabase read in `page.tsx`).

- [ ] **Step 1: Write the failing test**

`tests/api/admin/our-story.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ single: singleMock, select: () => ({ single: singleMock }) }));
const updateMock = vi.fn(() => ({ eq: eqMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock, update: updateMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET, PUT } from '@/app/api/admin/our-story/route';

describe('/api/admin/our-story', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({
      data: { id: 1, image_url: null, title: 'How we Begin', excerpt: 'Short version.', full_story: 'Long version.', button_label: 'Continue Reading' },
      error: null,
    });
  });

  it('GET returns the our_story row', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.title).toBe('How we Begin');
  });

  it('PUT updates the our_story row', async () => {
    const request = new NextRequest('http://localhost/api/admin/our-story', {
      method: 'PUT',
      body: JSON.stringify({ image_url: null, title: 'Our Journey', excerpt: 'e', full_story: 'f', button_label: 'Read more' }),
    });
    const response = await PUT(request);
    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/api/admin/our-story.test.ts`
Expected: FAIL — `Cannot find module '@/app/api/admin/our-story/route'`

- [ ] **Step 3: Implement the route**

`src/app/api/admin/our-story/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('our_story').select('*').eq('id', 1).single();
  if (error) {
    return NextResponse.json({ error: 'Failed to load story' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('our_story')
    .update({
      image_url: body.image_url,
      title: body.title,
      excerpt: body.excerpt,
      full_story: body.full_story,
      button_label: body.button_label,
    })
    .eq('id', 1)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
  }
  return NextResponse.json(data);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/api/admin/our-story.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Build OurStoryForm and the admin page (manual verification)**

`src/components/admin/OurStoryForm.tsx`:
```tsx
'use client';

import { useState } from 'react';
import type { OurStory } from '@/lib/types';
import { ImageUploader } from './ImageUploader';

export function OurStoryForm({ initial }: { initial: OurStory }) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    const response = await fetch('/api/admin/our-story', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(response.ok ? 'saved' : 'error');
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
      <ImageUploader label="Story image" value={form.image_url} onUploaded={(url) => setForm({ ...form, image_url: url })} />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Title</label>
        <input className="rounded-md border border-black/20 px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Excerpt (shown on the page)</label>
        <textarea className="min-h-24 rounded-md border border-black/20 px-3 py-2" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Full story (shown in the modal)</label>
        <textarea className="min-h-48 rounded-md border border-black/20 px-3 py-2" value={form.full_story} onChange={(e) => setForm({ ...form, full_story: e.target.value })} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Button label</label>
        <input className="rounded-md border border-black/20 px-3 py-2" value={form.button_label} onChange={(e) => setForm({ ...form, button_label: e.target.value })} />
      </div>
      <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit">
        {status === 'saving' ? 'Saving…' : 'Save story'}
      </button>
      {status === 'saved' && <p className="text-sm text-green-700">Saved.</p>}
      {status === 'error' && <p className="text-sm text-red-600">Failed to save.</p>}
    </form>
  );
}
```

`src/app/admin/our-story/page.tsx`:
```tsx
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { OurStoryForm } from '@/components/admin/OurStoryForm';
import type { OurStory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminOurStoryPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('our_story').select('*').eq('id', 1).single<OurStory>();
  return (
    <main className="flex justify-center">
      <OurStoryForm initial={data as OurStory} />
    </main>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/our-story/route.ts src/components/admin/OurStoryForm.tsx src/app/admin/our-story/page.tsx tests/api/admin/our-story.test.ts
git commit -m "feat: add Our Story API and admin editor"
```

---

### Task 12: Entourage API + admin editor

**Files:**
- Create: `src/app/api/admin/entourage/route.ts`
- Create: `src/app/api/admin/entourage/[id]/route.ts`
- Create: `src/components/admin/EntourageEditor.tsx`
- Create: `src/app/admin/entourage/page.tsx`
- Test: `tests/api/admin/entourage.test.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient`, `EntourageMember`/`EntourageCategory`/`EntourageSide` types (Task 2).
- Produces: `GET /api/admin/entourage` → `EntourageMember[]`, `POST /api/admin/entourage` (body without `id`) → created `EntourageMember`, `PUT /api/admin/entourage/[id]` → updated `EntourageMember`, `DELETE /api/admin/entourage/[id]` → `{ success: true }`. Consumed by `src/components/site/Entourage.tsx` (Task 21).

- [ ] **Step 1: Write the failing tests**

`tests/api/admin/entourage.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const singleMock = vi.fn();
const orderMock = vi.fn();
const selectMock = vi.fn(() => ({ order: orderMock, single: singleMock }));
const insertMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
const eqMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
const updateMock = vi.fn(() => ({ eq: eqMock }));
const deleteEqMock = vi.fn(async () => ({ error: null }));
const deleteMock = vi.fn(() => ({ eq: deleteEqMock }));
const fromMock = vi.fn(() => ({ select: selectMock, insert: insertMock, update: updateMock, delete: deleteMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET, POST } from '@/app/api/admin/entourage/route';
import { PUT, DELETE } from '@/app/api/admin/entourage/[id]/route';

describe('/api/admin/entourage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderMock.mockResolvedValue({ data: [{ id: '1', category: 'parents', role_label: 'Father of the Groom', name: 'Juan', side: 'groom', sort_order: 0 }], error: null });
    singleMock.mockResolvedValue({ data: { id: '2', category: 'godparents', role_label: 'Ninong', name: 'Pedro', side: null, sort_order: 1 }, error: null });
  });

  it('GET lists members ordered by sort_order', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it('POST creates a member', async () => {
    const request = new NextRequest('http://localhost/api/admin/entourage', {
      method: 'POST',
      body: JSON.stringify({ category: 'godparents', role_label: 'Ninong', name: 'Pedro', side: null, sort_order: 1 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it('PUT updates a member by id', async () => {
    const request = new NextRequest('http://localhost/api/admin/entourage/2', {
      method: 'PUT',
      body: JSON.stringify({ category: 'godparents', role_label: 'Ninong', name: 'Pedro Jr.', side: null, sort_order: 1 }),
    });
    const response = await PUT(request, { params: { id: '2' } });
    expect(response.status).toBe(200);
    expect(updateMock).toHaveBeenCalledOnce();
  });

  it('DELETE removes a member by id', async () => {
    const request = new NextRequest('http://localhost/api/admin/entourage/2', { method: 'DELETE' });
    const response = await DELETE(request, { params: { id: '2' } });
    expect(response.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/api/admin/entourage.test.ts`
Expected: FAIL — `Cannot find module '@/app/api/admin/entourage/route'`

- [ ] **Step 3: Implement src/app/api/admin/entourage/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('entourage_members').select('*').order('sort_order');
  if (error) {
    return NextResponse.json({ error: 'Failed to load entourage' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('entourage_members')
    .insert({
      category: body.category,
      role_label: body.role_label,
      name: body.name,
      side: body.side ?? null,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 4: Implement src/app/api/admin/entourage/[id]/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

interface RouteParams {
  params: { id: string };
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('entourage_members')
    .update({
      category: body.category,
      role_label: body.role_label,
      name: body.name,
      side: body.side ?? null,
      sort_order: body.sort_order ?? 0,
    })
    .eq('id', params.id)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('entourage_members').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/api/admin/entourage.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Build EntourageEditor and the admin page (manual verification)**

`src/components/admin/EntourageEditor.tsx`:
```tsx
'use client';

import { useState } from 'react';
import type { EntourageMember, EntourageCategory, EntourageSide } from '@/lib/types';

const CATEGORIES: EntourageCategory[] = ['parents', 'godparents', 'other'];
const SIDES: NonNullable<EntourageSide>[] = ['bride', 'groom'];

export function EntourageEditor({ initial }: { initial: EntourageMember[] }) {
  const [members, setMembers] = useState(initial);
  const [draft, setDraft] = useState({ category: 'parents' as EntourageCategory, role_label: '', name: '', side: null as EntourageSide, sort_order: initial.length });

  async function addMember(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch('/api/admin/entourage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    if (response.ok) {
      const created = await response.json();
      setMembers([...members, created]);
      setDraft({ category: 'parents', role_label: '', name: '', side: null, sort_order: members.length + 1 });
    }
  }

  async function removeMember(id: string) {
    const response = await fetch(`/api/admin/entourage/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setMembers(members.filter((m) => m.id !== id));
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <ul className="flex flex-col gap-2">
        {members.map((member) => (
          <li key={member.id} className="flex flex-col justify-between gap-2 rounded-md border border-black/10 p-3 sm:flex-row sm:items-center">
            <span>
              <strong>{member.role_label}</strong> — {member.name} ({member.category}{member.side ? `, ${member.side}` : ''})
            </span>
            <button onClick={() => removeMember(member.id)} className="text-sm text-red-600">
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={addMember} className="flex flex-col gap-3 rounded-md border border-black/10 p-4">
        <h2 className="text-lg font-semibold">Add member</h2>
        <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as EntourageCategory })} className="rounded-md border border-black/20 px-3 py-2">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input placeholder="Role (e.g. Mother of the Bride)" value={draft.role_label} onChange={(e) => setDraft({ ...draft, role_label: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
        <input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
        <select value={draft.side ?? ''} onChange={(e) => setDraft({ ...draft, side: (e.target.value || null) as EntourageSide })} className="rounded-md border border-black/20 px-3 py-2">
          <option value="">No side</option>
          {SIDES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button type="submit" className="w-full rounded-md bg-black px-4 py-2 text-white sm:w-fit">
          Add
        </button>
      </form>
    </div>
  );
}
```

`src/app/admin/entourage/page.tsx`:
```tsx
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { EntourageEditor } from '@/components/admin/EntourageEditor';
import type { EntourageMember } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminEntouragePage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('entourage_members').select('*').order('sort_order');
  return (
    <main className="flex justify-center">
      <EntourageEditor initial={(data as EntourageMember[]) ?? []} />
    </main>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/admin/entourage src/components/admin/EntourageEditor.tsx src/app/admin/entourage/page.tsx tests/api/admin/entourage.test.ts
git commit -m "feat: add entourage API and admin editor"
```

---

### Task 13: Gallery API + admin manager

**Files:**
- Create: `src/app/api/admin/gallery/route.ts`
- Create: `src/app/api/admin/gallery/[id]/route.ts`
- Create: `src/components/admin/GalleryManager.tsx`
- Create: `src/app/admin/gallery/page.tsx`
- Test: `tests/api/admin/gallery.test.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient`, `GalleryImage` type, `ImageUploader`.
- Produces: `GET /api/admin/gallery` → `GalleryImage[]`, `POST /api/admin/gallery` → created `GalleryImage`, `DELETE /api/admin/gallery/[id]` → `{ success: true }`. Consumed by `src/components/site/Gallery.tsx` (Task 20).

- [ ] **Step 1: Write the failing tests**

`tests/api/admin/gallery.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const singleMock = vi.fn();
const orderMock = vi.fn();
const selectMock = vi.fn(() => ({ order: orderMock }));
const insertMock = vi.fn(() => ({ select: () => ({ single: singleMock }) }));
const deleteEqMock = vi.fn(async () => ({ error: null }));
const deleteMock = vi.fn(() => ({ eq: deleteEqMock }));
const fromMock = vi.fn(() => ({ select: selectMock, insert: insertMock, delete: deleteMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET, POST } from '@/app/api/admin/gallery/route';
import { DELETE } from '@/app/api/admin/gallery/[id]/route';

describe('/api/admin/gallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderMock.mockResolvedValue({ data: [{ id: '1', image_url: 'https://x/1.png', caption: null, sort_order: 0 }], error: null });
    singleMock.mockResolvedValue({ data: { id: '2', image_url: 'https://x/2.png', caption: 'Engagement', sort_order: 1 }, error: null });
  });

  it('GET lists images ordered by sort_order', async () => {
    const response = await GET();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
  });

  it('POST creates a gallery image', async () => {
    const request = new NextRequest('http://localhost/api/admin/gallery', {
      method: 'POST',
      body: JSON.stringify({ image_url: 'https://x/2.png', caption: 'Engagement', sort_order: 1 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledOnce();
  });

  it('DELETE removes an image by id', async () => {
    const request = new NextRequest('http://localhost/api/admin/gallery/2', { method: 'DELETE' });
    const response = await DELETE(request, { params: { id: '2' } });
    expect(response.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/api/admin/gallery.test.ts`
Expected: FAIL — `Cannot find module '@/app/api/admin/gallery/route'`

- [ ] **Step 3: Implement src/app/api/admin/gallery/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('gallery_images').select('*').order('sort_order');
  if (error) {
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.image_url) {
    return NextResponse.json({ error: 'image_url is required' }, { status: 400 });
  }
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('gallery_images')
    .insert({ image_url: body.image_url, caption: body.caption ?? null, sort_order: body.sort_order ?? 0 })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: 'Failed to create image' }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
```

- [ ] **Step 4: Implement src/app/api/admin/gallery/[id]/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('gallery_images').delete().eq('id', params.id);
  if (error) {
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/api/admin/gallery.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Build GalleryManager and the admin page (manual verification)**

`src/components/admin/GalleryManager.tsx`:
```tsx
'use client';

import { useState } from 'react';
import type { GalleryImage } from '@/lib/types';
import { ImageUploader } from './ImageUploader';

export function GalleryManager({ initial }: { initial: GalleryImage[] }) {
  const [images, setImages] = useState(initial);
  const [caption, setCaption] = useState('');

  async function handleUploaded(url: string) {
    const response = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: url, caption: caption || null, sort_order: images.length }),
    });
    if (response.ok) {
      const created = await response.json();
      setImages([...images, created]);
      setCaption('');
    }
  }

  async function removeImage(id: string) {
    const response = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setImages(images.filter((image) => image.id !== id));
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.image_url} alt={image.caption ?? ''} className="h-32 w-full rounded-md object-cover" />
            <button onClick={() => removeImage(image.id)} className="absolute right-1 top-1 rounded bg-black/70 px-2 text-xs text-white">
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 rounded-md border border-black/10 p-4">
        <h2 className="text-lg font-semibold">Add photo</h2>
        <input placeholder="Caption (optional)" value={caption} onChange={(e) => setCaption(e.target.value)} className="rounded-md border border-black/20 px-3 py-2" />
        <ImageUploader label="Upload photo" value={null} onUploaded={handleUploaded} />
      </div>
    </div>
  );
}
```

`src/app/admin/gallery/page.tsx`:
```tsx
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { GalleryManager } from '@/components/admin/GalleryManager';
import type { GalleryImage } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminGalleryPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('gallery_images').select('*').order('sort_order');
  return (
    <main className="flex justify-center">
      <GalleryManager initial={(data as GalleryImage[]) ?? []} />
    </main>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/admin/gallery src/components/admin/GalleryManager.tsx src/app/admin/gallery/page.tsx tests/api/admin/gallery.test.ts
git commit -m "feat: add gallery API and admin manager"
```

---

### Task 14: RSVP validation + public RSVP API

**Files:**
- Create: `src/lib/validation/rsvp.ts`
- Create: `src/app/api/rsvp/route.ts`
- Test: `tests/lib/validation/rsvp.test.ts`
- Test: `tests/api/rsvp.test.ts`

**Interfaces:**
- Produces: `rsvpSchema` (zod), `RsvpInput` type, `POST /api/rsvp` (body: `RsvpInput` → 201 `{ success: true }`, or 400 with validation errors). Consumed by `src/components/site/RsvpModal.tsx` (Task 17).

- [ ] **Step 1: Write the failing validation tests**

`tests/lib/validation/rsvp.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { rsvpSchema } from '@/lib/validation/rsvp';

describe('rsvpSchema', () => {
  it('accepts a fully valid submission', () => {
    const result = rsvpSchema.safeParse({
      name: 'Juan Dela Cruz',
      email: 'juan@example.com',
      phone: '+63 900 000 0000',
      attending: true,
      guest_count: 2,
      meal_preference: 'Vegetarian',
      message: 'Excited!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a missing name', () => {
    const result = rsvpSchema.safeParse({ email: 'juan@example.com', attending: true, guest_count: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid email', () => {
    const result = rsvpSchema.safeParse({ name: 'Juan', email: 'not-an-email', attending: true, guest_count: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects a guest_count below 1', () => {
    const result = rsvpSchema.safeParse({ name: 'Juan', email: 'juan@example.com', attending: true, guest_count: 0 });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/validation/rsvp.test.ts`
Expected: FAIL — `Cannot find module '@/lib/validation/rsvp'`

- [ ] **Step 3: Implement src/lib/validation/rsvp.ts**

```ts
import { z } from 'zod';

export const rsvpSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('A valid email is required'),
  phone: z.string().max(50).optional().nullable(),
  attending: z.boolean(),
  guest_count: z.number().int().min(1).max(20),
  meal_preference: z.string().max(200).optional().nullable(),
  message: z.string().max(2000).optional().nullable(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lib/validation/rsvp.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Write the failing API test**

`tests/api/rsvp.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const insertMock = vi.fn(async () => ({ error: null }));
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { POST } from '@/app/api/rsvp/route';

describe('POST /api/rsvp', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects an invalid payload with 400 and does not touch the database', async () => {
    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ name: '', email: 'bad', attending: true, guest_count: 0 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('inserts a valid RSVP and returns 201', async () => {
    const request = new NextRequest('http://localhost/api/rsvp', {
      method: 'POST',
      body: JSON.stringify({ name: 'Juan', email: 'juan@example.com', attending: true, guest_count: 2 }),
    });
    const response = await POST(request);
    expect(response.status).toBe(201);
    expect(insertMock).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run tests/api/rsvp.test.ts`
Expected: FAIL — `Cannot find module '@/app/api/rsvp/route'`

- [ ] **Step 7: Implement src/app/api/rsvp/route.ts**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { rsvpSchema } from '@/lib/validation/rsvp';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from('rsvps').insert(parsed.data);
  if (error) {
    return NextResponse.json({ error: 'Failed to save RSVP' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run tests/api/rsvp.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 9: Commit**

```bash
git add src/lib/validation/rsvp.ts src/app/api/rsvp/route.ts tests/lib/validation/rsvp.test.ts tests/api/rsvp.test.ts
git commit -m "feat: add RSVP validation and public submission API"
```

---

### Task 15: Admin RSVP dashboard (list + CSV export)

**Files:**
- Create: `src/app/api/admin/rsvps/route.ts`
- Create: `src/app/api/admin/rsvps/export/route.ts`
- Create: `src/components/admin/RsvpTable.tsx`
- Create: `src/app/admin/rsvps/page.tsx`
- Test: `tests/api/admin/rsvps.test.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient`, `Rsvp` type (Task 2).
- Produces: `GET /api/admin/rsvps` → `Rsvp[]` (newest first), `GET /api/admin/rsvps/export` → `text/csv` body.

- [ ] **Step 1: Write the failing tests**

`tests/api/admin/rsvps.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const orderMock = vi.fn();
const selectMock = vi.fn(() => ({ order: orderMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: () => ({ from: fromMock }),
}));

import { GET as listRsvps } from '@/app/api/admin/rsvps/route';
import { GET as exportRsvps } from '@/app/api/admin/rsvps/export/route';

const sampleRsvp = {
  id: '1',
  name: 'Juan Dela Cruz',
  email: 'juan@example.com',
  phone: null,
  attending: true,
  guest_count: 2,
  meal_preference: 'Vegetarian',
  message: 'Excited!',
  created_at: '2026-01-01T00:00:00Z',
};

describe('/api/admin/rsvps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orderMock.mockResolvedValue({ data: [sampleRsvp], error: null });
  });

  it('GET lists RSVPs newest-first', async () => {
    const response = await listRsvps();
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data).toEqual([sampleRsvp]);
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
  });

  it('GET export returns a CSV with a header row and the RSVP data', async () => {
    const response = await exportRsvps();
    const text = await response.text();
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(text.split('\n')[0]).toBe('name,email,phone,attending,guest_count,meal_preference,message,created_at');
    expect(text).toContain('Juan Dela Cruz');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/api/admin/rsvps.test.ts`
Expected: FAIL — `Cannot find module '@/app/api/admin/rsvps/route'`

- [ ] **Step 3: Implement src/app/api/admin/rsvps/route.ts**

```ts
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: 'Failed to load RSVPs' }, { status: 500 });
  }
  return NextResponse.json(data);
}
```

- [ ] **Step 4: Implement src/app/api/admin/rsvps/export/route.ts**

```ts
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Rsvp } from '@/lib/types';

const HEADERS: (keyof Rsvp)[] = ['name', 'email', 'phone', 'attending', 'guest_count', 'meal_preference', 'message', 'created_at'];

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: 'Failed to load RSVPs' }, { status: 500 });
  }

  const rows = (data as Rsvp[]).map((rsvp) => HEADERS.map((key) => csvEscape(rsvp[key])).join(','));
  const csv = [HEADERS.join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="rsvps.csv"',
    },
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/api/admin/rsvps.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Build RsvpTable and the admin page (manual verification)**

`src/components/admin/RsvpTable.tsx`:
```tsx
import type { Rsvp } from '@/lib/types';

export function RsvpTable({ rsvps }: { rsvps: Rsvp[] }) {
  return (
    <div className="w-full overflow-x-auto p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">RSVPs ({rsvps.length})</h1>
        <a href="/api/admin/rsvps/export" className="rounded-md bg-black px-4 py-2 text-sm text-white">
          Export CSV
        </a>
      </div>
      <table className="min-w-[720px] w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-black/10">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Attending</th>
            <th className="py-2 pr-4">Guests</th>
            <th className="py-2 pr-4">Meal</th>
            <th className="py-2 pr-4">Message</th>
          </tr>
        </thead>
        <tbody>
          {rsvps.map((rsvp) => (
            <tr key={rsvp.id} className="border-b border-black/5">
              <td className="py-2 pr-4">{rsvp.name}</td>
              <td className="py-2 pr-4">{rsvp.email}</td>
              <td className="py-2 pr-4">{rsvp.attending ? 'Yes' : 'No'}</td>
              <td className="py-2 pr-4">{rsvp.guest_count}</td>
              <td className="py-2 pr-4">{rsvp.meal_preference ?? '—'}</td>
              <td className="py-2 pr-4">{rsvp.message ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

`src/app/admin/rsvps/page.tsx`:
```tsx
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { RsvpTable } from '@/components/admin/RsvpTable';
import type { Rsvp } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminRsvpsPage() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from('rsvps').select('*').order('created_at', { ascending: false });
  return <RsvpTable rsvps={(data as Rsvp[]) ?? []} />;
}
```

- [ ] **Step 7: Commit**

```bash
git add src/app/api/admin/rsvps src/components/admin/RsvpTable.tsx src/app/admin/rsvps/page.tsx tests/api/admin/rsvps.test.ts
git commit -m "feat: add RSVP admin dashboard with CSV export"
```

---

### Task 16: Admin layout/nav + dashboard page

**Files:**
- Create: `src/components/admin/AdminNav.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Produces: shared `/admin/*` chrome (nav + logout button) wrapping all admin pages built in Tasks 8–15.

- [ ] **Step 1: Build AdminNav**

`src/components/admin/AdminNav.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/our-story', label: 'Our Story' },
  { href: '/admin/entourage', label: 'Entourage' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/rsvps', label: 'RSVPs' },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <nav className="flex flex-wrap items-center gap-3 border-b border-black/10 p-4 sm:gap-4 sm:px-6">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-sm ${pathname === link.href ? 'font-semibold underline' : 'text-black/70'}`}
        >
          {link.label}
        </Link>
      ))}
      <button onClick={handleLogout} className="ml-auto text-sm text-red-600">
        Log out
      </button>
    </nav>
  );
}
```

- [ ] **Step 2: Build the admin layout (skips nav on the login page)**

`src/app/admin/layout.tsx`:
```tsx
import { AdminNav } from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <AdminNav />
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Build the dashboard landing page**

`src/app/admin/page.tsx`:
```tsx
import Link from 'next/link';

const SECTIONS = [
  { href: '/admin/settings', label: 'Site Settings', description: 'Couple names, wedding date, hero image, theme, maps.' },
  { href: '/admin/our-story', label: 'Our Story', description: 'Story image, title, excerpt, and full story.' },
  { href: '/admin/entourage', label: 'Entourage', description: 'Parents, godparents, and other roles.' },
  { href: '/admin/gallery', label: 'Gallery', description: 'Photo gallery images.' },
  { href: '/admin/rsvps', label: 'RSVPs', description: 'View and export guest responses.' },
];

export default function AdminDashboardPage() {
  return (
    <main className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
      {SECTIONS.map((section) => (
        <Link key={section.href} href={section.href} className="rounded-lg border border-black/10 p-4 hover:border-black/30">
          <h2 className="text-lg font-semibold">{section.label}</h2>
          <p className="text-sm text-black/60">{section.description}</p>
        </Link>
      ))}
    </main>
  );
}
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, log in at `/admin/login`, confirm the dashboard shows all 5 links, each nav link routes correctly, and "Log out" redirects to `/admin/login` and re-blocks `/admin`.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AdminNav.tsx src/app/admin/layout.tsx src/app/admin/page.tsx
git commit -m "feat: add admin layout, nav, and dashboard"
```

---

### Task 17: RSVP modal context + trigger + modal

**Files:**
- Create: `src/lib/rsvp-modal-context.tsx`
- Create: `src/components/site/RsvpTrigger.tsx`
- Create: `src/components/site/RsvpModal.tsx`

**Interfaces:**
- Consumes: `rsvpSchema`/`RsvpInput` (Task 14).
- Produces: `RsvpModalProvider` (client component, wraps the page), `useRsvpModal(): { open: boolean; openModal: () => void; closeModal: () => void }`. Consumed by `src/components/site/Hero.tsx` (Task 18, via `RsvpTrigger`) and `src/app/page.tsx` (Task 23, wraps the whole tree in the provider).

- [ ] **Step 1: Build the context**

`src/lib/rsvp-modal-context.tsx`:
```tsx
'use client';

import { createContext, useContext, useMemo, useState } from 'react';

interface RsvpModalState {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const RsvpModalContext = createContext<RsvpModalState | null>(null);

export function RsvpModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({ open, openModal: () => setOpen(true), closeModal: () => setOpen(false) }),
    [open]
  );
  return <RsvpModalContext.Provider value={value}>{children}</RsvpModalContext.Provider>;
}

export function useRsvpModal(): RsvpModalState {
  const context = useContext(RsvpModalContext);
  if (!context) {
    throw new Error('useRsvpModal must be used within an RsvpModalProvider');
  }
  return context;
}
```

- [ ] **Step 2: Build the trigger button**

`src/components/site/RsvpTrigger.tsx`:
```tsx
'use client';

import { useRsvpModal } from '@/lib/rsvp-modal-context';

export function RsvpTrigger({ className }: { className?: string }) {
  const { openModal } = useRsvpModal();
  return (
    <button onClick={openModal} className={className ?? 'rounded-lg bg-white px-6 py-3 font-semibold text-black'}>
      RSVP
    </button>
  );
}
```

- [ ] **Step 3: Build the RSVP modal (form + submit to /api/rsvp)**

`src/components/site/RsvpModal.tsx`:
```tsx
'use client';

import { useState } from 'react';
import { useRsvpModal } from '@/lib/rsvp-modal-context';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  attending: true,
  guest_count: 1,
  meal_preference: '',
  message: '',
};

export function RsvpModal() {
  const { open, closeModal } = useRsvpModal();
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('submitting');
    const response = await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setStatus(response.ok ? 'success' : 'error');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">RSVP</h2>
          <button onClick={closeModal} aria-label="Close" className="text-2xl leading-none">
            &times;
          </button>
        </div>
        {status === 'success' ? (
          <p className="text-green-700">Thank you! Your RSVP has been received.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
            <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.attending} onChange={(e) => setForm({ ...form, attending: e.target.checked })} />
              I will be attending
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={form.guest_count}
              onChange={(e) => setForm({ ...form, guest_count: Number(e.target.value) })}
              className="rounded-md border border-black/20 px-3 py-2"
            />
            <input placeholder="Meal preference" value={form.meal_preference} onChange={(e) => setForm({ ...form, meal_preference: e.target.value })} className="rounded-md border border-black/20 px-3 py-2" />
            <textarea placeholder="Message to the couple" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-20 rounded-md border border-black/20 px-3 py-2" />
            <button type="submit" disabled={status === 'submitting'} className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50">
              {status === 'submitting' ? 'Submitting…' : 'Submit RSVP'}
            </button>
            {status === 'error' && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/rsvp-modal-context.tsx src/components/site/RsvpTrigger.tsx src/components/site/RsvpModal.tsx
git commit -m "feat: add RSVP modal context, trigger, and form modal"
```

---

### Task 18: Hero + Countdown sections

**Files:**
- Create: `src/components/site/Hero.tsx`
- Create: `src/components/site/Countdown.tsx`

**Interfaces:**
- Consumes: `Settings` type (Task 2), `getCountdownParts` (Task 3), `RsvpTrigger` (Task 17).
- Produces: `Hero({ settings }: { settings: Settings })`, `Countdown({ weddingDate }: { weddingDate: string })` (client component, ticks every second). Consumed by `src/app/page.tsx` (Task 23).

- [ ] **Step 1: Build Hero**

`src/components/site/Hero.tsx`:
```tsx
import type { Settings } from '@/lib/types';
import { RsvpTrigger } from './RsvpTrigger';

export function Hero({ settings }: { settings: Settings }) {
  return (
    <header
      className="relative flex h-[70vh] min-h-[420px] w-full items-center justify-center bg-cover bg-center px-4 text-center sm:h-[85vh]"
      style={{ backgroundImage: settings.hero_image_url ? `url(${settings.hero_image_url})` : undefined }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative flex flex-col items-center gap-6">
        <h1 className="font-serif text-5xl text-white drop-shadow-lg sm:text-7xl lg:text-8xl">
          {settings.couple_names}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href="#our-story" className="rounded-lg bg-white px-6 py-3 font-semibold text-black">
            Get Started
          </a>
          <RsvpTrigger />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Build Countdown**

`src/components/site/Countdown.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { getCountdownParts, type CountdownParts } from '@/lib/countdown';

const UNITS: (keyof Omit<CountdownParts, 'isPast'>)[] = ['months', 'weeks', 'days', 'hours', 'minutes', 'seconds'];

export function Countdown({ weddingDate }: { weddingDate: string }) {
  const target = new Date(weddingDate);
  const [parts, setParts] = useState<CountdownParts>(() => getCountdownParts(target));

  useEffect(() => {
    const interval = setInterval(() => setParts(getCountdownParts(target)), 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  return (
    <section className="flex w-full flex-col items-center gap-5 bg-black py-10 text-white">
      <h2 className="text-2xl font-semibold tracking-wide sm:text-3xl">
        {parts.isPast ? 'WE ARE MARRIED!' : 'LIVE COUNTDOWN'}
      </h2>
      {!parts.isPast && (
        <div className="grid w-full max-w-4xl grid-cols-3 gap-4 px-4 text-center sm:grid-cols-6">
          {UNITS.map((unit) => (
            <div key={unit} className="flex flex-col items-center">
              <span className="text-3xl font-semibold sm:text-4xl lg:text-5xl">
                {String(parts[unit]).padStart(2, '0')}
              </span>
              <span className="text-xs capitalize text-white/70 sm:text-sm">{unit}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/site/Hero.tsx src/components/site/Countdown.tsx
git commit -m "feat: add Hero and Countdown sections"
```

---

### Task 19: Our Story section + modal

**Files:**
- Create: `src/components/site/OurStory.tsx`
- Create: `src/components/site/StoryModal.tsx`

**Interfaces:**
- Consumes: `OurStory` type (Task 2).
- Produces: `OurStory({ story }: { story: OurStoryData })` (composes `StoryModal` internally, manages its own open/close state — independent of the RSVP context). Consumed by `src/app/page.tsx` (Task 23).

- [ ] **Step 1: Build StoryModal**

`src/components/site/StoryModal.tsx`:
```tsx
'use client';

interface StoryModalProps {
  open: boolean;
  title: string;
  fullStory: string;
  onClose: () => void;
}

export function StoryModal({ open, title, fullStory, onClose }: StoryModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 sm:p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-3xl sm:text-4xl">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-2xl leading-none">
            &times;
          </button>
        </div>
        <p className="whitespace-pre-line text-black/70">{fullStory}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build OurStory**

`src/components/site/OurStory.tsx`:
```tsx
'use client';

import { useState } from 'react';
import type { OurStory as OurStoryData } from '@/lib/types';
import { StoryModal } from './StoryModal';

export function OurStory({ story }: { story: OurStoryData }) {
  const [open, setOpen] = useState(false);

  return (
    <section id="our-story" className="flex w-full flex-col items-center gap-10 px-4 py-16 sm:px-8 lg:px-16">
      <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl">Our Story</h2>
      <div className="flex w-full max-w-5xl flex-col items-center gap-8 lg:flex-row lg:gap-16">
        {story.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={story.image_url} alt={story.title} className="aspect-[576/388] w-full max-w-lg rounded-2xl object-cover lg:flex-1" />
        )}
        <div className="flex w-full max-w-md flex-col items-start gap-6">
          <h3 className="text-3xl font-bold sm:text-4xl">{story.title}</h3>
          <p className="text-black/55">{story.excerpt}</p>
          <button onClick={() => setOpen(true)} className="rounded-lg border border-black px-6 py-3">
            {story.button_label}
          </button>
        </div>
      </div>
      <StoryModal open={open} title={story.title} fullStory={story.full_story} onClose={() => setOpen(false)} />
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/site/OurStory.tsx src/components/site/StoryModal.tsx
git commit -m "feat: add Our Story section with full-story modal"
```

---

### Task 20: Gallery section

**Files:**
- Create: `src/components/site/Gallery.tsx`

**Interfaces:**
- Consumes: `GalleryImage` type (Task 2).
- Produces: `Gallery({ images }: { images: GalleryImage[] })`. Consumed by `src/app/page.tsx` (Task 23).

- [ ] **Step 1: Build Gallery**

`src/components/site/Gallery.tsx`:
```tsx
import type { GalleryImage } from '@/lib/types';

export function Gallery({ images }: { images: GalleryImage[] }) {
  if (images.length === 0) return null;

  return (
    <section className="flex w-full flex-col items-center gap-10 px-4 py-16 sm:px-8 lg:px-16">
      <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl">Gallery</h2>
      <div className="grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {images.map((image) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={image.id}
            src={image.image_url}
            alt={image.caption ?? 'Gallery photo'}
            className="aspect-square w-full rounded-lg object-cover"
          />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/site/Gallery.tsx
git commit -m "feat: add Gallery section"
```

---

### Task 21: Entourage section

**Files:**
- Create: `src/components/site/Entourage.tsx`

**Interfaces:**
- Consumes: `EntourageMember`, `EntourageCategory` types (Task 2).
- Produces: `Entourage({ members }: { members: EntourageMember[] })` — groups members by category into three columns/stacks. Consumed by `src/app/page.tsx` (Task 23).

- [ ] **Step 1: Build Entourage**

`src/components/site/Entourage.tsx`:
```tsx
import type { EntourageMember, EntourageCategory } from '@/lib/types';

const CATEGORY_LABELS: Record<EntourageCategory, string> = {
  parents: 'Parents',
  godparents: 'Godparents',
  other: 'Entourage',
};

function groupByCategory(members: EntourageMember[]) {
  return members.reduce<Record<EntourageCategory, EntourageMember[]>>(
    (acc, member) => {
      acc[member.category] = [...(acc[member.category] ?? []), member];
      return acc;
    },
    { parents: [], godparents: [], other: [] }
  );
}

export function Entourage({ members }: { members: EntourageMember[] }) {
  const grouped = groupByCategory(members);

  return (
    <section className="flex w-full flex-col items-center gap-10 px-4 py-16 sm:px-8 lg:px-16">
      <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl">Entourage</h2>
      <div className="grid w-full max-w-5xl grid-cols-1 gap-10 sm:grid-cols-3">
        {(Object.keys(CATEGORY_LABELS) as EntourageCategory[]).map((category) => (
          <div key={category} className="flex flex-col items-center gap-3 text-center">
            <h3 className="text-xl font-semibold">{CATEGORY_LABELS[category]}</h3>
            <ul className="flex flex-col gap-1 text-black/70">
              {grouped[category].map((member) => (
                <li key={member.id}>
                  <span className="block text-sm text-black/50">{member.role_label}</span>
                  {member.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/site/Entourage.tsx
git commit -m "feat: add Entourage section grouped by category"
```

---

### Task 22: Maps section

**Files:**
- Create: `src/components/site/MapEmbed.tsx`

**Interfaces:**
- Consumes: `Settings` type (Task 2).
- Produces: `MapEmbed({ address, embedUrl }: { address: string | null; embedUrl: string | null })`. Consumed by `src/app/page.tsx` (Task 23).

- [ ] **Step 1: Build MapEmbed**

`src/components/site/MapEmbed.tsx`:
```tsx
export function MapEmbed({ address, embedUrl }: { address: string | null; embedUrl: string | null }) {
  if (!embedUrl) return null;

  return (
    <section className="flex w-full flex-col items-center gap-6 px-4 py-16 sm:px-8 lg:px-16">
      <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl">Venue</h2>
      {address && <p className="text-center text-black/70">{address}</p>}
      <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg">
        <iframe
          src={embedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Venue map"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/site/MapEmbed.tsx
git commit -m "feat: add Maps section with embedded Google Maps iframe"
```

---

### Task 23: Compose the public homepage

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx` (nothing further needed — theme is applied per-request in `page.tsx`'s wrapper, since `data-theme` depends on DB content fetched inside the route)

**Interfaces:**
- Consumes: every section component from Tasks 17–22, `getSupabaseServerClient`, all DB types (Task 2), `RsvpModalProvider`/`RsvpModal` (Task 17).
- Produces: the final `/` route.

- [ ] **Step 1: Replace src/app/page.tsx with the full composed page**

```tsx
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Settings, OurStory as OurStoryData, EntourageMember, GalleryImage } from '@/lib/types';
import { RsvpModalProvider } from '@/lib/rsvp-modal-context';
import { RsvpModal } from '@/components/site/RsvpModal';
import { Hero } from '@/components/site/Hero';
import { Countdown } from '@/components/site/Countdown';
import { OurStory } from '@/components/site/OurStory';
import { Gallery } from '@/components/site/Gallery';
import { Entourage } from '@/components/site/Entourage';
import { MapEmbed } from '@/components/site/MapEmbed';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = getSupabaseServerClient();

  const [{ data: settings }, { data: story }, { data: entourage }, { data: gallery }] = await Promise.all([
    supabase.from('settings').select('*').eq('id', 1).single<Settings>(),
    supabase.from('our_story').select('*').eq('id', 1).single<OurStoryData>(),
    supabase.from('entourage_members').select('*').order('sort_order'),
    supabase.from('gallery_images').select('*').order('sort_order'),
  ]);

  const resolvedSettings = settings as Settings;

  return (
    <div data-theme={resolvedSettings.theme}>
      <RsvpModalProvider>
        <main className="flex w-full flex-col items-center">
          <Hero settings={resolvedSettings} />
          <Countdown weddingDate={resolvedSettings.wedding_date} />
          <OurStory story={story as OurStoryData} />
          <Gallery images={(gallery as GalleryImage[]) ?? []} />
          <Entourage members={(entourage as EntourageMember[]) ?? []} />
          <MapEmbed address={resolvedSettings.maps_address} embedUrl={resolvedSettings.maps_embed_url} />
        </main>
        <RsvpModal />
      </RsvpModalProvider>
    </div>
  );
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, visit `/`, confirm every section renders with data from Supabase (seeded defaults from `schema.sql` if the admin hasn't edited anything yet), the RSVP button opens the modal, "Continue Reading" opens the story modal, and the countdown ticks.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: compose full public homepage from all sections"
```

---

### Task 24: Responsive pass, full local run-through, and README

**Files:**
- Modify: any component from Tasks 18–22 where the manual check below finds a layout break
- Modify: `README.md`

**Interfaces:**
- No new interfaces — this task verifies and documents the completed system.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests across every task pass.

- [ ] **Step 2: Responsive manual check**

Run: `npm run dev`. Using the browser dev tools device toolbar, check the public page and every `/admin` page at three widths: 375px (mobile), 768px (tablet), 1440px (desktop). Confirm:
- No horizontal scrollbar at any width.
- Hero text and buttons stay legible and centered on mobile.
- Countdown units wrap to `grid-cols-3` on mobile instead of overflowing.
- Our Story stacks image-then-text on mobile (`flex-col`) and sits side-by-side at `lg`.
- Gallery grid drops to 2 columns on mobile.
- Entourage columns stack to 1 column on mobile.
- Admin forms and tables remain usable (RSVP table scrolls horizontally inside its own container, not the page).

Fix any breakage found by adjusting Tailwind classes in the relevant component, then re-check.

- [ ] **Step 3: End-to-end content flow check**

With a real Supabase project and Vercel Blob token configured in `.env.local` (see README below): log into `/admin`, edit Settings (couple names, date, theme, hero image), Our Story, add an Entourage member, add a Gallery photo, then reload `/` and confirm every change appears. Submit the RSVP modal on `/` and confirm the new row appears in `/admin/rsvps` and in the CSV export.

- [ ] **Step 4: Write the full README**

`README.md`:
```md
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
```

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add full setup, testing, and deployment instructions"
```

---

## Self-Review Notes

- **Spec coverage:** Hero/Our Story/Entourage/Gallery/Maps/RSVP-modal/Theme/dynamic-content/responsive/admin-at-`/admin`/Supabase/Vercel-Blob/single-password-auth are each covered by a task above (Tasks 16–23 for sections, Task 7/8 for auth, Task 24 for responsiveness).
- **Type consistency:** `Settings`, `OurStory`, `EntourageMember`, `EntourageCategory`, `EntourageSide`, `GalleryImage`, `Rsvp` (Task 2) are the single source of type truth reused verbatim across every later task's route handlers and components — no renamed duplicates.
- **No placeholders:** every step above contains runnable code or an exact command; no task depends on content described only in another task.
