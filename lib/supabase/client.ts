import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_MyPortoSUPABASE_URL!,
    process.env.NEXT_PUBLIC_MyPortoSUPABASE_PUBLISHABLE_KEY!
  )
}
