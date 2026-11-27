import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/cms'
import { normalizeResume, type ResumeData } from '@/lib/resume'
import { buildCategoryTree, buildResumeSkillGroups } from '@/lib/skills'

type Db = Awaited<ReturnType<typeof createClient>>

// Loads the saved resume and fills in what comes from the database:
//  - Skills: top-level categories are skill groups, their sub categories are the skills.
// `manual` is exactly what is stored; `resume` is the merged version used for preview, print and cover letter.
export interface ResumeVersion {
  id: string
  label: string
}

export const DEFAULT_RESUME_ID = 'default'

export async function listResumeVersions(db: Db): Promise<ResumeVersion[]> {
  const { data, error } = await db.from('resume').select('id,label,updated_at').order('updated_at', { ascending: false })
  if (error) console.warn('resume versions:', error.message)
  const rows = (data ?? []) as ResumeVersion[]
  const base: ResumeVersion = rows.find((r) => r.id === DEFAULT_RESUME_ID) ?? { id: DEFAULT_RESUME_ID, label: 'Default' }
  return [base, ...rows.filter((r) => r.id !== DEFAULT_RESUME_ID)]
}

export async function loadResume(db: Db, versionId: string = DEFAULT_RESUME_ID): Promise<{
  versionId: string
  label: string
  manual: ResumeData
  resume: ResumeData
  dbGroups: ResumeData['skillGroups']
}> {
  const [resumeRes, catRes] = await Promise.all([
    db.from('resume').select('id,label,data').eq('id', versionId).maybeSingle(),
    db.from('categories').select('*'),
  ])
  // An unknown or deleted version falls back to the default resume instead of showing the sample template.
  if (!resumeRes.data && versionId !== DEFAULT_RESUME_ID) return loadResume(db, DEFAULT_RESUME_ID)
  if (catRes.error) console.warn('categories:', catRes.error.message)

  const manual = normalizeResume(resumeRes.data?.data)
  const dbGroups = buildResumeSkillGroups(buildCategoryTree((catRes.data ?? []) as Category[]))

  const resume: ResumeData = {
    ...manual,
    skillGroups: dbGroups.length ? dbGroups : manual.skillGroups,
  }
  return {
    versionId: resumeRes.data ? versionId : DEFAULT_RESUME_ID,
    label: (resumeRes.data?.label as string | undefined) ?? 'Default',
    manual,
    resume,
    dbGroups,
  }
}
