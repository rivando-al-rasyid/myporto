import { cacheLife, cacheTag } from 'next/cache'

import { createPublicClient } from '@/lib/supabase/public'
import type { BlogPost, Category, SiteSettings } from '@/lib/cms'

const blogSelect = '*, blog_post_categories(categories(*))'

interface CategoryJoinRow {
  categories: Category | null
}
type BlogRow = BlogPost & { blog_post_categories?: CategoryJoinRow[] | null }

function mapBlog({ blog_post_categories, ...row }: BlogRow): BlogPost {
  return {
    ...row,
    categories: (blog_post_categories ?? []).map((i) => i.categories).filter(Boolean) as Category[],
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  'use cache'
  cacheTag('content')
  cacheLife('minutes')
  const db = createPublicClient()
  const { data, error } = await db.from('site_settings').select('*').eq('id', 'default').maybeSingle()
  if (error) console.warn('site_settings:', error.message)
  return (data as SiteSettings | null) ?? null
}

export async function getPublishedBlogPosts() {
  'use cache'
  cacheTag('content')
  cacheLife('minutes')
  const db = createPublicClient()
  const { data, error } = await db
    .from('blog_posts')
    .select(blogSelect)
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false })
  if (error) console.warn('blog_posts:', error.message)
  return ((data ?? []) as BlogRow[]).map(mapBlog)
}

export async function getBlogPostBySlug(slug: string) {
  'use cache'
  cacheTag('content')
  cacheLife('minutes')
  const db = createPublicClient()
  const { data, error } = await db
    .from('blog_posts')
    .select(blogSelect)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) console.warn('blog_posts:', error.message)
  return data ? mapBlog(data as BlogRow) : null
}

export async function getCategories() {
  'use cache'
  cacheTag('content')
  cacheLife('minutes')
  const db = createPublicClient()
  const { data, error } = await db.from('categories').select('*').order('name')
  if (error) console.warn('categories:', error.message)
  return (data ?? []) as Category[]
}
