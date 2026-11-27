import Link from 'next/link'

import { saveProject } from '@/app/builder/actions'
import { CategoryPicker } from '@/components/cms/category-picker'
import { CheckField, FormError, SelectField, TextAreaField, TextField } from '@/components/cms/fields'
import { ImageField } from '@/components/cms/image-field'
import { SubmitButton } from '@/components/cms/submit-button'
import { buttonVariants } from '@/components/ui/button'
import { CONTENT_SOURCES, type Category, type Project } from '@/lib/cms'

export function ProjectForm({
  project,
  categories,
  selected,
  error,
}: {
  project?: Project
  categories: Category[]
  selected: string[]
  error?: string
}) {
  return (
    <form action={saveProject} className="grid max-w-4xl gap-4">
      <FormError message={error} />
      {project ? <input type="hidden" name="id" value={project.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Title" name="title" required defaultValue={project?.title} />
        <TextField label="Slug" name="slug" defaultValue={project?.slug} hint="Leave blank to generate from the title." />
      </div>

      <TextAreaField label="Summary" name="summary" rows={3} defaultValue={project?.summary} />

      <div className="grid gap-4 md:grid-cols-2">
        <SelectField label="Content source" name="content_source" defaultValue={project?.content_source ?? 'manual'} options={CONTENT_SOURCES} />
        <TextField
          label="Source URL"
          name="source_url"
          defaultValue={project?.source_url}
          hint="Used for GitHub README / Markdown URL sources. Falls back to the repo URL."
        />
      </div>

      <TextAreaField label="Content (Markdown)" name="content" rows={14} mono defaultValue={project?.content} />

      <ImageField label="Image" name="image_url" folder="projects" defaultValue={project?.image_url} />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Demo URL" name="demo_url" defaultValue={project?.demo_url} />
        <TextField label="Repo URL" name="repo_url" defaultValue={project?.repo_url} />
      </div>

      <CategoryPicker categories={categories} selected={selected} />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Meta title" name="meta_title" defaultValue={project?.meta_title} />
        <TextField label="Meta description" name="meta_description" defaultValue={project?.meta_description} />
      </div>

      <div className="grid items-end gap-4 md:grid-cols-4">
        <SelectField
          label="Status"
          name="status"
          defaultValue={project?.status ?? 'draft'}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ]}
        />
        <TextField label="Sort order" name="sort_order" type="number" defaultValue={project?.sort_order ?? 100} hint="Lower shows first." />
        <CheckField label="Featured" name="is_featured" defaultChecked={project?.is_featured} />
      </div>

      <div className="flex gap-2">
        <SubmitButton>Save project</SubmitButton>
        <Link href="/builder/projects" className={buttonVariants({ variant: 'outline' })}>
          Cancel
        </Link>
      </div>
    </form>
  )
}
