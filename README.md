# Portfolio Knowledge Graph

Next.js 16 portfolio with a Supabase-backed CMS: blog, a knowledge graph that connects posts and categories, GitHub repositories on `/projects`, and a resume / cover letter builder.

## Stack

Next.js (App Router, `cacheComponents`), React 19, Supabase (Postgres, Auth, Storage), Tailwind + shadcn/ui, `@react-pdf/renderer` for the resume PDF, Vitest.

## Setup

```bash
npm install
cp .env.example .env.local   # or create it with the variables below
npm run dev
```

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_MyPortoSUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_MyPortoSUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (metadata, sitemap, robots) |

Apply the database with `supabase db push` (migrations in `supabase/migrations`, sample data in `supabase/seed.sql`).

## Access model

- The public site (`/`, `/blog`, `/projects`, `/graph`) needs no login and only sees published content.
- `/builder` needs a session **and** a row in `public.admins`. The first account created on a fresh project becomes the admin automatically; accounts that exist when the admin migration runs are admins too. Everyone else is signed in but blocked.
- Turn off "Allow new users to sign up" in the Supabase dashboard (Authentication → Sign In / Providers) once your account exists. RLS already blocks non-admin writes, this just stops stray accounts.
- To add another admin: `insert into public.admins (user_id) values ('<auth user id>');`

## Content model

- **Categories** are two levels deep. A top-level category is a skill group; its sub categories are the skills. Tag posts with sub categories to record their tech stack.
- `On resume` on a category controls whether it appears in the resume Skills section.

## Resume

- `/builder/resume` holds one resume per target job (a *version*). The `Default` version cannot be deleted; use *Duplicate* to copy any version for a new job.
- Projects live inside the job they belong to.
- Wrap key terms in `**double asterisks**` in highlights to print them bold.
- The cover letter generator uses the selected resume version.
- The resume is private (admin only); there is no public resume page.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run lint    # eslint
npm test        # vitest (resume model and skill helpers)
```
