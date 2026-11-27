import type { Metadata } from 'next';
import { GraphPage } from '@/features/graph/GraphPage';
import { buildGraphData } from '@/lib/graph';
import { getCategories, getPublishedBlogPosts } from '@/lib/contentService';

export const metadata: Metadata = {
  title: 'Knowledge Graph',
  description: 'Interactive map of posts and categories.'
};

export default async function Page() {
  const [posts, categories] = await Promise.all([getPublishedBlogPosts(), getCategories()]);
  return <GraphPage graphData={buildGraphData(posts, categories)} />;
}
