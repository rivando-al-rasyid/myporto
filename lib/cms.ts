export type PublishStatus = 'draft' | 'published'
export type ContentSource = 'manual' | 'github_readme' | 'markdown_url'

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  sort_order: number
  show_on_resume: boolean
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  content_source: ContentSource | null
  source_url: string | null
  cover_image: string | null
  status: PublishStatus
  is_featured: boolean
  sort_order: number
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  categories?: Category[]
}

export interface Project {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string
  content_source: ContentSource | null
  source_url: string | null
  image_url: string | null
  demo_url: string | null
  repo_url: string | null
  status: PublishStatus
  is_featured: boolean
  sort_order: number
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  categories?: Category[]
}

export interface SiteSettings {
  id: string
  site_name: string
  hero_badge: string
  hero_title: string
  hero_description: string
  primary_cta_label: string
  primary_cta_href: string
  secondary_cta_label: string
  secondary_cta_href: string
  updated_at: string
}

export const CONTENT_SOURCES: { value: ContentSource; label: string }[] = [
  { value: 'manual', label: 'Manual (write below)' },
  { value: 'github_readme', label: 'GitHub README (fetched live)' },
  { value: 'markdown_url', label: 'Markdown URL (fetched live)' },
]

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
