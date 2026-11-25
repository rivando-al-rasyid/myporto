import { boldParts, type ResumeData } from '@/lib/resume'

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
        <li key={i}>
          {boldParts(p).map((part, x) => (part.bold ? <strong key={x}>{part.text}</strong> : part.text))}
        </li>
      ))}
    </ul>
  )
}

// Left: bold title with the place beside it. Right: date, top-right. Below: italic line (role / degree).
function Row({
  left,
  place,
  right,
  sub,
  italicLeft,
}: {
  left: string
  place?: string
  right?: string
  sub?: string
  italicLeft?: boolean
}) {
  return (
    <div className="break-inside-avoid">
      <div className="flex items-baseline justify-between gap-x-4">
        <h3 className={`text-[13px] ${italicLeft ? 'italic font-semibold' : 'font-bold'}`}>
          {left}
          {place ? <span className="font-normal">{` – ${place}`}</span> : null}
        </h3>
        {right ? <span className="shrink-0 text-xs">{right}</span> : null}
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
        {data.title ? <p className="mt-0.5 text-sm font-semibold">{data.title}</p> : null}
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
            <div key={i}>
              <div className="break-inside-avoid">
                <Row left={job.company} place={job.location} right={job.period} sub={job.role} />
                <Bullets points={job.points} />
              </div>
              {job.projects.map((p, x) => (
                <div key={x} className="mt-2.5 break-inside-avoid">
                  <Row left={`Project ${x + 1}: ${p.name}`} place={p.location} right={p.period} italicLeft />
                  <Bullets points={p.points} />
                  {p.stack?.length ? (
                    <p className="mt-1 text-[13px] leading-snug">
                      <span className="font-bold">Tech stack:</span> {p.stack.join(', ')}
                    </p>
                  ) : null}
                </div>
              ))}
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
