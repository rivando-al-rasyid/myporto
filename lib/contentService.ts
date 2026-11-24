import { cacheLife, cacheTag } from 'next/cache'

import { createPublicClient } from '@/lib/supabase/public'
import { fetchGitHubReadmeFromRepo, fetchMarkdownFromUrl } from '@/lib/content-import'
import type { BlogPost, Category, Project, SiteSettings } from '@/lib/cms'
import { normalizeResume, type ResumeData } from '@/lib/resume'

const blogSelect = '*, blog_post_categories(categories(*))'
const projectSelect = '*, project_categories(categories(*))'

interface CategoryJoinRow {
  categories: Category | null
}
type BlogRow = BlogPost & { blog_post_categories?: CategoryJoinRow[] | null }
type ProjectRow = Project & { project_categories?: CategoryJoinRow[] | null }

function mapBlog({ blog_post_categories, ...row }: BlogRow): BlogPost {
  return {
    ...row,
    categories: (blog_post_categories ?? []).map((i) => i.categories).filter(Boolean) as Category[],
  }
}

function mapProject({ project_categories, ...row }: ProjectRow): Project {
  return {
    ...row,
    categories: (project_categories ?? []).map((i) => i.categories).filter(Boolean) as Category[],
  }
}

// Projects can pull their content live from a GitHub README or a markdown URL.
async function resolveProjectContent(project: Project): Promise<Project> {
  const sourceUrl = project.source_url || project.repo_url
  if (!sourceUrl) return project

  try {
    if (project.content_source === 'github_readme' || (project.content.trim().length === 0 && project.repo_url)) {
      const imported = await fetchGitHubReadmeFromRepo(sourceUrl)
      return {
        ...project,
        content: imported.content,
        source_url: imported.sourceUrl,
        content_source: 'github_readme',
        summary: project.summary || imported.description || project.summary,
        image_url: project.image_url || imported.imageUrl || null,
        repo_url: project.repo_url || imported.repoUrl || null,
        demo_url: project.demo_url || imported.demoUrl || null,
      }
    }

    if (project.content_source === 'markdown_url') {
      const imported = await fetchMarkdownFromUrl(sourceUrl)
      return {
        ...project,
        content: imported.content,
        summary: project.summary || imported.description || project.summary,
        image_url: project.image_url || imported.imageUrl || null,
        repo_url: project.repo_url || imported.repoUrl || null,
        demo_url: project.demo_url || imported.demoUrl || null,
      }
    }
  } catch (error) {
    console.warn('Using stored project content because import failed:', error instanceof Error ? error.message : error)
  }

  return project
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

export async function getPublishedProjects() {
  'use cache'
  cacheTag('content')
  cacheLife('minutes')
  const db = createPublicClient()
  const { data, error } = await db
    .from('projects')
    .select(projectSelect)
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })
  if (error) console.warn('projects:', error.message)
  return ((data ?? []) as ProjectRow[]).map(mapProject)
}

export async function getProjectBySlug(slug: string) {
  'use cache'
  cacheTag('content')
  cacheLife('minutes')
  const db = createPublicClient()
  const { data, error } = await db
    .from('projects')
    .select(projectSelect)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) console.warn('projects:', error.message)
  return data ? resolveProjectContent(mapProject(data as ProjectRow)) : null
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

export async function getResume(): Promise<ResumeData> {
  'use cache'
  cacheTag('content')
  cacheLife('minutes')
  const db = createPublicClient()
  const { data, error } = await db.from('resume').select('data').eq('id', 'default').maybeSingle()
  if (error) console.warn('resume:', error.message)
  return normalizeResume(data?.data)
}
