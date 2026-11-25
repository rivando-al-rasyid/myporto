'use client'

// Load this file with next/dynamic + ssr:false (pdf.js needs the browser).
import { pdf, type DocumentProps } from '@react-pdf/renderer'
import { useEffect, useRef, useState, type ReactElement } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

import { ResumePdf } from '@/components/resume/resume-pdf'
import { Button } from '@/components/ui/button'
import { normalizeResume, type ResumeData } from '@/lib/resume'

// Must be set in the same module that renders <Document>/<Page>.
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

// ---------------------------------------------------------------------------
// localStorage cache: content hash -> PDF (base64). Same content is never rebuilt,
// even after a page reload. Bump CACHE_VERSION whenever you change resume-pdf.tsx,
// otherwise old cached PDFs keep the old layout.
// ---------------------------------------------------------------------------
const CACHE_VERSION = 'v1'
const PREFIX = `resume-pdf:${CACHE_VERSION}:`
const INDEX_KEY = `${PREFIX}index`
const CACHE_LIMIT = 5

function readIndex(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(INDEX_KEY) ?? '[]')
    return Array.isArray(v) ? v.filter((k): k is string => typeof k === 'string') : []
  } catch {
    return []
  }
}

function readCache(key: string): Blob | null {
  try {
    const b64 = localStorage.getItem(PREFIX + key)
    if (!b64) return null
    const bin = atob(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return new Blob([bytes], { type: 'application/pdf' })
  } catch {
    return null
  }
}

function toBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function writeCache(key: string, blob: Blob) {
  try {
    localStorage.setItem(PREFIX + key, await toBase64(blob))
    const index = readIndex().filter((k) => k !== key)
    index.push(key)
    while (index.length > CACHE_LIMIT) {
      const oldest = index.shift()
      if (oldest) localStorage.removeItem(PREFIX + oldest)
    }
    localStorage.setItem(INDEX_KEY, JSON.stringify(index))
  } catch {
    // Storage full or blocked (private mode): just skip caching.
  }
}

// Small non-crypto string hash (cyrb53) so cache keys stay short.
function hash(str: string) {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

// The form can hold half-filled rows; drop them so the PDF has no empty entries.
// The cache key comes from this cleaned data, so editing a blank row is not a change.
function clean(data: ResumeData): ResumeData {
  const r = normalizeResume(data)
  return {
    ...r,
    experience: r.experience.filter((e) => e.company.trim() || e.role.trim()),
    projects: r.projects.filter((p) => p.name.trim()),
    education: r.education.filter((e) => e.school.trim() || e.degree.trim()),
  }
}

export default function ResumePdfPreview({ data }: { data: ResumeData }) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [width, setWidth] = useState(0)
  const box = useRef<HTMLDivElement>(null)

  const cleaned = clean(data)
  const key = hash(JSON.stringify(cleaned))

  // Track the available width so the pages scale with the column.
  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Runs only when the cleaned content changes. No timer: cache hit is instant,
  // otherwise the PDF is built right away and then cached.
  useEffect(() => {
    let stale = false
    setBusy(true)
    ;(async () => {
      try {
        let next = readCache(key)
        if (!next) {
          next = await pdf(<ResumePdf data={cleaned} /> as ReactElement<DocumentProps>).toBlob()
          void writeCache(key, next)
        }
        if (stale) return
        setBlob(next)
        setError('')
      } catch (e) {
        if (!stale) setError(e instanceof Error ? e.message : 'Could not generate the PDF.')
      } finally {
        if (!stale) setBusy(false)
      }
    })()
    return () => {
      stale = true
    }
    // `key` identifies the cleaned data, so this only re-runs on real changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  function download() {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(data.name || 'resume').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-resume.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={download} disabled={!blob}>
          Download PDF
        </Button>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {error ? '' : busy ? 'Updating preview…' : numPages ? `${numPages} page${numPages > 1 ? 's' : ''}` : ''}
        </span>
      </div>

      <div ref={box} className="max-h-[calc(100vh-9rem)] overflow-y-auto bg-muted/40 p-3">
        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : blob && width > 0 ? (
          <Document
            file={blob}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(e) => setError(e.message)}
            loading={<p className="p-4 text-xs text-muted-foreground">Loading preview…</p>}
            className="flex flex-col gap-3"
          >
            {Array.from({ length: numPages }, (_, i) => (
              <Page
                key={i}
                pageNumber={i + 1}
                width={Math.max(width, 200)}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-sm ring-1 ring-black/5"
              />
            ))}
          </Document>
        ) : (
          <p className="p-4 text-xs text-muted-foreground">Generating preview…</p>
        )}
      </div>
    </div>
  )
}
