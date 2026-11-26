import type { Category } from '@/lib/cms'
import { buildCategoryTree } from '@/lib/skills'

function Box({ c, selected }: { c: Category; selected: string[] }) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <input
        type="checkbox"
        name="category_ids"
        value={c.id}
        defaultChecked={selected.includes(c.id)}
        className="size-4 accent-primary"
      />
      {c.name}
    </label>
  )
}

// Groups are headings with their sub categories (skills / tech stack) listed beneath.
export function CategoryPicker({
  categories,
  selected,
  legend = 'Categories & tech stack',
}: {
  categories: Category[]
  selected: string[]
  legend?: string
}) {
  if (!categories.length) {
    return <p className="text-xs text-muted-foreground">No categories yet. Create some under Categories.</p>
  }
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-xs font-medium">{legend}</legend>
      {buildCategoryTree(categories).map(({ category, children }) => (
        <div key={category.id} className="flex flex-col gap-1.5">
          <Box c={category} selected={selected} />
          {children.length > 0 && (
            <div className="ml-6 flex flex-wrap gap-x-4 gap-y-1.5 border-l pl-3 text-muted-foreground">
              {children.map((c) => (
                <Box key={c.id} c={c} selected={selected} />
              ))}
            </div>
          )}
        </div>
      ))}
    </fieldset>
  )
}
