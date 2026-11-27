'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'

import { saveResume } from '@/app/builder/actions'
import { Field } from '@/components/cms/fields'
import { SubmitButton } from '@/components/cms/submit-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ResumeData } from '@/lib/resume'

// pdf.js only works in the browser, so skip server rendering for the preview.
const ResumePdfPreview = dynamic(() => import('@/components/resume/resume-pdf-preview'), {
  ssr: false,
  loading: () => <p className="p-4 text-xs text-muted-foreground">Loading preview…</p>,
})

type Proj = { name: string; location: string; period: string; points: string }
type Job = { company: string; location: string; role: string; period: string; points: string; projects: Proj[] }
const emptyProject: Proj = { name: '', location: '', period: '', points: '' }
type Group = { category: string; items: string }
type Edu = ResumeData['education'][number]
type Link = ResumeData['links'][number]

const areaClass =
  'w-full min-w-0 rounded-none border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 dark:bg-input/30'

function patch<T>(list: T[], index: number, change: Partial<T>) {
  return list.map((item, i) => (i === index ? { ...item, ...change } : item))
}

function SectionHead({ title, onAdd, addLabel }: { title: string; onAdd: () => void; addLabel: string }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium">{title}</h3>
      <Button type="button" variant="outline" size="sm" onClick={onAdd}>
        {addLabel}
      </Button>
    </div>
  )
}

export function ResumeForm({
  initial,
  preview,
  dbSkillGroups,
  versionId,
  versionLabel,
}: {
  // Resume as saved in the resume table (skills here are the manual fallback).
  initial: ResumeData
  // Resume with the skills from /builder/skills merged in; this is what the PDF shows.
  preview: ResumeData
  dbSkillGroups: ResumeData['skillGroups']
  versionId: string
  versionLabel: string
}) {
  const [label, setLabel] = useState(versionLabel)
  const skillsFromDb = dbSkillGroups.length > 0
  const [name, setName] = useState(initial.name)
  const [title, setTitle] = useState(initial.title)
  const [email, setEmail] = useState(initial.email)
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [location, setLocation] = useState(initial.location ?? '')
  const [website, setWebsite] = useState(initial.website ?? '')
  const [summary, setSummary] = useState(initial.summary)
  const [links, setLinks] = useState<Link[]>(initial.links)
  const [jobs, setJobs] = useState<Job[]>(
    initial.experience.map((e) => ({
      company: e.company,
      location: e.location ?? '',
      role: e.role,
      period: e.period,
      points: e.points.join('\n'),
      projects: e.projects.map((p) => ({
        name: p.name,
        location: p.location ?? '',
        period: p.period,
        points: p.points.join('\n'),
      })),
    }))
  )
  const setJobProjects = (jobIndex: number, projects: Proj[]) => setJobs(patch(jobs, jobIndex, { projects }))
  const [education, setEducation] = useState<Edu[]>(initial.education)
  const [groups, setGroups] = useState<Group[]>(
    initial.skillGroups.map((g) => ({ category: g.category, items: g.items.join(', ') }))
  )

  const lines = (v: string) => v.split('\n').map((p) => p.trim()).filter(Boolean)

  const payload: ResumeData = {
    name,
    title,
    email,
    phone,
    location,
    website,
    summary,
    links,
    experience: jobs.map((j) => ({
      company: j.company,
      location: j.location,
      role: j.role,
      period: j.period,
      points: lines(j.points),
      projects: j.projects.map((p) => ({
        name: p.name,
        location: p.location,
        period: p.period,
        points: lines(p.points),
      })),
    })),
    education,
    // When skills come from the database, keep the saved manual list untouched.
    skillGroups: skillsFromDb
      ? initial.skillGroups
      : groups.map((g) => ({
          category: g.category,
          items: g.items.split(',').map((s) => s.trim()).filter(Boolean),
        })),
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
    <form action={saveResume} className="grid min-w-0 gap-8">
      <input type="hidden" name="resume_json" value={JSON.stringify(payload)} readOnly />
      <input type="hidden" name="resume_id" value={versionId} readOnly />
      <Field label="Version name (e.g. the target job)" htmlFor="r-label">
        <Input id="r-label" name="label" value={label} onChange={(e) => setLabel(e.target.value)} required />
      </Field>

      <section className="grid gap-4">
        <h3 className="text-sm font-medium">Header</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" htmlFor="r-name"><Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} required /></Field>
          <Field label="Job title / target job" htmlFor="r-title"><Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fullstack Web Developer" /></Field>
          <Field label="Mobile" htmlFor="r-phone"><Input id="r-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="Email" htmlFor="r-email"><Input id="r-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Location" htmlFor="r-location"><Input id="r-location" value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
          <Field label="Portfolio link" htmlFor="r-website"><Input id="r-website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="yourname.dev" /></Field>
        </div>

        <SectionHead title="Links (LinkedIn, GitHub…)" addLabel="Add link" onAdd={() => setLinks([...links, { label: '', href: '' }])} />
        {links.map((l, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
            <Input aria-label="Link label" placeholder="LinkedIn" value={l.label} onChange={(e) => setLinks(patch(links, i, { label: e.target.value }))} />
            <Input aria-label="Link URL" placeholder="https://linkedin.com/in/you" value={l.href} onChange={(e) => setLinks(patch(links, i, { href: e.target.value }))} />
            <Button type="button" variant="ghost" size="sm" onClick={() => setLinks(links.filter((_, x) => x !== i))}>Remove</Button>
          </div>
        ))}
      </section>

      <section className="grid gap-3">
        <h3 className="text-sm font-medium">Summary</h3>
        <textarea aria-label="Summary" rows={6} className={areaClass} value={summary} onChange={(e) => setSummary(e.target.value)} />
        <p className="text-xs text-muted-foreground">Mention your years of experience and your latest role.</p>
      </section>

      <section className="grid gap-4">
        <SectionHead title="Experience" addLabel="Add job" onAdd={() => setJobs([...jobs, { company: '', location: '', role: '', period: '', points: '', projects: [] }])} />
        <p className="text-xs text-muted-foreground">
          Put projects inside the job they belong to. Wrap key terms in **double asterisks** to make them bold, like the CV template.
        </p>
        {jobs.map((j, i) => (
          <div key={i} className="grid gap-3 border p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input aria-label="Company" placeholder="Company" value={j.company} onChange={(e) => setJobs(patch(jobs, i, { company: e.target.value }))} />
              <Input aria-label="Location" placeholder="Remote from Batam, Indonesia" value={j.location} onChange={(e) => setJobs(patch(jobs, i, { location: e.target.value }))} />
              <Input aria-label="Role" placeholder="Fullstack Web Developer" value={j.role} onChange={(e) => setJobs(patch(jobs, i, { role: e.target.value }))} />
              <Input aria-label="Period" placeholder="Jan 2024 – Present" value={j.period} onChange={(e) => setJobs(patch(jobs, i, { period: e.target.value }))} />
            </div>
            <textarea aria-label="Highlights" rows={5} className={areaClass} placeholder="One highlight per line" value={j.points} onChange={(e) => setJobs(patch(jobs, i, { points: e.target.value }))} />

            <div className="grid gap-3 border-l pl-4">
              <SectionHead title={`Projects at ${j.company || 'this job'}`} addLabel="Add blank project" onAdd={() => setJobProjects(i, [...j.projects, emptyProject])} />
              {j.projects.map((p, x) => {
                return (
                  <div key={x} className="grid gap-3 border p-3">
                    <p className="text-xs font-medium">Project {x + 1}</p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <Input aria-label="Project / client" placeholder="PT ESB Indonesia" value={p.name} onChange={(e) => setJobProjects(i, patch(j.projects, x, { name: e.target.value }))} />
                      <Input aria-label="Location" placeholder="Remote" value={p.location} onChange={(e) => setJobProjects(i, patch(j.projects, x, { location: e.target.value }))} />
                      <Input aria-label="Period" placeholder="Jun 2025 – Jul 2025" value={p.period} onChange={(e) => setJobProjects(i, patch(j.projects, x, { period: e.target.value }))} />
                    </div>
                    <textarea aria-label="Project highlights" rows={4} className={areaClass} placeholder="One highlight per line" value={p.points} onChange={(e) => setJobProjects(i, patch(j.projects, x, { points: e.target.value }))} />
                    <div><Button type="button" variant="ghost" size="sm" onClick={() => setJobProjects(i, j.projects.filter((_, y) => y !== x))}>Remove project</Button></div>
                  </div>
                )
              })}
            </div>

            <div><Button type="button" variant="ghost" size="sm" onClick={() => setJobs(jobs.filter((_, x) => x !== i))}>Remove job</Button></div>
          </div>
        ))}
      </section>

      <section className="grid gap-4">
        <SectionHead title="Education" addLabel="Add education" onAdd={() => setEducation([...education, { school: '', degree: '', period: '' }])} />
        {education.map((e, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[2fr_2fr_1fr_auto]">
            <Input aria-label="School" placeholder="Diponegoro University" value={e.school} onChange={(ev) => setEducation(patch(education, i, { school: ev.target.value }))} />
            <Input aria-label="Degree" placeholder="Bachelor Degree in …" value={e.degree} onChange={(ev) => setEducation(patch(education, i, { degree: ev.target.value }))} />
            <Input aria-label="Period" placeholder="2011 – 2015" value={e.period} onChange={(ev) => setEducation(patch(education, i, { period: ev.target.value }))} />
            <Button type="button" variant="ghost" size="sm" onClick={() => setEducation(education.filter((_, x) => x !== i))}>Remove</Button>
          </div>
        ))}
      </section>

      {skillsFromDb ? (
        <section className="grid gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Skills</h3>
            <Link href="/builder/categories" className="text-xs underline underline-offset-4">
              Manage categories
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Pulled from Categories: each top-level category is a skill group and its sub categories are the skills.
            Untick “On resume” on a category to hide it.
          </p>
          <dl className="grid gap-2 border p-4 text-xs">
            {dbSkillGroups.map((g) => (
              <div key={g.category} className="grid gap-0.5">
                <dt className="font-medium">{g.category}</dt>
                <dd className="text-muted-foreground">{g.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : (
        <section className="grid gap-3">
          <SectionHead title="Skills" addLabel="Add skill group" onAdd={() => setGroups([...groups, { category: '', items: '' }])} />
          <p className="text-xs text-muted-foreground">
            No categories with sub categories yet, so this manual list is used. Create groups and skills under{' '}
            <Link href="/builder/categories" className="underline underline-offset-4">Categories</Link> to manage them there instead.
          </p>
          {groups.map((g, i) => (
            <div key={i} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
              <Input aria-label="Parent skill" placeholder="Backend Development" value={g.category} onChange={(e) => setGroups(patch(groups, i, { category: e.target.value }))} />
              <Input aria-label="Sub skills" placeholder="Go (Golang), Microservices, gRPC" value={g.items} onChange={(e) => setGroups(patch(groups, i, { items: e.target.value }))} />
              <Button type="button" variant="ghost" size="sm" onClick={() => setGroups(groups.filter((_, x) => x !== i))}>Remove</Button>
            </div>
          ))}
        </section>
      )}

      <div><SubmitButton>Save resume</SubmitButton></div>
    </form>

    <div className="flex min-w-0 flex-col gap-2 lg:sticky lg:top-4 lg:self-start">
      <p className="text-xs text-muted-foreground">Preview shows your last saved version. Click Save resume to update it.</p>
      {/* `preview` is the saved data from the server, so the preview only changes after a save. */}
      <ResumePdfPreview data={preview} />
    </div>
    </div>
  )
}
