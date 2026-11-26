import { addSubCategories, deleteCategory, saveCategory } from '@/app/builder/actions'
import { DeleteButton } from '@/components/cms/delete-button'
import { FormError } from '@/components/cms/fields'
import { PageBody, PageHeader } from '@/components/cms/page-header'
import { ParentSelect } from '@/components/cms/parent-select'
import { SubmitButton } from '@/components/cms/submit-button'
import { Input } from '@/components/ui/input'
import type { Category } from '@/lib/cms'
import { buildCategoryTree } from '@/lib/skills'
import { createClient } from '@/lib/supabase/server'

const grid = 'grid flex-1 items-center gap-2 md:grid-cols-[2fr_2fr_2fr_5rem_auto_auto]'

function CategoryRow({ c, categories, sub }: { c: Category; categories: Category[]; sub?: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 ${sub ? 'bg-muted/30 pl-8' : ''}`}>
      <form action={saveCategory} className={grid}>
        <input type="hidden" name="id" value={c.id} />
        <Input name="name" defaultValue={c.name} aria-label="Name" required />
        <Input name="slug" defaultValue={c.slug} aria-label="Slug" />
        <ParentSelect categories={categories} value={c.parent_id} excludeId={c.id} />
        <Input name="sort_order" type="number" defaultValue={c.sort_order} aria-label="Sort order" />
        <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
          <input type="checkbox" name="show_on_resume" defaultChecked={c.show_on_resume} className="size-4 accent-primary" />
          On resume
        </label>
        <SubmitButton variant="outline" size="sm">Save</SubmitButton>
      </form>
      <DeleteButton
        action={deleteCategory}
        id={c.id}
        confirmText={`Delete “${c.name}”? It is removed from all projects and posts, and its sub categories become top-level.`}
      />
    </div>
  )
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const db = await createClient()
  const { data } = await db.from('categories').select('*')
  const categories = (data ?? []) as Category[]
  const tree = buildCategoryTree(categories)

  return (
    <PageBody>
      <PageHeader
        title="Categories"
        description="A category is a skill group; its sub categories are the skills. Tag projects and posts with sub categories to record their tech stack. “On resume” controls what appears in the resume Skills section."
      />
      <FormError message={error} />

      <form action={saveCategory} className={`max-w-4xl ${grid}`}>
        <Input name="name" placeholder="New category or skill" aria-label="Name" required />
        <Input name="slug" placeholder="slug (optional)" aria-label="Slug" />
        <ParentSelect categories={categories} />
        <Input name="sort_order" type="number" defaultValue={100} aria-label="Sort order" />
        <label className="flex items-center gap-1.5 text-xs whitespace-nowrap">
          <input type="checkbox" name="show_on_resume" defaultChecked className="size-4 accent-primary" />
          On resume
        </label>
        <SubmitButton>Add</SubmitButton>
      </form>

      <div className="flex max-w-4xl flex-col gap-4">
        {tree.length === 0 ? (
          <p className="border p-3 text-xs text-muted-foreground">No categories yet.</p>
        ) : (
          tree.map(({ category, children }) => (
            <section key={category.id} className="border">
              <div className="divide-y">
                <CategoryRow c={category} categories={categories} />
                {children.map((c) => (
                  <CategoryRow key={c.id} c={c} categories={categories} sub />
                ))}
              </div>
              <form action={addSubCategories} className="flex gap-2 border-t p-2 pl-8">
                <input type="hidden" name="parent_id" value={category.id} />
                <Input
                  name="names"
                  placeholder={`Add skills to ${category.name}, separated by commas`}
                  aria-label={`Add sub categories to ${category.name}`}
                />
                <SubmitButton variant="outline" size="sm">Add skills</SubmitButton>
              </form>
            </section>
          ))
        )}
      </div>
    </PageBody>
  )
}
