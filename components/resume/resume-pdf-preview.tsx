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

// The form can hold half-filled rows; drop them so the PDF has no empty entries.
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

  // Track the available width so the pages scale with the column.
  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Re-generate the PDF shortly after the form stops changing.
  const key = JSON.stringify(data)
  useEffect(() => {
    let stale = false
    setBusy(true)
    const timer = window.setTimeout(async () => {
      try {
        const next = await pdf(<ResumePdf data={clean(data)} /> as ReactElement<DocumentProps>).toBlob()
        if (stale) return
        setBlob(next)
        setError('')
      } catch (e) {
        if (!stale) setError(e instanceof Error ? e.message : 'Could not generate the PDF.')
      } finally {
        if (!stale) setBusy(false)
      }
    }, 600)
    return () => {
      stale = true
      window.clearTimeout(timer)
    }
    // `key` is the serialized `data`, so this only re-runs on real changes.
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
                width={Math.max(width - 24, 200)}
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
