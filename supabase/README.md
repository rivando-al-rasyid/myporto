# Supabase

- `migrations/20260101000000_init.sql` – tables, indexes, triggers, RLS, `portfolio-media` bucket
- `seed.sql` – idempotent sample content

## Local (Supabase CLI)
    supabase start
    supabase db reset      # applies migrations, then seed.sql

## Hosted project
    supabase link --project-ref <ref>
    supabase db push
Then run `seed.sql` in the SQL editor.

Create your admin user under Authentication → Users (any signed-in user can use /builder).
