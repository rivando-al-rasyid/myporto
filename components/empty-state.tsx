import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({ title, description, actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="border border-dashed p-8 text-center">
      <h2 className="font-heading text-sm font-medium">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={cn(buttonVariants(), 'mt-5')}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
