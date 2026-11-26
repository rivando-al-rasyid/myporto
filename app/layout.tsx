import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Geist, Geist_Mono, Inter } from 'next/font/google'

import { PublicNavbar } from '@/components/public-navbar'
import { Providers } from './providers'
import './globals.css'
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: {
    default: 'Portfolio Knowledge Graph',
    template: '%s | Portfolio Knowledge Graph',
  },
  description:
    'A modern portfolio CMS with blog, projects, graph relations, social sharing, and Supabase admin.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'Portfolio Knowledge Graph',
    title: 'Portfolio Knowledge Graph',
    description:
      'A modern portfolio CMS with blog, projects, graph relations, social sharing, and Supabase admin.',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(geistMono.variable, "font-sans", inter.variable)}
      style={{ '--font-heading': 'var(--font-sans)' } as React.CSSProperties}
    >
      <body>
        <Providers>
          <PublicNavbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
