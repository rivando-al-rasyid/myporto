import { connection } from 'next/server'

export const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'rivando-al-rasyid'

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  pushed_at: string
  archived: boolean
}

export async function getGitHubRepos(): Promise<GitHubRepo[]> {
  await connection()

  const response = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed&direction=desc&type=owner`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    console.warn('GitHub repos fetch failed:', response.status)
    return []
  }

  return (await response.json()) as GitHubRepo[]
}
