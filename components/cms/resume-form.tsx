'use client'

import { useState } from 'react'

import { saveResume } from '@/app/builder/actions'
import { Field } from '@/components/cms/fields'
import { SubmitButton } from '@/components/cms/submit-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ResumeData } from '@/lib/resume'

type Job = { role: string; company: string; period: string; location: string; points: string }
type Edu = ResumeData['education'][number]
type Link = ResumeData['links'][number]

const areaClass =
  'w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30'

function move<T>(list: T[], index: number, patch: Partial<T>) {
  return list.map((item, i) => (i === index ? { ...item, ...patch } : item))
}

export function ResumeForm({ initial }: { initial: ResumeData }) {
  const [name, setName] = useState(initial.name)
  const [title, setTitle] = useState(initial.title)
  const [email, setEmail] = useState(initial.email)
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [location, setLocation] = useState(initial.location)
  const [website, setWebsite] = useState(initial.website ?? '')
  const [summary, setSummary] = useState(initial.summary)
  const [skills, setSkills] = useState(initial.skills.join(', '))
  const [links, setLinks] = useState<Link[]>(initial.links)
  const [jobs, setJobs] = useState<Job[]>(
    initial.experience.map((e) => ({ ...e, location: e.location ?? '', points: e.points.join('\n') }))
  )
  const [education, setEducation] = useState<Edu[]>(initial.education)

  const payload: ResumeData = {
    name,
    title,
    email,
    phone,
    location,
    website,
    summary,
    skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
    links,
    experience: jobs.map((j) => ({
      ...j,
      points: j.points.split('\n').map((p) => p.trim()).filter(Boolean),
    })),
    education,
  }

  return (
    <form action={saveResume} className="grid max-w-3xl gap-8">
      <input type="hidden" name="resume_json" value={JSON.stringify(payload)} readOnly />

      <section className="grid gap-4">
        <h3 className="text-sm font-medium">Basics</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" htmlFor="r-name"><Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} required /></Field>
          <Field label="Job title" htmlFor="r-title"><Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Email" htmlFor="r-email"><Input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Phone" htmlFor="r-phone"><Input id="r-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="Location" htmlFor="r-location"><Input id="r-location" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
          <Field label="Website" htmlFor="r-website"><Input id="r-website" value={website} onChange={(e) => setWebsite(e.target.value)} /></Field>
        </div>
        <Field label="Summary" htmlFor="r-summary">
          <textarea id="r-summary" rows={4} className={areaClass} value={summary} onChange={(e) => setSummary(e.target.value)} />
        </Field>
        <Field label="Skills" htmlFor="r-skills" hint="Comma separated. The cover letter generator matches these against a job description.">
          <textarea id="r-skills" rows={2} className={areaClass} value={skills} onChange={(e) => setSkills(e.target.value)} />
        </Field>
      </section>

      <section className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Links</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => setLinks([...links, { label: '', href: '' }])}>Add link</Button>
        </div>
        {links.map((l, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
            <Input aria-label="Link label" placeholder="GitHub" value={l.label} onChange={(e) => setLinks(move(links, i, { label: e.target.value }))} />
            <Input aria-label="Link URL" placeholder="https://github.com/you" value={l.href} onChange={(e) => setLinks(move(links, i, { href: e.target.value }))} />
            <Button type="button" variant="ghost" size="sm" onClick={() => setLinks(links.filter((_, x) => x !== i))}>Remove</Button>
          </div>
        ))}
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Experience</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => setJobs([...jobs, { role: '', company: '', period: '', location: '', points: '' }])}>Add job</Button>
        </div>
        {jobs.map((j, i) => (
          <div key={i} className="grid gap-3 border p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input aria-label="Role" placeholder="Role" value={j.role} onChange={(e) => setJobs(move(jobs, i, { role: e.target.value }))} />
              <Input aria-label="Company" placeholder="Company" value={j.company} onChange={(e) => setJobs(move(jobs, i, { company: e.target.value }))} />
              <Input aria-label="Period" placeholder="2023 – Present" value={j.period} onChange={(e) => setJobs(move(jobs, i, { period: e.target.value }))} />
              <Input aria-label="Location" placeholder="Remote" value={j.location} onChange={(e) => setJobs(move(jobs, i, { location: e.target.value }))} />
            </div>
            <textarea aria-label="Highlights" rows={4} className={areaClass} placeholder="One highlight per line" value={j.points} onChange={(e) => setJobs(move(jobs, i, { points: e.target.value }))} />
            <div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setJobs(jobs.filter((_, x) => x !== i))}>Remove job</Button>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Education</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => setEducation([...education, { school: '', degree: '', period: '' }])}>Add education</Button>
        </div>
        {education.map((e, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[2fr_2fr_1fr_auto]">
            <Input aria-label="School" placeholder="School" value={e.school} onChange={(ev) => setEducation(move(education, i, { school: ev.target.value }))} />
            <Input aria-label="Degree" placeholder="Degree" value={e.degree} onChange={(ev) => setEducation(move(education, i, { degree: ev.target.value }))} />
            <Input aria-label="Period" placeholder="2017 – 2021" value={e.period} onChange={(ev) => setEducation(move(education, i, { period: ev.target.value }))} />
            <Button type="button" variant="ghost" size="sm" onClick={() => setEducation(education.filter((_, x) => x !== i))}>Remove</Button>
          </div>
        ))}
      </section>

      <div>
        <SubmitButton>Save resume</SubmitButton>
      </div>
    </form>
  )
}
