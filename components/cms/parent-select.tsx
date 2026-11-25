import type { Category } from '@/lib/cms'

export const selectClass =
  'h-8 w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30'

// Parent picker. Only top-level categories can be parents (sub categories are one level deep).
export function ParentSelect({
  categories,
  value = '',
  excludeId,
  name = 'parent_id',
}: {
  categories: Category[]
  value?: string | null
  excludeId?: string
  name?: string
}) {
  return (
    <select name={name} defaultValue={value ?? ''} aria-label="Parent category" className={selectClass}>
      <option value="">No parent (top level)</option>
      {categories
        .filter((c) => !c.parent_id && c.id !== excludeId)
        .map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
    </select>
  )
}
