'use client'

import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Copy01Icon, Share08Icon, Tick02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { buildShareUrl, trackShareEvent, type SharePlatform } from '@/lib/share'

const platforms: { id: SharePlatform; label: string }[] = [
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'x', label: 'X / Twitter' },
  { id: 'facebook', label: 'Facebook' },
]

interface ShareButtonProps {
  entityType: 'blog' | 'project'
  entityId: string
  title: string
  text?: string
  url: string
}

export function ShareButton({ entityType, entityId, title, text = '', url }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const track = (platform: string) => trackShareEvent({ entityType, entityId, platform, url, title })

  // Use the native share sheet when available, otherwise show the menu.
  function handleOpenChange(next: boolean) {
    if (next && typeof navigator !== 'undefined' && navigator.share) {
      navigator
        .share({ title, text, url })
        .then(() => track('native'))
        .catch(() => setOpen(true))
      return
    }
    setOpen(next)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    track('copy')
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <HugeiconsIcon icon={Share08Icon} strokeWidth={2} /> Share
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        {platforms.map(({ id, label }) => (
          <DropdownMenuItem
            key={id}
            render={<a href={buildShareUrl(id, url, title, text)} target="_blank" rel="noreferrer" />}
            onClick={() => track(id)}
          >
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem closeOnClick={false} onClick={copyLink}>
          <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} strokeWidth={2} />
          {copied ? 'Copied' : 'Copy link'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
