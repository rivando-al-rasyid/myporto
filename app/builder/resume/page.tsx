import Link from 'next/link'

import { createResumeVersion, deleteResumeVersion } from '@/app/builder/actions'
import { DeleteButton } from '@/components/cms/delete-button'
import { FormError } from '@/components/cms/fields'
import { PageBody, PageHeader } from '@/components/cms/page-header'
import { ResumeForm } from '@/components/cms/resume-form'
import { SubmitButton } from '@/components/cms/submit-button'
import { Input } from '@/components/ui/input'
import { listResumeVersions, loadResume } from '@/lib/resume-data'
import { createClient } from '@/lib/supabase/server'

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string; v?: string }>
}) {
  const { error, saved, v } = await searchParams
  const db = await createClient()
  const [{ versionId, label, manual, resume, dbGroups, projectOptions }, versions] = await Promise.all([
    loadResume(db, v || undefined),
    listResumeVersions(db),
  ])

  return (
    <PageBody>
      <PageHeader
        title="Resume"
        description="One resume per target job. Edit on the left, preview the PDF on the right. The selected version also feeds the cover letter generator."
      />
      <FormError message={error} />
      {saved ? <p className="text-xs text-muted-foreground">Saved.</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        {versions.map((r) => (
          <Link
            key={r.id}
            href={`/builder/resume?v=${encodeURIComponent(r.id)}`}
            aria-current={r.id === versionId ? 'page' : undefined}
            className={`border px-2.5 py-1 text-xs ${r.id === versionId ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
          >
            {r.label}
          </Link>
        ))}
        <form action={createResumeVersion} className="flex items-center gap-2">
          <input type="hidden" name="source_id" value={versionId} />
          <Input name="label" placeholder="New version for… (copies this one)" aria-label="New version name" className="w-64" required />
          <SubmitButton variant="outline" size="sm">Duplicate</SubmitButton>
        </form>
        {versionId !== 'default' ? (
          <DeleteButton action={deleteResumeVersion} id={versionId} confirmText={`Delete the version “${label}”?`} />
        ) : null}
      </div>

      <ResumeForm
        key={versionId}
        initial={manual}
        preview={resume}
        dbSkillGroups={dbGroups}
        projectOptions={projectOptions}
        versionId={versionId}
        versionLabel={label}
      />
    </PageBody>
  )
}
