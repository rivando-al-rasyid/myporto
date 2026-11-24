import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">404</p>
      <h1 className="mt-3 font-heading text-4xl font-bold">Page not found</h1>
      <p className="mt-3 text-muted-foreground">
        The page you opened does not exist or has been moved.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: 'lg' }), 'mt-6')}>
        Back home
      </Link>
    </section>
  )
}
