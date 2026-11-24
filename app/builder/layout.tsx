import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

// Guards every route under /builder. Unauthenticated users go to login.
export default async function BuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  return <>{children}</>
}
