-- Categories + sub categories.
--   Top-level category  = skill group on the resume (e.g. "Backend Development")
--   Sub category        = a skill / tech stack item inside that group (e.g. "Go (Golang)")
-- Blog posts are tagged with categories as before; tagging a post with
-- sub categories is how its tech stack is recorded.

-- Clean up the earlier draft of this migration if it was applied (skills are sub categories now).
drop table if exists public.skills;

alter table public.categories
  add column if not exists parent_id      uuid references public.categories(id) on delete set null,
  add column if not exists sort_order     integer not null default 100,
  add column if not exists show_on_resume boolean not null default true;

create index if not exists categories_parent_idx on public.categories (parent_id, sort_order);

-- Keep the tree to two levels (group -> skill) and block self/cyclic parents.
create or replace function public.enforce_category_depth()
returns trigger language plpgsql as $$
begin
  if new.parent_id is null then
    return new;
  end if;
  if new.parent_id = new.id then
    raise exception 'A category cannot be its own parent.';
  end if;
  if exists (select 1 from public.categories p where p.id = new.parent_id and p.parent_id is not null) then
    raise exception 'Sub categories can only be one level deep. Pick a top-level category as the parent.';
  end if;
  if exists (select 1 from public.categories c where c.parent_id = new.id) then
    raise exception 'This category has sub categories, so it cannot become a sub category itself.';
  end if;
  return new;
end $$;

drop trigger if exists enforce_category_depth on public.categories;
create trigger enforce_category_depth before insert or update of parent_id on public.categories
  for each row execute function public.enforce_category_depth();

-- ---------- One-time import of skills stored inside resume.data ----------
-- data->'skillGroups' ([{category, items[]}]) becomes group categories with sub categories.
-- An existing category with the same slug is reused (so existing post tags keep working);
-- it is moved under the group only if it is currently top-level and has no sub categories of its own.
-- Runs only while no sub categories exist, so re-running never duplicates anything.
do $$
declare
  r        jsonb;
  g        jsonb;
  item     text;
  grp_id   uuid;
  sub_id   uuid;
  grp_name text;
  grp_slug text;
  sub_slug text;
  g_idx    integer := 0;
  i_idx    integer;
begin
  if exists (select 1 from public.categories where parent_id is not null) then
    return;
  end if;

  select data into r from public.resume where id = 'default';
  if r is null or jsonb_typeof(r->'skillGroups') <> 'array' then
    return;
  end if;

  for g in select * from jsonb_array_elements(r->'skillGroups') loop
    grp_name := nullif(trim(g->>'category'), '');
    continue when grp_name is null;
    grp_slug := trim(both '-' from regexp_replace(lower(grp_name), '[^a-z0-9]+', '-', 'g'));
    continue when grp_slug = '';
    g_idx := g_idx + 1;

    insert into public.categories (name, slug, sort_order)
    values (grp_name, grp_slug, g_idx * 10)
    on conflict (slug) do update set sort_order = excluded.sort_order
    returning id into grp_id;

    -- A group that already hangs under another category cannot have children.
    continue when exists (select 1 from public.categories where id = grp_id and parent_id is not null);

    i_idx := 0;
    for item in select jsonb_array_elements_text(coalesce(g->'items', '[]'::jsonb)) loop
      item := trim(item);
      continue when item = '';
      sub_slug := trim(both '-' from regexp_replace(lower(item), '[^a-z0-9]+', '-', 'g'));
      continue when sub_slug = '' or sub_slug = grp_slug;
      i_idx := i_idx + 1;

      insert into public.categories (name, slug, parent_id, sort_order)
      values (item, sub_slug, grp_id, i_idx * 10)
      on conflict (slug) do nothing;

      select id into sub_id from public.categories where slug = sub_slug;
      update public.categories c
         set parent_id = grp_id, sort_order = i_idx * 10
       where c.id = sub_id
         and c.parent_id is null
         and not exists (select 1 from public.categories k where k.parent_id = c.id)
         and not exists (select 1 from public.categories k where k.id = c.id and c.id = grp_id);
    end loop;
  end loop;
end $$;
