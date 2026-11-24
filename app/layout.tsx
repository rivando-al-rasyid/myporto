import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'
import { connection } from 'next/server'
import { Geist, Geist_Mono } from 'next/font/google'
import { HugeiconsIcon } from '@hugeicons/react'
import { GithubIcon, Linkedin01Icon, Mail01Icon } from '@hugeicons/core-free-icons'

import { PublicNavbar } from '@/components/public-navbar'
import { Providers } from './providers'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: {
    default: 'Portfolio Knowledge Graph',
    template: '%s | Portfolio Knowledge Graph',
  },
  description:
    'A modern portfolio CMS with blog, projects, graph relations, social sharing, and Supabase admin.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
}

const socials = [
  { label: 'Email', href: 'mailto:hello@example.com', icon: Mail01Icon },
  { label: 'GitHub', href: 'https://github.com', icon: GithubIcon },
  { label: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin01Icon },
]

async function CurrentYear() {
  await connection()
  return <>{new Date().getFullYear()}</>
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ '--font-heading': 'var(--font-sans)' } as React.CSSProperties}
    >
      <body>
        <Providers>
          <div className="min-h-screen bg-background text-foreground">
            <PublicNavbar />
            <main>{children}</main>
            <footer className="border-t py-10">
              <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
                <p>© <Suspense fallback={null}><CurrentYear /></Suspense> Knowledge Portfolio.</p>
                <div className="flex gap-3">
                  {socials.map(({ label, href, icon }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      className="transition-colors hover:text-foreground"
                      {...(href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
                    </a>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}
