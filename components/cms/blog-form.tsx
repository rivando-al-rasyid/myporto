import Link from 'next/link'

import { saveBlogPost } from '@/app/builder/actions'
import { CategoryPicker } from '@/components/cms/category-picker'
import { CheckField, FormError, SelectField, TextAreaField, TextField } from '@/components/cms/fields'
import { ImageField } from '@/components/cms/image-field'
import { SubmitButton } from '@/components/cms/submit-button'
import { buttonVariants } from '@/components/ui/button'
import type { BlogPost, Category } from '@/lib/cms'

export function BlogForm({
  post,
  categories,
  selected,
  error,
}: {
  post?: BlogPost
  categories: Category[]
  selected: string[]
  error?: string
}) {
  return (
    <form action={saveBlogPost} className="grid max-w-4xl gap-4">
      <FormError message={error} />
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Title" name="title" required defaultValue={post?.title} />
        <TextField label="Slug" name="slug" defaultValue={post?.slug} hint="Leave blank to generate from the title." />
      </div>

      <TextAreaField label="Excerpt" name="excerpt" rows={3} defaultValue={post?.excerpt} />
      <TextAreaField label="Content (Markdown)" name="content" rows={16} mono defaultValue={post?.content} />

      <ImageField label="Cover image" name="cover_image" folder="blog" defaultValue={post?.cover_image} />

      <CategoryPicker categories={categories} selected={selected} />

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Meta title" name="meta_title" defaultValue={post?.meta_title} />
        <TextField label="Meta description" name="meta_description" defaultValue={post?.meta_description} />
      </div>
      <TextField label="Canonical URL" name="canonical_url" defaultValue={post?.canonical_url} />

      <div className="grid items-end gap-4 md:grid-cols-4">
        <SelectField
          label="Status"
          name="status"
          defaultValue={post?.status ?? 'draft'}
          options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
          ]}
        />
        <TextField label="Sort order" name="sort_order" type="number" defaultValue={post?.sort_order ?? 100} hint="Lower shows first." />
        <CheckField label="Featured" name="is_featured" defaultChecked={post?.is_featured} />
      </div>

      <div className="flex gap-2">
        <SubmitButton>Save post</SubmitButton>
        <Link href="/builder/blog" className={buttonVariants({ variant: 'outline' })}>
          Cancel
        </Link>
      </div>
    </form>
  )
}
