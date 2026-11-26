import { notFound } from 'next/navigation'

import { deleteBlogPost } from '@/app/builder/actions'
import { BlogForm } from '@/components/cms/blog-form'
import { DeleteButton } from '@/components/cms/delete-button'
import { PageBody, PageHeader } from '@/components/cms/page-header'
import type { BlogPost, Category } from '@/lib/cms'
import { createClient } from '@/lib/supabase/server'

export default async function EditBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const db = await createClient()

  const [post, categories, links] = await Promise.all([
    db.from('blog_posts').select('*').eq('id', id).maybeSingle(),
    db.from('categories').select('*').order('name'),
    db.from('blog_post_categories').select('category_id').eq('blog_post_id', id),
  ])
  if (!post.data) notFound()

  return (
    <PageBody>
      <PageHeader
        title="Edit post"
        description={post.data.title}
        actions={<DeleteButton action={deleteBlogPost} id={id} confirmText="Delete this post? This cannot be undone." />}
      />
      <BlogForm
        post={post.data as BlogPost}
        categories={(categories.data ?? []) as Category[]}
        selected={(links.data ?? []).map((l: { category_id: string }) => l.category_id)}
        error={error}
      />
    </PageBody>
  )
}
