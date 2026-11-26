import { createServerClient } from '@supabase/ssr'

/**
 * Cookie-less Supabase client for reading public (published) content.
 * It never touches `cookies()`, so it is safe inside `'use cache'` functions
 * under `cacheComponents`.
 */
export function createPublicClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_MyPortoSUPABASE_URL!,
    process.env.NEXT_PUBLIC_MyPortoSUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}
