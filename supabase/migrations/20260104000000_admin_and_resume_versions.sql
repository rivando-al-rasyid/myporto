-- 1) Real admin check. Until now every signed-in user could write everything; sign-up was enough to become admin.
-- 2) Resume contact details are no longer publicly readable.
-- 3) share_events gets basic input limits.
-- 4) Several resume versions (one per target job).

-- ---------- Admins ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
-- No policies on purpose: the table is only read through is_admin() below.

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Everyone who exists today stays an admin (that is you), so nothing breaks on deploy.
insert into public.admins (user_id) select id from auth.users on conflict do nothing;

-- On a fresh project the first account to sign up becomes the admin. Later sign-ups are not admins.
create or replace function public.make_first_user_admin()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.admins) then
    insert into public.admins (user_id) values (new.id) on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists make_first_user_admin on auth.users;
create trigger make_first_user_admin after insert on auth.users
  for each row execute function public.make_first_user_admin();

-- ---------- Policies: writes need is_admin() ----------
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('categories',            'admin all categories'),
      ('site_settings',         'admin all site settings'),
      ('blog_posts',            'admin all posts'),
      ('blog_post_categories',  'admin all post categories'),
      ('resume',                'admin all resume')
    ) as t(tbl, pol)
  loop
    execute format('drop policy if exists %I on public.%I', r.pol, r.tbl);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      r.pol, r.tbl);
  end loop;
end $$;

drop policy if exists "admin read share events" on public.share_events;
create policy "admin read share events" on public.share_events for select to authenticated using (public.is_admin());

drop policy if exists "admin write portfolio media"  on storage.objects;
drop policy if exists "admin update portfolio media" on storage.objects;
drop policy if exists "admin delete portfolio media" on storage.objects;
create policy "admin write portfolio media" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin());
create policy "admin update portfolio media" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());
create policy "admin delete portfolio media" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

-- The resume holds phone and email, and nothing public reads it.
drop policy if exists "public read resume" on public.resume;

-- Share tracking stays open to visitors, but only with sane values.
alter table public.share_events
  drop constraint if exists share_events_platform_check,
  drop constraint if exists share_events_size_check;
alter table public.share_events
  add constraint share_events_platform_check
    check (platform in ('linkedin', 'x', 'facebook', 'copy', 'native')) not valid,
  add constraint share_events_size_check
    check (char_length(coalesce(url, '')) <= 2048 and char_length(coalesce(title, '')) <= 300) not valid;

-- ---------- Resume versions ----------
-- id 'default' stays the main resume; every other row is a version tailored to one target job.
alter table public.resume
  add column if not exists label text not null default 'Default';
