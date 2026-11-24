'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { HugeiconsIcon } from '@hugeicons/react'
import { Moon02Icon, NetworkIcon, Sun01Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/projects', label: 'Projects' },
  { href: '/graph', label: 'Graph' },
  { href: '/resume', label: 'Resume' },
  { href: '/cover-letter', label: 'Cover Letter' },
]

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function PublicNavbar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  if (pathname.startsWith('/builder')) return null

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
            <HugeiconsIcon icon={NetworkIcon} strokeWidth={2} className="size-5" />
          </span>
          <span className="hidden text-sm sm:inline">Rivando Al Rasyid</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground',
                isActivePath(pathname, link.href) && 'bg-muted text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          <HugeiconsIcon icon={Sun01Icon} strokeWidth={2} className="dark:hidden" />
          <HugeiconsIcon icon={Moon02Icon} strokeWidth={2} className="hidden dark:block" />
        </Button>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-3 py-2 text-xs text-muted-foreground',
              isActivePath(pathname, link.href) && 'bg-muted text-foreground'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
