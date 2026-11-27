import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProjectListPage } from '@/features/projects/ProjectListPage';
import { GitHubRepos } from '@/features/projects/GitHubRepos';
import { getPublishedProjects } from '@/lib/contentService';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Selected projects, case studies, and engineering work.'
};

export default async function Page() {
  const projects = await getPublishedProjects();
  return (
    <>
      <ProjectListPage projects={projects} />
      <Suspense fallback={null}>
        <GitHubRepos />
      </Suspense>
    </>
  );
}
