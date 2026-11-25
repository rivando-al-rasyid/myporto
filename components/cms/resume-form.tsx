'use client'

import { useState } from 'react'

import { saveResume } from '@/app/builder/actions'
import { Field } from '@/components/cms/fields'
import { SubmitButton } from '@/components/cms/submit-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ResumeData } from '@/lib/resume'

type Job = { company: string; location: string; role: string; period: string; points: string }
type Proj = { name: string; location: string; period: string; points: string }
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

export function ResumeForm({ initial }: { initial: ResumeData }) {
  const [name, setName] = useState(initial.name)
  const [title, setTitle] = useState(initial.title)
  const [email, setEmail] = useState(initial.email)
  const [phone, setPhone] = useState(initial.phone ?? '')
  const [location, setLocation] = useState(initial.location ?? '')
  const [website, setWebsite] = useState(initial.website ?? '')
  const [summary, setSummary] = useState(initial.summary)
  const [links, setLinks] = useState<Link[]>(initial.links)
  const [jobs, setJobs] = useState<Job[]>(
    initial.experience.map((e) => ({ ...e, location: e.location ?? '', points: e.points.join('\n') }))
  )
  const [projects, setProjects] = useState<Proj[]>(
    initial.projects.map((p) => ({ ...p, location: p.location ?? '', points: p.points.join('\n') }))
  )
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
    experience: jobs.map((j) => ({ ...j, points: lines(j.points) })),
    projects: projects.map((p) => ({ ...p, points: lines(p.points) })),
    education,
    skillGroups: groups.map((g) => ({
      category: g.category,
      items: g.items.split(',').map((s) => s.trim()).filter(Boolean),
    })),
  }

  return (
    <form action={saveResume} className="grid max-w-3xl gap-8">
      <input type="hidden" name="resume_json" value={JSON.stringify(payload)} readOnly />

      <section className="grid gap-4">
        <h3 className="text-sm font-medium">Header</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" htmlFor="r-name"><Input id="r-name" value={name} onChange={(e) => setName(e.target.value)} required /></Field>
          <Field label="Job title" htmlFor="r-title"><Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
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
        <SectionHead title="Experience" addLabel="Add job" onAdd={() => setJobs([...jobs, { company: '', location: '', role: '', period: '', points: '' }])} />
        {jobs.map((j, i) => (
          <div key={i} className="grid gap-3 border p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input aria-label="Company" placeholder="Company" value={j.company} onChange={(e) => setJobs(patch(jobs, i, { company: e.target.value }))} />
              <Input aria-label="Location" placeholder="Remote from Batam, Indonesia" value={j.location} onChange={(e) => setJobs(patch(jobs, i, { location: e.target.value }))} />
              <Input aria-label="Role" placeholder="Fullstack Web Developer" value={j.role} onChange={(e) => setJobs(patch(jobs, i, { role: e.target.value }))} />
              <Input aria-label="Period" placeholder="Jan 2024 – Present" value={j.period} onChange={(e) => setJobs(patch(jobs, i, { period: e.target.value }))} />
            </div>
            <textarea aria-label="Highlights" rows={5} className={areaClass} placeholder="One highlight per line" value={j.points} onChange={(e) => setJobs(patch(jobs, i, { points: e.target.value }))} />
            <div><Button type="button" variant="ghost" size="sm" onClick={() => setJobs(jobs.filter((_, x) => x !== i))}>Remove job</Button></div>
          </div>
        ))}
      </section>

      <section className="grid gap-4">
        <SectionHead title="Projects" addLabel="Add project" onAdd={() => setProjects([...projects, { name: '', location: '', period: '', points: '' }])} />
        {projects.map((p, i) => (
          <div key={i} className="grid gap-3 border p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input aria-label="Project / client" placeholder="PT ESB Indonesia" value={p.name} onChange={(e) => setProjects(patch(projects, i, { name: e.target.value }))} />
              <Input aria-label="Location" placeholder="Remote" value={p.location} onChange={(e) => setProjects(patch(projects, i, { location: e.target.value }))} />
              <Input aria-label="Period" placeholder="Jun 2025 – Jul 2025" value={p.period} onChange={(e) => setProjects(patch(projects, i, { period: e.target.value }))} />
            </div>
            <textarea aria-label="Highlights" rows={4} className={areaClass} placeholder="One highlight per line" value={p.points} onChange={(e) => setProjects(patch(projects, i, { points: e.target.value }))} />
            <div><Button type="button" variant="ghost" size="sm" onClick={() => setProjects(projects.filter((_, x) => x !== i))}>Remove project</Button></div>
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

      <section className="grid gap-3">
        <SectionHead title="Skills" addLabel="Add skill group" onAdd={() => setGroups([...groups, { category: '', items: '' }])} />
        <p className="text-xs text-muted-foreground">Parent skill, then its sub skills separated by commas. Each group is one line on the CV.</p>
        {groups.map((g, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
            <Input aria-label="Parent skill" placeholder="Backend Development" value={g.category} onChange={(e) => setGroups(patch(groups, i, { category: e.target.value }))} />
            <Input aria-label="Sub skills" placeholder="Go (Golang), Microservices, gRPC" value={g.items} onChange={(e) => setGroups(patch(groups, i, { items: e.target.value }))} />
            <Button type="button" variant="ghost" size="sm" onClick={() => setGroups(groups.filter((_, x) => x !== i))}>Remove</Button>
          </div>
        ))}
      </section>

      <div><SubmitButton>Save resume</SubmitButton></div>
    </form>
  )
}
