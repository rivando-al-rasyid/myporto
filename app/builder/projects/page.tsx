import Link from 'next/link'

import { PageBody, PageHeader } from '@/components/cms/page-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, type Project } from '@/lib/cms'
import { createClient } from '@/lib/supabase/server'

export default async function ProjectsPage() {
  const db = await createClient()
  const { data } = await db
    .from('projects')
    .select('id,title,slug,status,is_featured,sort_order,updated_at')
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false })
  const projects = (data ?? []) as Project[]

  return (
    <PageBody>
      <PageHeader
        title="Projects"
        description={`${projects.length} total`}
        actions={<Link href="/builder/projects/new" className={buttonVariants({ size: 'sm' })}>New project</Link>}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow><TableCell colSpan={5} className="text-muted-foreground">No projects yet.</TableCell></TableRow>
          ) : (
            projects.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <Link href={`/builder/projects/${p.id}`} className="font-medium hover:underline">{p.title}</Link>
                  {p.is_featured ? <Badge variant="outline" className="ml-2">Featured</Badge> : null}
                </TableCell>
                <TableCell className="text-muted-foreground">{p.slug}</TableCell>
                <TableCell><Badge variant={p.status === 'published' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                <TableCell>{p.sort_order}</TableCell>
                <TableCell>{formatDate(p.updated_at)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </PageBody>
  )
}
