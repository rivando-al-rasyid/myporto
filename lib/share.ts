import { createClient } from '@/lib/supabase/client'

export type SharePlatform = 'linkedin' | 'x' | 'facebook'

export function buildShareUrl(platform: SharePlatform, url: string, title: string, text = '') {
  const encodedUrl = encodeURIComponent(url)
  const encodedText = encodeURIComponent(text || title)

  switch (platform) {
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    case 'x':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  }
}

// Browser-side insert into share_events (same table as the old portfolio).
export async function trackShareEvent(input: {
  entityType: 'blog' | 'project'
  entityId: string
  platform: string
  url: string
  title: string
}) {
  const { error } = await createClient().from('share_events').insert({
    entity_type: input.entityType,
    entity_id: input.entityId,
    platform: input.platform,
    url: input.url,
    title: input.title,
  })
  if (error) console.warn('Share event insert failed:', error.message)
}
