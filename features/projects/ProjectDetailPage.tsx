import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, GitBranchIcon, LinkSquare02Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import type { Project } from '@/lib/cms'
import { renderMarkdown } from '@/lib/markdown'
import { cn, getCanonicalUrl } from '@/lib/utils'
import { ShareButton } from '../share/ShareButton'

export function ProjectDetailPage({ project }: { project: Project }) {
  const url = getCanonicalUrl(`/projects/${project.slug}`)

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/projects" className={cn(buttonVariants({ variant: 'ghost' }), 'mb-6 -ml-3')}>
        <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} /> Back
      </Link>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">Project</Badge>
        {project.categories?.map((category) => (
          <Badge key={category.id} variant="outline">
            {category.name}
          </Badge>
        ))}
      </div>
      <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">{project.title}</h1>
      {project.summary ? <p className="mt-5 text-lg text-muted-foreground">{project.summary}</p> : null}
      {project.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.image_url} alt={project.title} className="mt-8 aspect-video w-full border object-cover" />
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {project.demo_url ? (
          <a href={project.demo_url} target="_blank" rel="noreferrer" className={buttonVariants()}>
            Live demo <HugeiconsIcon icon={LinkSquare02Icon} strokeWidth={2} />
          </a>
        ) : null}
        {project.repo_url ? (
          <a href={project.repo_url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'outline' })}>
            Repository <HugeiconsIcon icon={GitBranchIcon} strokeWidth={2} />
          </a>
        ) : null}
        <ShareButton
          entityType="project"
          entityId={project.id}
          title={project.title}
          text={project.summary ?? ''}
          url={url}
        />
      </div>
      <div className="markdown-body mt-10 border-t pt-8">{renderMarkdown(project.content)}</div>
    </article>
  )
}
