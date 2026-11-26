import Link from 'next/link'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'

import { PrintButton } from '@/components/resume/print-button'
import { ResumeDocument } from '@/components/resume/resume-document'
import { buttonVariants } from '@/components/ui/button'
import { loadResume } from '@/lib/resume-data'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Resume preview' }

async function PrintableResume({ versionId }: { versionId?: string }) {
  const db = await createClient()
  const { data: claims, error } = await db.auth.getClaims()
  if (error || !claims?.claims) redirect('/auth/login')

  const { resume, versionId: id } = await loadResume(db, versionId)

  return (
    <>
      <div className="mx-auto mb-6 flex max-w-[210mm] items-center justify-between gap-4 print:hidden">
        <p className="text-sm text-muted-foreground">Preview of your PDF. Click Download PDF and choose “Save as PDF”.</p>
        <div className="flex gap-2">
          <Link href={`/builder/resume?v=${encodeURIComponent(id)}`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Back to builder
          </Link>
          <PrintButton label="Download PDF" />
        </div>
      </div>
      <ResumeDocument data={resume} />
    </>
  )
}

async function PrintableForVersion({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { v } = await searchParams
  return <PrintableResume versionId={v || undefined} />
}

export default function Page({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  return (
    <main className="min-h-screen bg-muted/40 px-4 py-8 print:bg-white print:p-0">
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading resume…</p>}>
        <PrintableForVersion searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
