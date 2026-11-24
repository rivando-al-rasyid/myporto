import type { Category } from '@/lib/cms'

export function CategoryPicker({
  categories,
  selected,
}: {
  categories: Category[]
  selected: string[]
}) {
  if (!categories.length) {
    return <p className="text-xs text-muted-foreground">No categories yet. Create some under Categories.</p>
  }
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-xs font-medium">Categories</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {categories.map((c) => (
          <label key={c.id} className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              name="category_ids"
              value={c.id}
              defaultChecked={selected.includes(c.id)}
              className="size-4 accent-primary"
            />
            {c.name}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
