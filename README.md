# Portfolio Knowledge Graph

Next.js 16 portfolio with a Supabase-backed CMS: projects, blog, a knowledge graph that connects them, and a resume / cover letter builder.

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

- **Categories** are two levels deep. A top-level category is a skill group; its sub categories are the skills. Tag projects and posts with sub categories to record their tech stack.
- `On resume` on a category controls whether it appears in the resume Skills section.

## Resume

- `/builder/resume` holds one resume per target job (a *version*). The `Default` version cannot be deleted; use *Duplicate* to copy any version for a new job.
- Projects live inside the job they belong to. A project can be linked to a website project, which supplies its title, summary and tech stack when those fields are left empty.
- Wrap key terms in `**double asterisks**` in highlights to print them bold.
- The cover letter generator uses the selected resume version.
- The resume is private (admin only); there is no public resume page.

## Social sharing queue

Published blog posts and projects are queued automatically (database trigger). Each queue item has one row per platform in `queue_share_posts`: `x` (thread), `instagram`, `facebook`, `linkedin`, each with a status of `pending`, `posted`, `failed` or `skipped`, plus `post_url`, `posted_at` and `error`. Instagram is `skipped` when the content has no cover image.

- The app does **not** post to social networks itself. Your n8n workflow does, using the service role key (it bypasses RLS).
- `queue_share.is_posted` is derived: true once no platform is `pending` or `failed`. Old workflows that set `is_posted` directly still work (true marks every open platform posted, false resets them).
- Editing content does not share again by itself, to avoid duplicate posts. Tick **Share again on social media** when saving an edit, or use **Share again** on `/builder/queue`.

n8n, per platform (example for LinkedIn):

```
# what is waiting
GET  /rest/v1/queue_share_posts?platform=eq.linkedin&status=eq.pending
     &select=queue_id,queue_share(blog_posts(title,slug,excerpt,cover_image),projects(title,slug,summary,image_url))

# after posting
PATCH /rest/v1/queue_share_posts?queue_id=eq.<id>&platform=eq.linkedin
      { "status": "posted", "post_url": "https://...", "posted_at": "<now>", "error": null }

# on failure
PATCH /rest/v1/queue_share_posts?queue_id=eq.<id>&platform=eq.linkedin
      { "status": "failed", "error": "<message>", "attempts": <n+1> }
```

Post URLs on your site are `/blog/<slug>` and `/projects/<slug>`.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run lint    # eslint
npm test        # vitest (resume model and skill helpers)
```
