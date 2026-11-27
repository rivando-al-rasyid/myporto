import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowUpRight01Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GITHUB_USERNAME, getGitHubRepos } from '@/lib/github'
import { formatDate } from '@/lib/cms'
import { truncateText } from '@/lib/utils'

export async function GitHubRepos() {
  const repos = await getGitHubRepos()
  if (repos.length === 0) return null

  return (
    <section className="mx-auto mt-16 max-w-6xl px-4 pb-10">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Open source</p>
        <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl">
          Public repositories on GitHub.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Everything I push to{' '}
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            GitHub
          </a>
          , fetched live.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {repos.map((repo) => (
          <Card key={repo.id} className="group h-full transition hover:-translate-y-1 hover:shadow-md">
            <CardHeader>
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge variant="outline">GitHub</Badge>
                <span className="text-xs text-muted-foreground">Updated {formatDate(repo.pushed_at)}</span>
              </div>
              <CardTitle className="text-base leading-tight">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {repo.name}
                </a>
              </CardTitle>
              <CardDescription>{truncateText(repo.description, 140) || 'No description.'}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="mb-4 flex flex-wrap gap-2">
                {repo.language ? <Badge variant="secondary">{repo.language}</Badge> : null}
                {repo.archived ? <Badge variant="secondary">Archived</Badge> : null}
                <span className="text-xs text-muted-foreground">★ {repo.stargazers_count}</span>
                <span className="text-xs text-muted-foreground">⑂ {repo.forks_count}</span>
              </div>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                View repository <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} className="size-4" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
