-- Idempotent seed data. Runs automatically on `supabase db reset`,
-- or paste into the SQL editor after the migration. Safe to run repeatedly.

-- ---------- Site settings ----------
insert into public.site_settings
  (id, site_name, hero_badge, hero_title, hero_description,
   primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href)
values
  ('default', 'Rivando Al Rasyid', 'Open to opportunities',
   'Building products and the systems behind them',
   'Web developer writing about portfolio systems, product engineering and the ideas that connect them.',
   'View GitHub repos', '/projects', 'Read the blog', '/blog')
on conflict (id) do update set
  site_name = excluded.site_name,
  hero_badge = excluded.hero_badge,
  hero_title = excluded.hero_title,
  hero_description = excluded.hero_description,
  primary_cta_label = excluded.primary_cta_label,
  primary_cta_href = excluded.primary_cta_href,
  secondary_cta_label = excluded.secondary_cta_label,
  secondary_cta_href = excluded.secondary_cta_href;

-- ---------- Categories ----------
insert into public.categories (id, name, slug) values
  ('c0000000-0000-4000-8000-000000000001', 'Web Development', 'web-development'),
  ('c0000000-0000-4000-8000-000000000002', 'Next.js',         'nextjs'),
  ('c0000000-0000-4000-8000-000000000003', 'Supabase',        'supabase'),
  ('c0000000-0000-4000-8000-000000000004', 'Product',         'product'),
  ('c0000000-0000-4000-8000-000000000005', 'Data Viz',        'data-viz')
on conflict (slug) do update set name = excluded.name;

-- ---------- Skill groups (top level) and skills (sub categories) ----------
-- Existing topic categories 'nextjs' and 'supabase' are moved under a group so they double as skills.
insert into public.categories (id, name, slug, parent_id, sort_order) values
  ('c1000000-0000-4000-8000-000000000001', 'Frontend Development', 'frontend-development', null, 10),
  ('c1000000-0000-4000-8000-000000000002', 'Backend Development',  'backend-development',  null, 20),
  ('c1000000-0000-4000-8000-000000000003', 'Database Management',  'database-management',  null, 30)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order;

insert into public.categories (id, name, slug, parent_id, sort_order) values
  ('c1000000-0000-4000-8000-000000000004', 'React.js',     'react-js',   'c1000000-0000-4000-8000-000000000001', 10),
  ('c0000000-0000-4000-8000-000000000002', 'Next.js',      'nextjs',     'c1000000-0000-4000-8000-000000000001', 20),
  ('c1000000-0000-4000-8000-000000000005', 'Tailwind CSS', 'tailwind-css','c1000000-0000-4000-8000-000000000001', 30),
  ('c1000000-0000-4000-8000-000000000006', 'Go (Golang)',  'go-golang',  'c1000000-0000-4000-8000-000000000002', 10),
  ('c1000000-0000-4000-8000-000000000007', 'Gin',          'gin',        'c1000000-0000-4000-8000-000000000002', 20),
  ('c1000000-0000-4000-8000-000000000008', 'PostgreSQL',   'postgresql', 'c1000000-0000-4000-8000-000000000003', 10),
  ('c0000000-0000-4000-8000-000000000003', 'Supabase',     'supabase',   'c1000000-0000-4000-8000-000000000003', 20)
on conflict (slug) do update set
  name = excluded.name, parent_id = excluded.parent_id, sort_order = excluded.sort_order;

-- ---------- Blog posts ----------
insert into public.blog_posts
  (id, title, slug, excerpt, content, status, is_featured, sort_order,
   meta_title, meta_description, published_at)
values
  ('b0000000-0000-4000-8000-000000000001',
   'Building a Portfolio as a Knowledge Graph', 'building-a-portfolio-as-a-knowledge-graph',
   'Why I modelled my portfolio as connected nodes instead of a flat list.',
   E'## Why a graph?\n\nA flat list hides how ideas relate. Modelling posts and categories as nodes makes those links visible.\n\n## The data model\n\nEvery post can belong to many categories. The graph is built from the join tables.\n\n```ts\nconst graph = buildGraphData(posts, categories)\n```\n',
   'published', true, 10,
   'Building a Portfolio as a Knowledge Graph', 'How and why I built my portfolio as an interactive knowledge graph.',
   '2026-01-10 09:00:00+00'),
  ('b0000000-0000-4000-8000-000000000002',
   'Caching Server Components with Next.js 16', 'caching-server-components-nextjs-16',
   'Moving from force-dynamic to Cache Components without losing fresh content.',
   E'## The problem\n\nRoute segment config like `dynamic` is not compatible with Cache Components.\n\n## The fix\n\nUse `use cache` with `cacheTag`, and invalidate with `updateTag` after every CMS write.\n',
   'published', false, 20,
   null, null, '2026-02-02 09:00:00+00'),
  ('b0000000-0000-4000-8000-000000000003',
   'Row Level Security Cheatsheet', 'row-level-security-cheatsheet',
   'Policies I reuse in every Supabase project.',
   E'## Draft\n\nNotes on public-read, admin-write policies.\n',
   'draft', false, 30, null, null, null)
on conflict (slug) do update set
  title = excluded.title, excerpt = excluded.excerpt, content = excluded.content,
  status = excluded.status, is_featured = excluded.is_featured, sort_order = excluded.sort_order,
  meta_title = excluded.meta_title, meta_description = excluded.meta_description,
  published_at = excluded.published_at;

-- ---------- Relations ----------
insert into public.blog_post_categories (blog_post_id, category_id) values
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004'),
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000005'),
  ('b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002'),
  ('b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001'),
  ('b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003')
on conflict do nothing;

-- ---------- Resume ----------
-- `do nothing` so re-running the seed never overwrites what you edited in /builder/resume.
insert into public.resume (id, data) values ('default', $json$
{
  "name": "Rivando Al Rasyid",
  "title": "Full-Stack Web Developer",
  "email": "hello@example.com",
  "phone": "+62 800 0000 0000",
  "location": "West Java, Indonesia",
  "website": "example.com",
  "links": [
    { "label": "GitHub", "href": "https://github.com" },
    { "label": "LinkedIn", "href": "https://linkedin.com" }
  ],
  "summary": "Full-stack developer who builds fast, maintainable web products with Next.js, TypeScript and Supabase, and cares about the details between design and data.",
  "skills": ["TypeScript", "Next.js", "React", "Node.js", "Supabase", "PostgreSQL", "Tailwind CSS", "REST APIs", "Git"],
  "experience": [
    {
      "role": "Full-Stack Developer",
      "company": "Company Name",
      "period": "2023 – Present",
      "location": "Remote",
      "points": [
        "Built and shipped customer-facing features with Next.js and Supabase.",
        "Cut page load times by moving data fetching to cached server components.",
        "Designed database schemas and Row Level Security policies for multi-role apps."
      ]
    },
    {
      "role": "Junior Web Developer",
      "company": "Previous Company",
      "period": "2021 – 2023",
      "location": "Jakarta, Indonesia",
      "points": [
        "Developed responsive interfaces in React and Tailwind CSS.",
        "Integrated third-party REST APIs and wrote reusable component libraries."
      ]
    }
  ],
  "education": [
    { "school": "University Name", "degree": "B.Sc. in Computer Science", "period": "2017 – 2021" }
  ]
}
$json$::jsonb)
on conflict (id) do nothing;
