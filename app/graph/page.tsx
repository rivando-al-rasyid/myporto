import type { Metadata } from 'next';
import { GraphPage } from '@/features/graph/GraphPage';
import { buildGraphData } from '@/lib/graph';
import { getCategories, getPublishedBlogPosts, getPublishedProjects } from '@/lib/contentService';

export const metadata: Metadata = {
  title: 'Knowledge Graph',
  description: 'Interactive map of posts, projects, and categories.'
};

export default async function Page() {
  const [posts, projects, categories] = await Promise.all([getPublishedBlogPosts(), getPublishedProjects(), getCategories()]);
  return <GraphPage graphData={buildGraphData(posts, projects, categories)} />;
}
