import { BlogForm } from '@/components/cms/blog-form'
import { PageBody, PageHeader } from '@/components/cms/page-header'
import type { Category } from '@/lib/cms'
import { createClient } from '@/lib/supabase/server'

export default async function NewBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const db = await createClient()
  const { data } = await db.from('categories').select('*').order('name')

  return (
    <PageBody>
      <PageHeader title="New post" />
      <BlogForm categories={(data ?? []) as Category[]} selected={[]} error={error} />
    </PageBody>
  )
}
