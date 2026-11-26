import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/cms'
import { normalizeResume, type ResumeData } from '@/lib/resume'
import { buildCategoryTree, buildResumeSkillGroups, techStack } from '@/lib/skills'

type Db = Awaited<ReturnType<typeof createClient>>

export interface ResumeProjectOption {
  id: string
  title: string
  summary: string | null
  stack: string[]
}

// Loads the saved resume and fills in what comes from the database:
//  - Skills: top-level categories are skill groups, their sub categories are the skills.
//  - Projects nested under a job and linked to a portfolio project get that project's tech stack (its sub-category tags).
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
  projectOptions: ResumeProjectOption[]
}> {
  const [resumeRes, catRes, projRes] = await Promise.all([
    db.from('resume').select('id,label,data').eq('id', versionId).maybeSingle(),
    db.from('categories').select('*'),
    db
      .from('projects')
      .select('id,title,summary,sort_order,project_categories(categories(*))')
      .order('sort_order', { ascending: true }),
  ])
  // An unknown or deleted version falls back to the default resume instead of showing the sample template.
  if (!resumeRes.data && versionId !== DEFAULT_RESUME_ID) return loadResume(db, DEFAULT_RESUME_ID)
  if (catRes.error) console.warn('categories:', catRes.error.message)
  if (projRes.error) console.warn('projects:', projRes.error.message)

  type Row = {
    id: string
    title: string
    summary: string | null
    project_categories?: { categories: Category | null }[] | null
  }
  const projectOptions: ResumeProjectOption[] = ((projRes.data ?? []) as unknown as Row[]).map((p) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    stack: techStack((p.project_categories ?? []).map((i) => i.categories).filter(Boolean) as Category[]),
  }))
  const optionById = new Map(projectOptions.map((p) => [p.id, p]))

  const manual = normalizeResume(resumeRes.data?.data)
  const dbGroups = buildResumeSkillGroups(buildCategoryTree((catRes.data ?? []) as Category[]))

  const resume: ResumeData = {
    ...manual,
    skillGroups: dbGroups.length ? dbGroups : manual.skillGroups,
    experience: manual.experience.map((job) => ({
      ...job,
      // A project linked to one on the website supplies whatever is left empty here:
      // its title, its summary as a highlight, and its tech stack (sub-category tags).
      projects: job.projects.map((p) => {
        const site = p.projectId ? optionById.get(p.projectId) : undefined
        if (!site) return { ...p, stack: [] }
        return {
          ...p,
          name: p.name.trim() || site.title,
          points: p.points.length ? p.points : site.summary ? [site.summary] : [],
          stack: site.stack,
        }
      }),
    })),
  }
  return {
    versionId: resumeRes.data ? versionId : DEFAULT_RESUME_ID,
    label: (resumeRes.data?.label as string | undefined) ?? 'Default',
    manual,
    resume,
    dbGroups,
    projectOptions,
  }
}
