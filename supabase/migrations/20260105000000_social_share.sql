-- Per-platform share status for the share queue.
-- queue_share keeps one row per blog post / project; queue_share_posts holds one row per platform
-- (X thread, Instagram, Facebook, LinkedIn) so you can see exactly what is posted, pending or failed.
-- The actual posting is done by your n8n workflow; it reads pending rows and writes the result back here.

alter table public.queue_share
  add column if not exists queued_at timestamptz not null default now();
-- Existing rows count as queued when they were created.
update public.queue_share set queued_at = created_at;

create table if not exists public.queue_share_posts (
  queue_id   uuid not null references public.queue_share(id) on delete cascade,
  platform   text not null check (platform in ('x', 'instagram', 'facebook', 'linkedin')),
  status     text not null default 'pending' check (status in ('pending', 'posted', 'failed', 'skipped')),
  post_url   text,
  posted_at  timestamptz,
  error      text,
  attempts   integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (queue_id, platform)
);

create index if not exists queue_share_posts_todo_idx on public.queue_share_posts (platform, status);

drop trigger if exists set_updated_at on public.queue_share_posts;
create trigger set_updated_at before update on public.queue_share_posts
  for each row execute function public.set_updated_at();

alter table public.queue_share_posts enable row level security;
drop policy if exists "admin all queue posts" on public.queue_share_posts;
create policy "admin all queue posts" on public.queue_share_posts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------- Helpers ----------
create or replace function public.queue_item_has_image(p_blog uuid, p_project uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select nullif(cover_image, '') is not null from public.blog_posts where id = p_blog),
    (select nullif(image_url, '')  is not null from public.projects   where id = p_project),
    false);
$$;

-- Puts every platform of one queue item back to pending (Instagram is skipped without an image).
create or replace function public.reset_queue_platforms(p_queue uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  q       record;
  has_img boolean;
  p       text;
begin
  select blog_post_id, project_id into q from public.queue_share where id = p_queue;
  if not found then return; end if;
  has_img := public.queue_item_has_image(q.blog_post_id, q.project_id);

  foreach p in array array['x', 'instagram', 'facebook', 'linkedin'] loop
    insert into public.queue_share_posts (queue_id, platform, status, error)
    values (
      p_queue, p,
      case when p = 'instagram' and not has_img then 'skipped' else 'pending' end,
      case when p = 'instagram' and not has_img then 'No cover image. Instagram needs one.' end
    )
    on conflict (queue_id, platform) do update
      set status = excluded.status, error = excluded.error,
          post_url = null, posted_at = null, attempts = 0;
  end loop;
end $$;

revoke all on function public.reset_queue_platforms(uuid) from public;
revoke all on function public.queue_item_has_image(uuid, uuid) from public;

-- New queue row (first publish) -> one pending row per platform.
create or replace function public.seed_queue_platforms()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.reset_queue_platforms(new.id);
  return new;
end $$;

drop trigger if exists seed_queue_platforms on public.queue_share;
create trigger seed_queue_platforms after insert on public.queue_share
  for each row execute function public.seed_queue_platforms();

-- ---------- Keep queue_share.is_posted in step with the platform rows ----------
-- is_posted = nothing left pending or failed (skipped platforms do not block it).
create or replace function public.sync_queue_posted()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  qid  uuid := coalesce(new.queue_id, old.queue_id);
  done boolean;
begin
  -- Skip while queue_is_posted_changed (below) is rewriting platform rows from inside an update of the
  -- same queue_share row; touching that row again here would make Postgres abort the statement.
  if coalesce(current_setting('app.queue_legacy', true), '0') = '1' then
    return null;
  end if;

  select not exists (
    select 1 from public.queue_share_posts where queue_id = qid and status in ('pending', 'failed')
  ) into done;

  perform set_config('app.queue_sync', '1', true);
  update public.queue_share set is_posted = done where id = qid and is_posted is distinct from done;
  perform set_config('app.queue_sync', '0', true);
  return null;
end $$;

drop trigger if exists sync_queue_posted on public.queue_share_posts;
create trigger sync_queue_posted after insert or update or delete on public.queue_share_posts
  for each row execute function public.sync_queue_posted();

-- Older automation (or the "Mark posted" button) that flips is_posted directly still works:
--   false -> true  marks every open platform as posted
--   true  -> false puts every platform back to pending
create or replace function public.queue_is_posted_changed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(current_setting('app.queue_sync', true), '0') = '1' then
    return new;
  end if;
  perform set_config('app.queue_legacy', '1', true);
  if new.is_posted and not old.is_posted then
    update public.queue_share_posts
       set status = 'posted', posted_at = now(), error = null
     where queue_id = new.id and status in ('pending', 'failed');
  elsif old.is_posted and not new.is_posted then
    perform public.reset_queue_platforms(new.id);
  end if;
  perform set_config('app.queue_legacy', '0', true);
  return new;
end $$;

drop trigger if exists queue_is_posted_changed on public.queue_share;
create trigger queue_is_posted_changed before update of is_posted on public.queue_share
  for each row execute function public.queue_is_posted_changed();

-- ---------- Share (again) on demand ----------
-- Called from the CMS when you save with "Share again" ticked, and from the queue page.
-- Creates the queue row if needed, otherwise resets every platform to pending.
create or replace function public.request_share(p_blog uuid default null, p_project uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  qid uuid;
begin
  if not public.is_admin() then
    raise exception 'Not allowed.';
  end if;
  if (p_blog is null) = (p_project is null) then
    raise exception 'Pass exactly one of a blog post or a project.';
  end if;

  select id into qid from public.queue_share
   where (p_blog is not null and blog_post_id = p_blog)
      or (p_project is not null and project_id = p_project);

  if qid is null then
    insert into public.queue_share (blog_post_id, project_id) values (p_blog, p_project) returning id into qid;
  else
    perform public.reset_queue_platforms(qid);
    update public.queue_share set queued_at = now() where id = qid;
  end if;
  return qid;
end $$;

revoke all on function public.request_share(uuid, uuid) from public;
grant execute on function public.request_share(uuid, uuid) to authenticated;

-- ---------- Backfill existing queue rows ----------
insert into public.queue_share_posts (queue_id, platform, status, posted_at, error)
select q.id, p.platform,
  case
    when q.is_posted then 'posted'
    when p.platform = 'instagram' and not public.queue_item_has_image(q.blog_post_id, q.project_id) then 'skipped'
    else 'pending'
  end,
  case when q.is_posted then q.updated_at end,
  case
    when not q.is_posted and p.platform = 'instagram' and not public.queue_item_has_image(q.blog_post_id, q.project_id)
      then 'No cover image. Instagram needs one.'
  end
from public.queue_share q
cross join (values ('x'), ('instagram'), ('facebook'), ('linkedin')) as p(platform)
on conflict (queue_id, platform) do nothing;
