import { ImageResponse } from 'next/og'

import { getSiteSettings } from '@/lib/contentService'

export const alt = 'Portfolio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Default share card for pages that do not set their own image.
export default async function Image() {
  const settings = await getSiteSettings()
  const name = settings?.site_name || 'Portfolio'
  const tagline = settings?.hero_title || 'Articles and open source work'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0a0a0a',
          color: '#fafafa',
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: 4, textTransform: 'uppercase', color: '#a3a3a3' }}>{name}</div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>{tagline}</div>
      </div>
    ),
    size
  )
}
