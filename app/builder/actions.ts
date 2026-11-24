'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { slugify, type ContentSource, type PublishStatus } from '@/lib/cms'

type Db = Awaited<ReturnType<typeof createClient>>

async function requireDb(): Promise<Db> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) redirect('/auth/login')
  return supabase
}

const str = (fd: FormData, key: string) => {
  const v = fd.get(key)
  return typeof v === 'string' ? v.trim() : ''
}
const raw = (fd: FormData, key: string) => {
  const v = fd.get(key)
  return typeof v === 'string' ? v : ''
}
const opt = (fd: FormData, key: string) => str(fd, key) || null
const bool = (fd: FormData, key: string) => fd.get(key) === 'on'
const int = (fd: FormData, key: string, fallback: number) => {
  const n = Number.parseInt(str(fd, key), 10)
  return Number.isFinite(n) ? n : fallback
}
const status = (fd: FormData): PublishStatus =>
  str(fd, 'status') === 'published' ? 'published' : 'draft'
const source = (fd: FormData): ContentSource => {
  const v = str(fd, 'content_source')
  return v === 'github_readme' || v === 'markdown_url' ? v : 'manual'
}

function fail(base: string, message: string): never {
  redirect(`${base}?error=${encodeURIComponent(message)}`)
}
function dbMessage(error: { code?: string; message: string }) {
  return error.code === '23505'
    ? 'That slug is already in use. Pick another one.'
    : error.message
}

async function syncCategories(
  db: Db,
  table: 'blog_post_categories' | 'project_categories',
  fk: 'blog_post_id' | 'project_id',
  id: string,
  categoryIds: string[]
) {
  await db.from(table).delete().eq(fk, id)
  if (categoryIds.length) {
    await db
      .from(table)
      .insert(categoryIds.map((category_id) => ({ [fk]: id, category_id })))
  }
}

const categoryIds = (fd: FormData) =>
  fd.getAll('category_ids').filter((v): v is string => typeof v === 'string')

// ---------- Projects ----------
export async function saveProject(formData: FormData) {
  const db = await requireDb()
  const id = str(formData, 'id')
  const base = id ? `/builder/projects/${id}` : '/builder/projects/new'

  const title = str(formData, 'title')
  if (!title) fail(base, 'Title is required.')
  const slug = slugify(str(formData, 'slug') || title)
  if (!slug) fail(base, 'Slug is required.')

  const row = {
    title,
    slug,
    summary: opt(formData, 'summary'),
    content: raw(formData, 'content'),
    content_source: source(formData),
    source_url: opt(formData, 'source_url'),
    image_url: opt(formData, 'image_url'),
    demo_url: opt(formData, 'demo_url'),
    repo_url: opt(formData, 'repo_url'),
    status: status(formData),
    is_featured: bool(formData, 'is_featured'),
    sort_order: int(formData, 'sort_order', 100),
    meta_title: opt(formData, 'meta_title'),
    meta_description: opt(formData, 'meta_description'),
  }

  const { data, error } = id
    ? await db
        .from('projects')
        .update({ ...row, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('id')
        .single()
    : await db.from('projects').insert(row).select('id').single()
  if (error) fail(base, dbMessage(error))

  await syncCategories(db, 'project_categories', 'project_id', data.id, categoryIds(formData))
  revalidatePath('/builder', 'layout')
  updateTag('content')
  redirect('/builder/projects')
}

export async function deleteProject(formData: FormData) {
  const db = await requireDb()
  await db.from('projects').delete().eq('id', str(formData, 'id'))
  revalidatePath('/builder', 'layout')
  updateTag('content')
  redirect('/builder/projects')
}

// ---------- Blog ----------
export async function saveBlogPost(formData: FormData) {
  const db = await requireDb()
  const id = str(formData, 'id')
  const base = id ? `/builder/blog/${id}` : '/builder/blog/new'

  const title = str(formData, 'title')
  if (!title) fail(base, 'Title is required.')
  const slug = slugify(str(formData, 'slug') || title)
  if (!slug) fail(base, 'Slug is required.')

  const st = status(formData)
  let publishedAt: string | null = null
  if (st === 'published') {
    if (id) {
      const { data: existing } = await db
        .from('blog_posts')
        .select('published_at')
        .eq('id', id)
        .maybeSingle()
      publishedAt = existing?.published_at ?? new Date().toISOString()
    } else {
      publishedAt = new Date().toISOString()
    }
  }

  const row = {
    title,
    slug,
    excerpt: opt(formData, 'excerpt'),
    content: raw(formData, 'content'),
    content_source: 'manual' as ContentSource,
    source_url: null,
    cover_image: opt(formData, 'cover_image'),
    status: st,
    is_featured: bool(formData, 'is_featured'),
    sort_order: int(formData, 'sort_order', 100),
    meta_title: opt(formData, 'meta_title'),
    meta_description: opt(formData, 'meta_description'),
    canonical_url: opt(formData, 'canonical_url'),
  }

  const { data, error } = id
    ? await db
        .from('blog_posts')
        .update({
          ...row,
          ...(publishedAt ? { published_at: publishedAt } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select('id')
        .single()
    : await db
        .from('blog_posts')
        .insert({ ...row, published_at: publishedAt })
        .select('id')
        .single()
  if (error) fail(base, dbMessage(error))

  await syncCategories(db, 'blog_post_categories', 'blog_post_id', data.id, categoryIds(formData))
  revalidatePath('/builder', 'layout')
  updateTag('content')
  redirect('/builder/blog')
}

export async function deleteBlogPost(formData: FormData) {
  const db = await requireDb()
  await db.from('blog_posts').delete().eq('id', str(formData, 'id'))
  revalidatePath('/builder', 'layout')
  updateTag('content')
  redirect('/builder/blog')
}

// ---------- Categories ----------
export async function saveCategory(formData: FormData) {
  const db = await requireDb()
  const id = str(formData, 'id')
  const name = str(formData, 'name')
  if (!name) fail('/builder/categories', 'Category name is required.')
  const slug = slugify(str(formData, 'slug') || name)

  const { error } = id
    ? await db
        .from('categories')
        .update({ name, slug, updated_at: new Date().toISOString() })
        .eq('id', id)
    : await db.from('categories').insert({ name, slug })
  if (error) fail('/builder/categories', dbMessage(error))

  revalidatePath('/builder', 'layout')
  updateTag('content')
  redirect('/builder/categories')
}

export async function deleteCategory(formData: FormData) {
  const db = await requireDb()
  await db.from('categories').delete().eq('id', str(formData, 'id'))
  revalidatePath('/builder', 'layout')
  updateTag('content')
  redirect('/builder/categories')
}

// ---------- Site settings ----------
export async function saveSettings(formData: FormData) {
  const db = await requireDb()
  const { error } = await db.from('site_settings').upsert({
    id: 'default',
    site_name: str(formData, 'site_name'),
    hero_badge: str(formData, 'hero_badge'),
    hero_title: str(formData, 'hero_title'),
    hero_description: str(formData, 'hero_description'),
    primary_cta_label: str(formData, 'primary_cta_label'),
    primary_cta_href: str(formData, 'primary_cta_href'),
    secondary_cta_label: str(formData, 'secondary_cta_label'),
    secondary_cta_href: str(formData, 'secondary_cta_href'),
    updated_at: new Date().toISOString(),
  })
  if (error) fail('/builder/settings', error.message)
  revalidatePath('/builder', 'layout')
  updateTag('content')
  redirect('/builder/settings?saved=1')
}

// ---------- Share queue ----------
export async function setQueuePosted(formData: FormData) {
  const db = await requireDb()
  await db
    .from('queue_share')
    .update({
      is_posted: str(formData, 'is_posted') === 'true',
      updated_at: new Date().toISOString(),
    })
    .eq('id', str(formData, 'id'))
  revalidatePath('/builder', 'layout')
  updateTag('content')
  redirect('/builder/queue')
}
