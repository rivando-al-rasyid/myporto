-- Portfolio Knowledge Graph: schema, triggers, RLS and storage.
-- Apply with `supabase db push` (or paste into the SQL editor).

create extension if not exists pgcrypto;

-- ---------- Enums ----------
do $$ begin
  create type public.publish_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.content_source as enum ('manual', 'github_readme', 'markdown_url');
exception when duplicate_object then null; end $$;

-- ---------- Helpers ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Tables ----------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  content          text not null default '',
  content_source   public.content_source not null default 'manual',
  source_url       text,
  cover_image      text,
  status           public.publish_status not null default 'draft',
  is_featured      boolean not null default false,
  sort_order       integer not null default 100,
  meta_title       text,
  meta_description text,
  canonical_url    text,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  slug             text not null unique,
  summary          text,
  content          text not null default '',
  content_source   public.content_source not null default 'manual',
  source_url       text,
  image_url        text,
  demo_url         text,
  repo_url         text,
  status           public.publish_status not null default 'draft',
  is_featured      boolean not null default false,
  sort_order       integer not null default 100,
  meta_title       text,
  meta_description text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.blog_post_categories (
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  category_id  uuid not null references public.categories(id) on delete cascade,
  primary key (blog_post_id, category_id)
);

create table if not exists public.project_categories (
  project_id  uuid not null references public.projects(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (project_id, category_id)
);

create table if not exists public.site_settings (
  id                   text primary key default 'default',
  site_name            text not null default 'Portfolio Knowledge Graph',
  hero_badge           text not null default '',
  hero_title           text not null default '',
  hero_description     text not null default '',
  primary_cta_label    text not null default '',
  primary_cta_href     text not null default '',
  secondary_cta_label  text not null default '',
  secondary_cta_href   text not null default '',
  updated_at           timestamptz not null default now()
);

-- Share queue: one row per published blog post / project (read by n8n).
create table if not exists public.queue_share (
  id           uuid primary key default gen_random_uuid(),
  blog_post_id uuid unique references public.blog_posts(id) on delete cascade,
  project_id   uuid unique references public.projects(id) on delete cascade,
  is_posted    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint queue_share_one_target check ((blog_post_id is null) <> (project_id is null))
);

create table if not exists public.share_events (
  id          uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('blog', 'project')),
  entity_id   uuid not null,
  platform    text not null,
  url         text,
  title       text,
  created_at  timestamptz not null default now()
);

-- ---------- Indexes ----------
create index if not exists blog_posts_listing_idx on public.blog_posts (status, is_featured desc, sort_order, published_at desc);
create index if not exists projects_listing_idx   on public.projects (status, is_featured desc, sort_order, updated_at desc);
create index if not exists blog_post_categories_category_idx on public.blog_post_categories (category_id);
create index if not exists project_categories_category_idx   on public.project_categories (category_id);
create index if not exists queue_share_pending_idx on public.queue_share (is_posted, created_at desc);
create index if not exists share_events_entity_idx on public.share_events (entity_type, entity_id);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['categories','blog_posts','projects','site_settings','queue_share'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- Auto-queue published content for sharing ----------
create or replace function public.enqueue_blog_share()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    insert into public.queue_share (blog_post_id) values (new.id) on conflict (blog_post_id) do nothing;
  end if;
  return new;
end $$;

create or replace function public.enqueue_project_share()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    insert into public.queue_share (project_id) values (new.id) on conflict (project_id) do nothing;
  end if;
  return new;
end $$;

drop trigger if exists enqueue_blog_share on public.blog_posts;
create trigger enqueue_blog_share after insert or update of status on public.blog_posts
  for each row execute function public.enqueue_blog_share();

drop trigger if exists enqueue_project_share on public.projects;
create trigger enqueue_project_share after insert or update of status on public.projects
  for each row execute function public.enqueue_project_share();

-- ---------- Row Level Security ----------
alter table public.categories            enable row level security;
alter table public.blog_posts            enable row level security;
alter table public.projects              enable row level security;
alter table public.blog_post_categories  enable row level security;
alter table public.project_categories    enable row level security;
alter table public.site_settings         enable row level security;
alter table public.queue_share           enable row level security;
alter table public.share_events          enable row level security;

-- Public (anon + authenticated) can read published content and taxonomy.
create policy "public read categories" on public.categories for select using (true);
create policy "public read site settings" on public.site_settings for select using (true);
create policy "public read published posts" on public.blog_posts for select using (status = 'published');
create policy "public read published projects" on public.projects for select using (status = 'published');
create policy "public read post categories" on public.blog_post_categories for select
  using (exists (select 1 from public.blog_posts p where p.id = blog_post_id and p.status = 'published'));
create policy "public read project categories" on public.project_categories for select
  using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));

-- Signed-in admin(s) manage everything (including drafts).
create policy "admin all categories" on public.categories for all to authenticated using (true) with check (true);
create policy "admin all site settings" on public.site_settings for all to authenticated using (true) with check (true);
create policy "admin all posts" on public.blog_posts for all to authenticated using (true) with check (true);
create policy "admin all projects" on public.projects for all to authenticated using (true) with check (true);
create policy "admin all post categories" on public.blog_post_categories for all to authenticated using (true) with check (true);
create policy "admin all project categories" on public.project_categories for all to authenticated using (true) with check (true);
create policy "admin all queue" on public.queue_share for all to authenticated using (true) with check (true);

-- Share tracking: anyone can record a click, only admins can read.
create policy "anyone insert share events" on public.share_events for insert to anon, authenticated with check (true);
create policy "admin read share events" on public.share_events for select to authenticated using (true);

-- ---------- Storage (image uploads from the CMS) ----------
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

create policy "public read portfolio media" on storage.objects for select
  using (bucket_id = 'portfolio-media');
create policy "admin write portfolio media" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media');
create policy "admin update portfolio media" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio-media');
create policy "admin delete portfolio media" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-media');
