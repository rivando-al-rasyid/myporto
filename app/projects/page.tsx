import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GitHubRepos } from '@/features/projects/GitHubRepos';

export const metadata: Metadata = {
  title: 'GitHub',
  description: 'Public repositories and open source work on GitHub.'
};

export default function Page() {
  return (
    <Suspense>
      <GitHubRepos />
    </Suspense>
  );
}
