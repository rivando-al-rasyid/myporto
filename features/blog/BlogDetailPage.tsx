import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { formatDate, type BlogPost } from '@/lib/cms'
import { renderMarkdown } from '@/lib/markdown'
import { cn, getCanonicalUrl } from '@/lib/utils'
import { ShareButton } from '../share/ShareButton'

export function BlogDetailPage({ post }: { post: BlogPost }) {
  const url = getCanonicalUrl(`/blog/${post.slug}`)

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/blog" className={cn(buttonVariants({ variant: 'ghost' }), 'mb-6 -ml-3')}>
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} /> Back
      </Link>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge>Blog</Badge>
        <span className="text-xs text-muted-foreground">{formatDate(post.published_at || post.created_at)}</span>
        {post.categories?.map((category) => (
          <Badge key={category.id} variant="outline">
            {category.name}
          </Badge>
        ))}
      </div>
      <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">{post.title}</h1>
      {post.excerpt ? <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p> : null}
      {post.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_image} alt={post.title} className="mt-8 aspect-video w-full border object-cover" />
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <ShareButton entityType="blog" entityId={post.id} title={post.title} text={post.excerpt ?? ''} url={url} />
      </div>
      <div className="markdown-body mt-10 border-t pt-8">{renderMarkdown(post.content)}</div>
    </article>
  )
}
