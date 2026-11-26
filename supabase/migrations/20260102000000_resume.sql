-- Resume content edited from /builder/resume and shown on /resume.

create table if not exists public.resume (
  id         text primary key default 'default',
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.resume;
create trigger set_updated_at before update on public.resume
  for each row execute function public.set_updated_at();

alter table public.resume enable row level security;

create policy "public read resume" on public.resume for select using (true);
create policy "admin all resume" on public.resume for all to authenticated using (true) with check (true);
