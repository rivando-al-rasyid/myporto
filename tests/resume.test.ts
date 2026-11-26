import { describe, expect, it } from 'vitest'

import type { Category } from '@/lib/cms'
import { boldParts, normalizeResume } from '@/lib/resume'
import { buildCategoryTree, buildResumeSkillGroups, techStack } from '@/lib/skills'

const cat = (id: string, name: string, parent_id: string | null = null, extra: Partial<Category> = {}): Category => ({
  id,
  name,
  slug: name.toLowerCase(),
  parent_id,
  sort_order: 100,
  show_on_resume: true,
  created_at: '',
  updated_at: '',
  ...extra,
})

describe('boldParts', () => {
  it('splits **keywords** from plain text', () => {
    expect(boldParts('Built **Go** APIs')).toEqual([
      { text: 'Built ', bold: false },
      { text: 'Go', bold: true },
      { text: ' APIs', bold: false },
    ])
  })
  it('leaves text without markers alone', () => {
    expect(boldParts('plain')).toEqual([{ text: 'plain', bold: false }])
  })
})

describe('normalizeResume', () => {
  const base = {
    name: 'A',
    experience: [
      { company: 'X', role: 'Dev', period: 'Jan 2024 – Present', points: ['a'] },
      { company: 'Y', role: 'Dev', period: 'Jun 2025 – Jul 2025', points: ['b'] },
    ],
  }

  it('moves legacy top-level projects under the job with the same period', () => {
    const r = normalizeResume({
      ...base,
      projects: [{ name: 'P', period: 'Jun 2025 – Jul 2025', points: ['c'] }],
    })
    expect(r.experience[0].projects).toHaveLength(0)
    expect(r.experience[1].projects.map((p) => p.name)).toEqual(['P'])
  })

  it('falls back to the first job when no period matches', () => {
    const r = normalizeResume({ ...base, projects: [{ name: 'P', period: 'Never', points: [] }] })
    expect(r.experience[0].projects.map((p) => p.name)).toEqual(['P'])
  })

  it('does not duplicate projects that are already nested', () => {
    const r = normalizeResume({
      ...base,
      experience: [{ ...base.experience[0], projects: [{ name: 'Nested', period: '', points: [] }] }],
      projects: [{ name: 'Legacy', period: '', points: [] }],
    })
    expect(r.experience[0].projects.map((p) => p.name)).toEqual(['Nested'])
  })
})

describe('skills from categories', () => {
  const categories = [
    cat('b', 'Backend Development', null, { sort_order: 20 }),
    cat('f', 'Frontend Development', null, { sort_order: 10 }),
    cat('go', 'Go', 'b', { sort_order: 10 }),
    cat('gin', 'Gin', 'b', { sort_order: 20 }),
    cat('hidden', 'Secret', 'b', { show_on_resume: false }),
    cat('react', 'React', 'f'),
    cat('topic', 'Career notes'), // top-level without children
  ]

  it('builds one resume line per group with its sub categories as skills', () => {
    expect(buildResumeSkillGroups(buildCategoryTree(categories))).toEqual([
      { category: 'Frontend Development', items: ['React'] },
      { category: 'Backend Development', items: ['Go', 'Gin'] },
    ])
  })

  it('hides groups switched off for the resume', () => {
    const off = categories.map((c) => (c.id === 'f' ? { ...c, show_on_resume: false } : c))
    expect(buildResumeSkillGroups(buildCategoryTree(off)).map((g) => g.category)).toEqual(['Backend Development'])
  })

  it('uses only sub categories as a project tech stack', () => {
    expect(techStack([categories[0], categories[2], categories[3]])).toEqual(['Go', 'Gin'])
  })
})
