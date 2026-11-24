import type { ResumeData } from '@/lib/resume'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="border-b border-neutral-300 pb-1 text-xs font-bold uppercase tracking-[0.2em] text-neutral-600">
        {title}
      </h2>
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </section>
  )
}

export function ResumeDocument({ data }: { data: ResumeData }) {
  const contact = [data.email, data.phone, data.location, data.website].filter(Boolean)

  return (
    <article className="mx-auto w-full max-w-[210mm] bg-white p-8 text-neutral-900 shadow-sm ring-1 ring-black/5 print:max-w-none print:p-0 print:shadow-none print:ring-0">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
        <p className="mt-1 text-base text-neutral-600">{data.title}</p>
        <p className="mt-3 text-xs text-neutral-600">{contact.join('  ·  ')}</p>
        <p className="mt-1 text-xs text-neutral-600">
          {data.links.map((l, i) => (
            <span key={l.href}>
              {i > 0 ? '  ·  ' : ''}
              <a href={l.href} className="underline underline-offset-2">
                {l.label}
              </a>
            </span>
          ))}
        </p>
      </header>

      <Section title="Summary">
        <p className="text-sm leading-relaxed">{data.summary}</p>
      </Section>

      <Section title="Skills">
        <p className="text-sm leading-relaxed">{data.skills.join('  ·  ')}</p>
      </Section>

      <Section title="Experience">
        {data.experience.map((job) => (
          <div key={`${job.company}-${job.period}`} className="break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="text-sm font-semibold">
                {job.role} — {job.company}
              </h3>
              <span className="text-xs text-neutral-600">
                {[job.period, job.location].filter(Boolean).join(' · ')}
              </span>
            </div>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {job.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="Education">
        {data.education.map((e) => (
          <div key={e.school} className="flex flex-wrap items-baseline justify-between gap-x-4 break-inside-avoid">
            <h3 className="text-sm font-semibold">
              {e.degree} — {e.school}
            </h3>
            <span className="text-xs text-neutral-600">{e.period}</span>
          </div>
        ))}
      </Section>
    </article>
  )
}
