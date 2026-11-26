import { ContentCard } from '@/components/content-card'
import { EmptyState } from '@/components/empty-state'
import type { Project } from '@/lib/cms'

export function ProjectListPage({ projects }: { projects: Project[] }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Projects</p>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-5xl">
          Work that connects product and engineering.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Showcase projects, link repositories, and connect each work item to categories.
        </p>
      </div>

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Create and publish projects from the builder dashboard." />
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        {projects.map((project) => (
          <ContentCard key={project.id} item={project} type="project" />
        ))}
      </div>
    </section>
  )
}
