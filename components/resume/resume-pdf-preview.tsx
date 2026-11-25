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

/**
 * One buffer of the preview. A new PDF is rendered in the hidden buffer first;
 * it is only shown once every page has painted, so the visible preview never
 * goes blank while it updates.
 */
function PdfPages({
  blob,
  width,
  visible,
  onReady,
  onError,
}: {
  blob: Blob | null
  width: number
  visible: boolean
  onReady: (blob: Blob, pages: number) => void
  onError: (message: string) => void
}) {
  const [numPages, setNumPages] = useState(0)
  const painted = useRef(0)

  // A new file starts a new paint count.
  useEffect(() => {
    painted.current = 0
    setNumPages(0)
  }, [blob])

  if (!blob) return null

  return (
    <div
      aria-hidden={!visible}
      className={visible ? undefined : 'pointer-events-none invisible fixed top-0 left-0 -z-10'}
      style={visible ? undefined : { width }}
    >
      <Document
        file={blob}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(e) => onError(e.message)}
        loading={null}
        className="flex flex-col gap-3"
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-sm ring-1 ring-black/5"
            onRenderSuccess={() => {
              painted.current += 1
              if (painted.current === numPages) onReady(blob, numPages)
            }}
          />
        ))}
      </Document>
    </div>
  )
}

export default function ResumePdfPreview({ data }: { data: ResumeData }) {
  const [slots, setSlots] = useState<[Blob | null, Blob | null]>([null, null])
  const [active, setActive] = useState<0 | 1>(0)
  const [shown, setShown] = useState(false) // true once the first PDF has painted
  const [pages, setPages] = useState(0)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const [width, setWidth] = useState(0)

  const box = useRef<HTMLDivElement>(null)
  const slotsRef = useRef(slots)
  const activeRef = useRef<0 | 1>(0)
  const lastKey = useRef('')
  const latestBlob = useRef<Blob | null>(null)

  // Track the available width so the pages scale with the column.
  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Rebuild the PDF only after typing pauses, and only if the content really changed.
  const key = JSON.stringify(data)
  useEffect(() => {
    if (key === lastKey.current) {
      setBusy(false)
      return
    }
    let stale = false
    setBusy(true)
    const timer = window.setTimeout(async () => {
      try {
        const next = await pdf(<ResumePdf data={clean(data)} /> as ReactElement<DocumentProps>).toBlob()
        if (stale) return
        lastKey.current = key
        latestBlob.current = next
        // Put the new file in the buffer that is NOT on screen.
        const target: 0 | 1 = slotsRef.current[activeRef.current] ? (activeRef.current === 0 ? 1 : 0) : activeRef.current
        const updated: [Blob | null, Blob | null] = [...slotsRef.current]
        updated[target] = next
        slotsRef.current = updated
        setSlots(updated)
        setError('')
      } catch (e) {
        if (!stale) {
          setError(e instanceof Error ? e.message : 'Could not generate the PDF.')
          setBusy(false)
        }
      }
    }, DEBOUNCE_MS)
    return () => {
      stale = true
      window.clearTimeout(timer)
    }
    // `key` is the serialized `data`, so this only re-runs on real changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  function handleReady(index: 0 | 1, blob: Blob, count: number) {
    // Ignore a buffer that has already been replaced by a newer file.
    if (slotsRef.current[index] !== blob) return
    activeRef.current = index
    setActive(index)
    setShown(true)
    setPages(count)
    if (latestBlob.current === blob) setBusy(false)
  }

  function download() {
    const blob = latestBlob.current
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(data.name || 'resume').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-resume.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pageWidth = Math.max(width, 200)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={download} disabled={!shown}>
          Download PDF
        </Button>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {error ? '' : busy ? 'Updating…' : pages ? `${pages} page${pages > 1 ? 's' : ''}` : ''}
        </span>
      </div>

      <div ref={box} className="max-h-[calc(100vh-9rem)] overflow-y-auto bg-muted/40 p-3">
        {error ? (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
        {!shown && !error ? <p className="p-4 text-xs text-muted-foreground">Generating preview…</p> : null}
        {width > 0 &&
          ([0, 1] as const).map((i) => (
            <PdfPages
              key={i}
              blob={slots[i]}
              width={pageWidth}
              visible={active === i}
              onReady={(blob, count) => handleReady(i, blob, count)}
              onError={setError}
            />
          ))}
      </div>
    </div>
  )
}
