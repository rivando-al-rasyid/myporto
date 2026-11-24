import { PageBody, PageHeader } from '@/components/cms/page-header'
import { CoverLetterGenerator } from '@/components/resume/cover-letter-generator'
import { normalizeResume } from '@/lib/resume'
import { createClient } from '@/lib/supabase/server'

export default async function CoverLetterPage() {
  const db = await createClient()
  const [resumeRes, projectsRes] = await Promise.all([
    db.from('resume').select('data').eq('id', 'default').maybeSingle(),
    db.from('projects').select('id,title,summary').order('sort_order', { ascending: true }),
  ])

  return (
    <PageBody>
      <PageHeader
        title="Cover letter"
        description="Generate a tailored draft from your saved resume. Includes draft projects."
      />
      <CoverLetterGenerator
        resume={normalizeResume(resumeRes.data?.data)}
        projects={projectsRes.data ?? []}
        showPdf={false}
      />
    </PageBody>
  )
}
