'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { generateCoverLetter, type LetterTone } from '@/lib/cover-letter'
import type { ResumeData } from '@/lib/resume'

type ProjectOption = { id: string; title: string; summary: string | null }

const fieldClass =
  'w-full border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50'

export function CoverLetterGenerator({
  resume,
  projects,
  showPdf = true,
}: {
  resume: ResumeData
  projects: ProjectOption[]
  showPdf?: boolean
}) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [hiringManager, setHiringManager] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [extra, setExtra] = useState('')
  const [tone, setTone] = useState<LetterTone>('professional')
  const [selected, setSelected] = useState<string[]>([])
  const [letter, setLetter] = useState('')

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]))

  function generate() {
    if (!company.trim() || !role.trim()) {
      toast.error('Enter the company and role first.')
      return
    }
    setLetter(
      generateCoverLetter(resume, {
        company,
        role,
        hiringManager,
        jobDescription,
        tone,
        extra,
        projects: projects.filter((p) => selected.includes(p.id)),
        today: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      })
    )
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(letter)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Could not copy. Select the text and copy manually.')
    }
  }

  function downloadTxt() {
    const url = URL.createObjectURL(new Blob([letter], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `cover-letter-${company.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'draft'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] print:block">
      <div className="flex flex-col gap-4 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Frontend Developer" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="manager">Hiring manager (optional)</Label>
            <Input id="manager" value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} placeholder="Ms. Putri" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tone">Tone</Label>
            <select id="tone" className={fieldClass} value={tone} onChange={(e) => setTone(e.target.value as LetterTone)}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="jd">Job description (optional)</Label>
          <textarea
            id="jd"
            rows={6}
            className={fieldClass}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste it here and I'll highlight the skills that match."
          />
        </div>

        {projects.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Mention projects</legend>
            {projects.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
                {p.title}
              </label>
            ))}
          </fieldset>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="extra">Extra paragraph (optional)</Label>
          <textarea
            id="extra"
            rows={3}
            className={fieldClass}
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="Why this company? Anything specific to add."
          />
        </div>

        <Button onClick={generate}>Generate cover letter</Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={copy} disabled={!letter}>Copy</Button>
          <Button variant="outline" size="sm" onClick={downloadTxt} disabled={!letter}>Download .txt</Button>
          {showPdf && (
            <Button variant="outline" size="sm" onClick={() => window.print()} disabled={!letter}>Save as PDF</Button>
          )}
        </div>

        <textarea
          aria-label="Cover letter"
          className={`${fieldClass} min-h-[32rem] bg-white leading-relaxed text-neutral-900 print:hidden`}
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          placeholder="Your generated letter appears here. You can edit it before copying."
        />
        {letter && (
          <div className="hidden whitespace-pre-wrap text-sm leading-relaxed text-black print:block">{letter}</div>
        )}
      </div>
    </div>
  )
}
