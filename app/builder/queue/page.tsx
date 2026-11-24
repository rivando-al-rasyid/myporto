import Link from 'next/link'

import { setQueuePosted } from '@/app/builder/actions'
import { PageBody, PageHeader } from '@/components/cms/page-header'
import { SubmitButton } from '@/components/cms/submit-button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/cms'
import { createClient } from '@/lib/supabase/server'

type Row = {
  id: string
  is_posted: boolean
  created_at: string
  blog_posts: { id: string; title: string; status: string } | null
  projects: { id: string; title: string; status: string } | null
}

export default async function QueuePage() {
  const db = await createClient()
  const { data } = await db
    .from('queue_share')
    .select('id,is_posted,created_at,blog_posts(id,title,status),projects(id,title,status)')
    .order('is_posted', { ascending: true })
    .order('created_at', { ascending: false })
  const rows = (data ?? []) as unknown as Row[]

  return (
    <PageBody>
      <PageHeader
        title="Share queue"
        description="Published content is queued automatically. Your n8n workflow reads rows where is_posted is false and marks them posted."
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Queued</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-muted-foreground">Queue is empty.</TableCell></TableRow>
          ) : (
            rows.map((r) => {
              const item = r.blog_posts ?? r.projects
              const href = r.blog_posts ? `/builder/blog/${r.blog_posts.id}` : r.projects ? `/builder/projects/${r.projects.id}` : null
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    {href ? <Link href={href} className="font-medium hover:underline">{item?.title}</Link> : '—'}
                  </TableCell>
                  <TableCell>{r.blog_posts ? 'Blog' : 'Project'}</TableCell>
                  <TableCell><Badge variant={r.is_posted ? 'secondary' : 'default'}>{r.is_posted ? 'Posted' : 'Pending'}</Badge></TableCell>
                  <TableCell>{formatDate(r.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <form action={setQueuePosted}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="is_posted" value={String(!r.is_posted)} />
                      <SubmitButton variant="outline" size="sm">{r.is_posted ? 'Mark pending' : 'Mark posted'}</SubmitButton>
                    </form>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </PageBody>
  )
}
