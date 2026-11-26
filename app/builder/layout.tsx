import { Suspense, type ReactNode } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { robots: { index: false, follow: false } }

// Guards every route under /builder and renders the shared dashboard shell.
export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <BuilderShell>{children}</BuilderShell>
    </Suspense>
  )
}

async function BuilderShell({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  // Signed in is not enough: only accounts listed in public.admins may use the CMS.
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-2 p-6">
        <h1 className="text-lg font-semibold">No access</h1>
        <p className="text-sm text-muted-foreground">
          This account is signed in but is not an admin of this portfolio, so the builder is closed.
        </p>
      </main>
    )
  }

  const claims = data.claims as {
    email?: string
    user_metadata?: { full_name?: string; name?: string; avatar_url?: string }
  }
  const email = claims.email ?? ''
  const user = {
    name: claims.user_metadata?.full_name ?? claims.user_metadata?.name ?? email.split('@')[0],
    email,
    avatar: claims.user_metadata?.avatar_url ?? '',
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
