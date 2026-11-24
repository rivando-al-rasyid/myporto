import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, type BlogPost, type Project } from '@/lib/cms'
import { cn, truncateText } from '@/lib/utils'

interface ContentCardProps {
  item: BlogPost | Project
  type: 'blog' | 'project'
}

export function ContentCard({ item, type }: ContentCardProps) {
  const description = 'excerpt' in item ? item.excerpt : item.summary
  const imageUrl = 'cover_image' in item ? item.cover_image : item.image_url
  const href = type === 'blog' ? `/blog/${item.slug}` : `/projects/${item.slug}`

  return (
    <Card className={cn('group h-full transition hover:-translate-y-1 hover:shadow-md', imageUrl && 'pt-0')}>
      {imageUrl ? (
        <Link href={href} className="block overflow-hidden border-b bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={item.title}
            loading="lazy"
            className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </Link>
      ) : null}
      <CardHeader className={cn(imageUrl && 'pt-(--card-spacing)')}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge variant={type === 'blog' ? 'default' : 'secondary'}>{type}</Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate('published_at' in item ? item.published_at : item.updated_at)}
          </span>
        </div>
        <CardTitle className="text-base leading-tight">
          <Link href={href} className="hover:underline">
            {item.title}
          </Link>
        </CardTitle>
        <CardDescription>{truncateText(description, 140)}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="mb-4 flex flex-wrap gap-2">
          {item.categories?.slice(0, 3).map((category) => (
            <Badge key={category.id} variant="outline">
              {category.name}
            </Badge>
          ))}
        </div>
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          Read more <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} className="size-4" />
        </Link>
      </CardContent>
    </Card>
  )
}
