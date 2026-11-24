import { deleteCategory, saveCategory } from '@/app/builder/actions'
import { DeleteButton } from '@/components/cms/delete-button'
import { FormError } from '@/components/cms/fields'
import { PageBody, PageHeader } from '@/components/cms/page-header'
import { SubmitButton } from '@/components/cms/submit-button'
import { Input } from '@/components/ui/input'
import type { Category } from '@/lib/cms'
import { createClient } from '@/lib/supabase/server'

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const db = await createClient()
  const { data } = await db.from('categories').select('*').order('name')
  const categories = (data ?? []) as Category[]

  return (
    <PageBody>
      <PageHeader title="Categories" description="Used to link projects and posts in the knowledge graph." />
      <FormError message={error} />

      <form action={saveCategory} className="flex max-w-xl gap-2">
        <Input name="name" placeholder="New category name" required />
        <Input name="slug" placeholder="slug (optional)" />
        <SubmitButton>Add</SubmitButton>
      </form>

      <div className="flex max-w-xl flex-col divide-y border">
        {categories.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">No categories yet.</p>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="flex items-center gap-2 p-2">
              <form action={saveCategory} className="flex flex-1 gap-2">
                <input type="hidden" name="id" value={c.id} />
                <Input name="name" defaultValue={c.name} required />
                <Input name="slug" defaultValue={c.slug} />
                <SubmitButton variant="outline" size="sm">Save</SubmitButton>
              </form>
              <DeleteButton
                action={deleteCategory}
                id={c.id}
                confirmText={`Delete “${c.name}”? It will be removed from all projects and posts.`}
              />
            </div>
          ))
        )}
      </div>
    </PageBody>
  )
}
