import type { MetadataRoute } from 'next'

import { getPublishedBlogPosts, getPublishedProjects } from '@/lib/contentService'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects] = await Promise.all([getPublishedBlogPosts(), getPublishedProjects()])

  return [
    { url: siteUrl, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/projects`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/graph`, changeFrequency: 'monthly', priority: 0.4 },
    ...projects.map((p) => ({
      url: `${siteUrl}/projects/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...posts.map((p) => ({
      url: `${siteUrl}/blog/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]
}
