import { notFound } from 'next/navigation'

import { deleteProject } from '@/app/builder/actions'
import { DeleteButton } from '@/components/cms/delete-button'
import { PageBody, PageHeader } from '@/components/cms/page-header'
import { ProjectForm } from '@/components/cms/project-form'
import type { Category, Project } from '@/lib/cms'
import { createClient } from '@/lib/supabase/server'

export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const db = await createClient()

  const [project, categories, links] = await Promise.all([
    db.from('projects').select('*').eq('id', id).maybeSingle(),
    db.from('categories').select('*').order('name'),
    db.from('project_categories').select('category_id').eq('project_id', id),
  ])
  if (!project.data) notFound()

  return (
    <PageBody>
      <PageHeader
        title="Edit project"
        description={project.data.title}
        actions={<DeleteButton action={deleteProject} id={id} confirmText="Delete this project? This cannot be undone." />}
      />
      <ProjectForm
        project={project.data as Project}
        categories={(categories.data ?? []) as Category[]}
        selected={(links.data ?? []).map((l: { category_id: string }) => l.category_id)}
        error={error}
      />
    </PageBody>
  )
}
