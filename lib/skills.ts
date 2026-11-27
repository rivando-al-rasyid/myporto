// Categories are skill groups; their sub categories are the skills.

import type { Category } from '@/lib/cms'
import type { ResumeData } from '@/lib/resume'

export interface CategoryNode {
  category: Category
  children: Category[]
}

const bySort = (a: Category, b: Category) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  return categories
    .filter((c) => !c.parent_id)
    .sort(bySort)
    .map((category) => ({
      category,
      children: categories.filter((c) => c.parent_id === category.id).sort(bySort),
    }))
}

// One resume line per group: "Backend Development: Go (Golang), Gin, JWT".
export function buildResumeSkillGroups(tree: CategoryNode[]): ResumeData['skillGroups'] {
  return tree
    .filter((n) => n.category.show_on_resume)
    .map((n) => ({
      category: n.category.name,
      items: n.children.filter((c) => c.show_on_resume).map((c) => c.name),
    }))
    .filter((g) => g.items.length > 0)
}

// Flat, ordered list (group followed by its skills) for selects.
export function categoryOptions(categories: Category[]): { category: Category; depth: 0 | 1 }[] {
  return buildCategoryTree(categories).flatMap((n) => [
    { category: n.category, depth: 0 as const },
    ...n.children.map((c) => ({ category: c, depth: 1 as const })),
  ])
}
