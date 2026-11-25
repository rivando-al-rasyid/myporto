import { FormError } from '@/components/cms/fields'
import { PageBody, PageHeader } from '@/components/cms/page-header'
import { ResumeForm } from '@/components/cms/resume-form'
import { normalizeResume } from '@/lib/resume'
import { createClient } from '@/lib/supabase/server'

export default async function ResumePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>
}) {
  const { error, saved } = await searchParams
  const db = await createClient()
  const { data } = await db.from('resume').select('data').eq('id', 'default').maybeSingle()

  return (
    <PageBody>
      <PageHeader
        title="Resume"
        description="Edit your resume on the left and preview the PDF on the right. It also powers the cover letter generator."
      />
      <FormError message={error} />
      {saved ? <p className="text-xs text-muted-foreground">Saved.</p> : null}
      <ResumeForm initial={normalizeResume(data?.data)} />
    </PageBody>
  )
}
