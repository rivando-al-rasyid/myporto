import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, NetworkIcon } from '@hugeicons/core-free-icons'

import { ContentCard } from '@/components/content-card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { BlogPost, Category, SiteSettings } from '@/lib/cms'
import type { GraphData } from '@/lib/graph'
import { KnowledgeGraph } from '../graph/KnowledgeGraph'

interface HomePageProps {
  site: SiteSettings | null
  posts: BlogPost[]
  categories: Category[]
  graphData: GraphData
}

export function HomePage({ site, posts, categories, graphData }: HomePageProps) {
  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--primary),transparent_82%),transparent_35%),radial-gradient(circle_at_bottom_right,color-mix(in_oklch,var(--chart-1),transparent_80%),transparent_30%)]" />
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div>
            <Badge className="mb-5">{site?.hero_badge || 'Next.js + Tailwind 4 + Supabase'}</Badge>
            <h1 className="font-heading text-4xl font-bold tracking-tight md:text-6xl">
              {site?.hero_title || 'Portfolio that works like a knowledge graph.'}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
              {site?.hero_description ||
                'Publish posts and categories from a protected CMS dashboard. Then connect them through automatic relations and share-ready SEO metadata.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={site?.primary_cta_href || '/projects'} className={buttonVariants({ size: 'lg' })}>
                {site?.primary_cta_label || 'View repositories'}
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
            <ContentCard key={post.id} item={post} />
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
