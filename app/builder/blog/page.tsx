import Link from 'next/link'

import { PageBody, PageHeader } from '@/components/cms/page-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, type BlogPost } from '@/lib/cms'
import { createClient } from '@/lib/supabase/server'

export default async function BlogPage() {
  const db = await createClient()
  const { data } = await db
    .from('blog_posts')
    .select('id,title,slug,status,is_featured,sort_order,published_at,updated_at')
    .order('updated_at', { ascending: false })
  const posts = (data ?? []) as BlogPost[]

  return (
    <PageBody>
      <PageHeader
        title="Blog"
        description={`${posts.length} total`}
        actions={<Link href="/builder/blog/new" className={buttonVariants({ size: 'sm' })}>New post</Link>}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-muted-foreground">No posts yet.</TableCell></TableRow>
          ) : (
            posts.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/builder/blog/${p.id}`} className="font-medium hover:underline">{p.title}</Link>
                  {p.is_featured ? <Badge variant="outline" className="ml-2">Featured</Badge> : null}
                </TableCell>
                <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                <TableCell><Badge variant={p.status === 'published' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                <TableCell>{formatDate(p.published_at)}</TableCell>
                <TableCell>{formatDate(p.updated_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </PageBody>
  )
}
