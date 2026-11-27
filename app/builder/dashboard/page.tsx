import Link from 'next/link'

import { PageBody, PageHeader } from '@/components/cms/page-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/cms'
import { createClient } from '@/lib/supabase/server'

type Recent = { id: string; title: string; status: string; updated_at: string; kind: 'Blog'; href: string }

export default async function DashboardPage() {
  const db = await createClient()
  const count = (table: string, where?: { column: string; value: string | boolean }) => {
    const q = db.from(table).select('*', { count: 'exact', head: true })
    return where ? q.eq(where.column, where.value) : q
  }

  const [posts, postsLive, categories, recentPosts] =
    await Promise.all([
      count('blog_posts'),
      count('blog_posts', { column: 'status', value: 'published' }),
      count('categories'),
      db.from('blog_posts').select('id,title,status,updated_at').order('updated_at', { ascending: false }).limit(8),
    ])

  const recent: Recent[] = (recentPosts.data ?? []).map((r) => ({ ...r, kind: 'Blog' as const, href: `/builder/blog/${r.id}` }))

  const stats = [
    { label: 'Blog posts', value: postsLive.count ?? 0, note: `${posts.count ?? 0} total, published / all`, href: '/builder/blog' },
    { label: 'Categories', value: categories.count ?? 0, note: 'Shared by posts', href: '/builder/categories' },
  ]

  return (
    <PageBody>
      <PageHeader
        title="Overview"
        description="Content on your public portfolio, straight from Supabase."
        actions={
          <div className="flex gap-2">
            <Link href="/builder/blog/new" className={buttonVariants({ size: 'sm' })}>New post</Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">{s.value}</CardTitle>
                <p className="text-xs text-muted-foreground">{s.note}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <h3 className="text-sm font-medium">Recently updated</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recent.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">Nothing yet. Create your first post.</TableCell>
            </TableRow>
          ) : (
            recent.map((r) => (
              <TableRow key={`${r.kind}-${r.id}`}>
                <TableCell><Link href={r.href} className="font-medium hover:underline">{r.title}</Link></TableCell>
                <TableCell>{r.kind}</TableCell>
                <TableCell><Badge variant={r.status === 'published' ? 'default' : 'secondary'}>{r.status}</Badge></TableCell>
                <TableCell>{formatDate(r.updated_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </PageBody>
  )
}
