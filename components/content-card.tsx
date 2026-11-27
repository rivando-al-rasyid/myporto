import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, type BlogPost } from '@/lib/cms'
import { cn, truncateText } from '@/lib/utils'

export function ContentCard({ item }: { item: BlogPost }) {
  const href = `/blog/${item.slug}`

  return (
    <Card className={cn('group h-full transition hover:-translate-y-1 hover:shadow-md', item.cover_image && 'pt-0')}>
      {item.cover_image ? (
        <Link href={href} className="block overflow-hidden border-b bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.cover_image}
            alt={item.title}
            loading="lazy"
            className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        </Link>
      ) : null}
      <CardHeader className={cn(item.cover_image && 'pt-(--card-spacing)')}>
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge variant="default">blog</Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(item.published_at)}
          </span>
        </div>
        <CardTitle className="text-base leading-tight">
          <Link href={href} className="hover:underline">
            {item.title}
          </Link>
        </CardTitle>
        <CardDescription>{truncateText(item.excerpt, 140)}</CardDescription>
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
