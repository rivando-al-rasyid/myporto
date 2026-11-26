import Link from 'next/link'

import { setPlatformStatus, setQueuePosted, shareAgain } from '@/app/builder/actions'
import { PageBody, PageHeader } from '@/components/cms/page-header'
import { SubmitButton } from '@/components/cms/submit-button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/cms'
import { createClient } from '@/lib/supabase/server'

const PLATFORMS = [
  { id: 'x', label: 'X thread' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'linkedin', label: 'LinkedIn' },
] as const

type Status = 'pending' | 'posted' | 'failed' | 'skipped'

type PostRow = {
  platform: string
  status: Status
  post_url: string | null
  posted_at: string | null
  error: string | null
}

type Row = {
  id: string
  is_posted: boolean
  queued_at: string
  blog_posts: { id: string; title: string; status: string } | null
  projects: { id: string; title: string; status: string } | null
  queue_share_posts: PostRow[]
}

const badge: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'default' },
  posted: { label: 'Posted', variant: 'secondary' },
  failed: { label: 'Failed', variant: 'destructive' },
  skipped: { label: 'Skipped', variant: 'outline' },
}

function PlatformCell({ queueId, post }: { queueId: string; post?: PostRow }) {
  if (!post) return <TableCell className="text-muted-foreground">—</TableCell>
  const b = badge[post.status]
  // One-click manual override: done by hand -> posted, posted/failed -> retry.
  const next: Status | null = post.status === 'posted' || post.status === 'failed' ? 'pending' : post.status === 'pending' ? 'posted' : null
  const nextLabel = next === 'posted' ? 'Mark posted' : 'Retry'

  return (
    <TableCell className="align-top">
      <div className="flex flex-col items-start gap-1">
        <Badge variant={b.variant} title={post.error ?? undefined}>{b.label}</Badge>
        {post.post_url ? (
          <a href={post.post_url} target="_blank" rel="noreferrer" className="text-xs underline underline-offset-2">
            View post
          </a>
        ) : null}
        {post.status === 'posted' && post.posted_at ? (
          <span className="text-xs text-muted-foreground">{formatDate(post.posted_at)}</span>
        ) : null}
        {post.error && post.status !== 'posted' ? (
          <span className="max-w-40 text-xs text-muted-foreground">{post.error}</span>
        ) : null}
        {next ? (
          <form action={setPlatformStatus}>
            <input type="hidden" name="queue_id" value={queueId} />
            <input type="hidden" name="platform" value={post.platform} />
            <input type="hidden" name="status" value={next} />
            <SubmitButton variant="ghost" size="xs">{nextLabel}</SubmitButton>
          </form>
        ) : null}
      </div>
    </TableCell>
  )
}

export default async function QueuePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const db = await createClient()
  const { data } = await db
    .from('queue_share')
    .select(
      'id,is_posted,queued_at,blog_posts(id,title,status),projects(id,title,status),queue_share_posts(platform,status,post_url,posted_at,error)'
    )
    .order('is_posted', { ascending: true })
    .order('queued_at', { ascending: false })
  const rows = (data ?? []) as unknown as Row[]

  return (
    <PageBody>
      <PageHeader
        title="Share queue"
        description="Published content is queued automatically for X (thread), Instagram, Facebook and LinkedIn. Your n8n workflow posts each platform and writes the result back; tick “Share again” when saving an edit to queue it again."
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              {PLATFORMS.map((p) => (
                <TableHead key={p.id}>{p.label}</TableHead>
              ))}
              <TableHead>Queued</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={PLATFORMS.length + 4} className="text-muted-foreground">Queue is empty.</TableCell>
              </TableRow>
            ) : (
              rows.map((r) => {
                const item = r.blog_posts ?? r.projects
                const href = r.blog_posts
                  ? `/builder/blog/${r.blog_posts.id}`
                  : r.projects
                    ? `/builder/projects/${r.projects.id}`
                    : null
                const published = item?.status === 'published'
                return (
                  <TableRow key={r.id}>
                    <TableCell className="align-top">
                      {href ? <Link href={href} className="font-medium hover:underline">{item?.title}</Link> : '—'}
                      {!published ? <p className="text-xs text-muted-foreground">Not published</p> : null}
                    </TableCell>
                    <TableCell className="align-top">{r.blog_posts ? 'Blog' : 'Project'}</TableCell>
                    {PLATFORMS.map((p) => (
                      <PlatformCell key={p.id} queueId={r.id} post={r.queue_share_posts.find((x) => x.platform === p.id)} />
                    ))}
                    <TableCell className="align-top">{formatDate(r.queued_at)}</TableCell>
                    <TableCell className="flex flex-col items-end gap-1 text-right align-top">
                      <form action={shareAgain}>
                        <input type="hidden" name="blog_post_id" value={r.blog_posts?.id ?? ''} />
                        <input type="hidden" name="project_id" value={r.projects?.id ?? ''} />
                        <SubmitButton variant="outline" size="sm">Share again</SubmitButton>
                      </form>
                      <form action={setQueuePosted}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="is_posted" value={String(!r.is_posted)} />
                        <SubmitButton variant="ghost" size="xs">{r.is_posted ? 'Reset all' : 'Mark all posted'}</SubmitButton>
                      </form>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </PageBody>
  )
}
