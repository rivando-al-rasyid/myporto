import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

import { PrintButton } from '@/components/resume/print-button'
import { ResumeDocument } from '@/components/resume/resume-document'
import { buttonVariants } from '@/components/ui/button'
import { normalizeResume } from '@/lib/resume'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Resume preview' }

async function PrintableResume() {
  const db = await createClient()
  const { data: claims, error } = await db.auth.getClaims()
  if (error || !claims?.claims) redirect('/auth/login')

  const { data } = await db.from('resume').select('data').eq('id', 'default').maybeSingle()

  return (
    <>
      <div className="mx-auto mb-6 flex max-w-[210mm] items-center justify-between gap-4 print:hidden">
        <p className="text-sm text-muted-foreground">Preview of your PDF. Click Download PDF and choose “Save as PDF”.</p>
        <div className="flex gap-2">
          <Link href="/builder/resume" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Back to builder
          </Link>
          <PrintButton label="Download PDF" />
        </div>
      </div>
      <ResumeDocument data={normalizeResume(data?.data)} />
    </>
  )
}

export default function Page() {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 print:bg-white print:p-0">
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading resume…</p>}>
        <PrintableResume />
      </Suspense>
    </main>
  )
}
