'use client'

import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import { Field } from '@/components/cms/fields'
import { Input } from '@/components/ui/input'

const BUCKET = 'portfolio-media'
const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Uploads to the public `portfolio-media` bucket and stores the public URL.
export function ImageField({
  label,
  name,
  defaultValue,
  folder,
}: {
  label: string
  name: string
  defaultValue?: string | null
  folder: string
}) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    if (!ALLOWED.includes(file.type)) return setError('Use a JPEG, PNG, WebP or GIF image.')
    if (file.size > MAX_BYTES) return setError('Image must be 5 MB or smaller.')

    setBusy(true)
    try {
      const supabase = createClient()
      const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
      const path = `${folder}/${Date.now()}-${safe}`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      })
      if (upErr) throw upErr
      setUrl(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  return (
    <Field label={label} htmlFor={name} hint="Upload a file (max 5 MB) or paste an image URL.">
      <Input id={name} name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
      <input type="file" accept={ALLOWED.join(',')} onChange={onFile} disabled={busy} className="text-xs" />
      {busy ? <p className="text-xs text-muted-foreground">Uploading…</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="mt-1 max-h-40 w-auto border object-cover" />
      ) : null}
    </Field>
  )
}
