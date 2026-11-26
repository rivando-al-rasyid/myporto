import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, NetworkIcon } from '@hugeicons/core-free-icons'

import { ContentCard } from '@/components/content-card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BlogPost, Category, Project, SiteSettings } from '@/lib/cms'
import type { GraphData } from '@/lib/graph'
import { cn } from '@/lib/utils'
import { KnowledgeGraph } from '../graph/KnowledgeGraph'

interface HomePageProps {
  site: SiteSettings | null
  posts: BlogPost[]
  projects: Project[]
  categories: Category[]
  graphData: GraphData
}

export function HomePage({ site, posts, projects, categories, graphData }: HomePageProps) {
  const featuredProjects = projects.filter((project) => project.is_featured).slice(0, 4)
  const visibleProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 4)
  const hasMoreProjects = projects.length > visibleProjects.length

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_82%),transparent_35%),radial-gradient(circle_at_bottom_right,color-mix(in_oklch,var(--chart-1),transparent_80%),transparent_30%)]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.15fr_0.85fr] md:py-24">
          <div>
            <Badge className="mb-5">{site?.hero_badge || 'Next.js + Tailwind 4 + Supabase'}</Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight md:text-6xl">
              {site?.hero_title || 'Portfolio that works like a knowledge graph.'}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              {site?.hero_description ||
                'Publish posts, projects, and categories from a protected CMS dashboard. Then connect them through automatic relations and share-ready SEO metadata.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={site?.primary_cta_href || '/projects'} className={buttonVariants({ size: 'lg' })}>
                {site?.primary_cta_label || 'View projects'}
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Link>
              <Link
                href={site?.secondary_cta_href || '/graph'}
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                {site?.secondary_cta_label || 'Explore graph'}
                <HugeiconsIcon icon={NetworkIcon} strokeWidth={2} />
              </Link>
            </div>
          </div>
          <Card className="bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-sm">Featured work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleProjects.length > 0 ? (
                <>
                  {visibleProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.slug}`}
                      className="block border bg-background/80 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <h3 className="font-heading text-sm font-medium">{project.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{project.summary}</p>
                    </Link>
                  ))}
                  {hasMoreProjects ? (
                    <Link href="/projects" className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}>
                      View all projects
                    </Link>
                  ) : null}
                </>
              ) : (
                <div className="border bg-background/80 p-4 text-xs text-muted-foreground">
                  No published projects yet. Add projects from the builder dashboard.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Writing</p>
            <h2 className="mt-2 font-heading text-3xl font-bold">Latest posts</h2>
          </div>
          <Link href="/blog" className={buttonVariants({ variant: 'ghost' })}>
            All posts
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {posts.slice(0, 2).map((post) => (
            <ContentCard key={post.id} item={post} type="blog" />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 grid gap-5 md:grid-cols-[0.75fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Categories</p>
            <h2 className="mt-2 font-heading text-3xl font-bold">Skill map</h2>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {categories.map((category) => (
              <Badge key={category.id} variant="outline" className="h-6 px-3">
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
        <KnowledgeGraph compact data={graphData} />
      </section>
    </>
  )
}
