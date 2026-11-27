import Link from 'next/link'

import { PageBody, PageHeader } from '@/components/cms/page-header'
import { CoverLetterGenerator } from '@/components/resume/cover-letter-generator'
import { listResumeVersions, loadResume } from '@/lib/resume-data'
import { createClient } from '@/lib/supabase/server'

export default async function CoverLetterPage({ searchParams }: { searchParams: Promise<{ v?: string }> }) {
  const { v } = await searchParams
  const db = await createClient()
  const [{ resume, versionId }, versions] = await Promise.all([
    loadResume(db, v || undefined),
    listResumeVersions(db),
  ])

  return (
    <PageBody>
      <PageHeader
        title="Cover letter"
        description="Generate a tailored draft from the selected resume version. Includes draft projects."
      />
      {versions.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Resume version:</span>
          {versions.map((r) => (
            <Link
              key={r.id}
              href={`/builder/cover-letter?v=${encodeURIComponent(r.id)}`}
              aria-current={r.id === versionId ? 'page' : undefined}
              className={`border px-2.5 py-1 text-xs ${r.id === versionId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      ) : null}
      <CoverLetterGenerator key={versionId} resume={resume} showPdf={false} />
    </PageBody>
  )
}
