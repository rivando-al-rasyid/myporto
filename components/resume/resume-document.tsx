import type { ResumeData } from '@/lib/resume'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="border-b border-neutral-400 pb-0.5 text-xs font-bold uppercase tracking-[0.15em]">{title}</h2>
      <div className="mt-2.5 flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Bullets({ points }: { points: string[] }) {
  if (!points.length) return null
  return (
    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-[13px] leading-snug">
      {points.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  )
}

function Row({ left, right, sub }: { left: string; right?: string; sub?: string }) {
  return (
    <div className="break-inside-avoid">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <h3 className="text-[13px] font-bold">{left}</h3>
        {right ? <span className="text-xs">{right}</span> : null}
      </div>
      {sub ? <p className="text-[13px] italic">{sub}</p> : null}
    </div>
  )
}

export function ResumeDocument({ data }: { data: ResumeData }) {
  const contact = [
    data.phone ? `Mobile: ${data.phone}` : '',
    data.email ? `Email: ${data.email}` : '',
    data.location ?? '',
  ].filter(Boolean)
  const links = [...data.links, ...(data.website ? [{ label: data.website, href: data.website }] : [])]

  return (
    <article className="mx-auto w-full max-w-[210mm] bg-white p-10 text-neutral-900 shadow-sm ring-1 ring-black/5 print:max-w-none print:p-0 print:shadow-none print:ring-0">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">{data.name}</h1>
        <p className="mt-0.5 text-sm">{data.title}</p>
        <p className="mt-1.5 text-xs">{contact.join('  |  ')}</p>
        {links.length > 0 && (
          <p className="mt-0.5 text-xs">
            {links.map((l, i) => (
              <span key={l.href}>
                {i > 0 ? '  |  ' : ''}
                <a href={l.href.startsWith('http') ? l.href : `https://${l.href}`} className="underline underline-offset-2">
                  {l.label}
                </a>
              </span>
            ))}
          </p>
        )}
      </header>

      {data.summary && (
        <Section title="Summary">
          <p className="text-[13px] leading-snug">{data.summary}</p>
        </Section>
      )}

      {data.experience.length > 0 && (
        <Section title="Experience">
          {data.experience.map((job, i) => (
            <div key={i} className="break-inside-avoid">
              <Row left={job.company} right={job.location} sub={[job.role, job.period].filter(Boolean).join(' | ')} />
              <Bullets points={job.points} />
            </div>
          ))}
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="Projects">
          {data.projects.map((p, i) => (
            <div key={i} className="break-inside-avoid">
              <Row left={p.name} right={p.location} sub={p.period} />
              <Bullets points={p.points} />
            </div>
          ))}
        </Section>
      )}

      {data.education.length > 0 && (
        <Section title="Education">
          {data.education.map((e, i) => (
            <Row key={i} left={e.school} right={e.period} sub={e.degree} />
          ))}
        </Section>
      )}

      {data.skillGroups.length > 0 && (
        <Section title="Skills">
          <ul className="list-disc space-y-0.5 pl-5 text-[13px] leading-snug">
            {data.skillGroups.map((g) => (
              <li key={g.category}>
                <span className="font-bold">{g.category}:</span> {g.items.join(', ')}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  )
}
