import type { Metadata } from 'next';
import { HomePage } from '@/features/home/HomePage';
import { buildGraphData } from '@/lib/graph';
import { getCategories, getPublishedBlogPosts, getSiteSettings } from '@/lib/contentService';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    title: site?.site_name || 'Portfolio Knowledge Graph',
    description: site?.hero_description || 'A modern portfolio CMS with blog, graph relations, and Supabase admin.'
  };
}

export default async function Page() {
  const [site, posts, categories] = await Promise.all([getSiteSettings(), getPublishedBlogPosts(), getCategories()]);

  return <HomePage site={site} posts={posts} categories={categories} graphData={buildGraphData(posts, categories)} />;
}
