import { Document, Font, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import { boldParts, type ResumeData } from '@/lib/resume'

// Keep words whole instead of breaking them with hyphens.
Font.registerHyphenationCallback((word) => [word])

const s = StyleSheet.create({
  page: { paddingVertical: 36, paddingHorizontal: 40, fontFamily: 'Helvetica', fontSize: 9.5, lineHeight: 1.35, color: '#171717' },
  name: { fontFamily: 'Helvetica-Bold', fontSize: 20, lineHeight: 1.2, textAlign: 'center' },
  title: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, textAlign: 'center', marginTop: 4 },
  contact: { fontSize: 8.5, textAlign: 'center', marginTop: 5 },
  link: { color: '#171717', textDecoration: 'underline' },
  section: { marginTop: 14 },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    borderBottomWidth: 0.75,
    borderBottomColor: '#a3a3a3',
    paddingBottom: 2,
    marginBottom: 7,
  },
  block: { marginBottom: 8 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  rowLoc: { fontFamily: 'Helvetica' },
  rowLeft: { fontFamily: 'Helvetica-Bold', fontSize: 9.5, flexShrink: 1 },
  rowRight: { fontSize: 8.5, marginLeft: 12, textAlign: 'right' },
  sub: { fontFamily: 'Helvetica-Oblique' },
  bullet: { flexDirection: 'row', marginTop: 2, paddingLeft: 10 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1 },
  bold: { fontFamily: 'Helvetica-Bold' },
})

const href = (h: string) => (h.startsWith('http') ? h : `https://${h}`)

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle} minPresenceAhead={70}>
        {title}
      </Text>
      {children}
    </View>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.bullet} wrap={false}>
      <Text style={s.bulletDot}>•</Text>
      <Text style={s.bulletText}>{children}</Text>
    </View>
  )
}

// A highlight with **bold** keywords.
function Point({ text }: { text: string }) {
  return (
    <Bullet>
      {boldParts(text).map((part, i) => (
        <Text key={i} style={part.bold ? s.bold : undefined}>
          {part.text}
        </Text>
      ))}
    </Bullet>
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
    <View minPresenceAhead={40}>
      <View style={s.rowHead}>
        <Text style={italicLeft ? [s.rowLeft, s.sub] : s.rowLeft}>
          {left}
          {place ? <Text style={[s.rowLoc, italicLeft ? s.sub : {}]}>{` – ${place}`}</Text> : null}
        </Text>
        {right ? <Text style={s.rowRight}>{right}</Text> : null}
      </View>
      {sub ? <Text style={s.sub}>{sub}</Text> : null}
    </View>
  )
}

export function ResumePdf({ data }: { data: ResumeData }) {
  const contact = [
    data.phone ? `Mobile: ${data.phone}` : '',
    data.email ? `Email: ${data.email}` : '',
    data.location ?? '',
  ].filter(Boolean)
  const links = [...data.links, ...(data.website ? [{ label: data.website, href: data.website }] : [])]

  return (
    <Document title={`${data.name} - Resume`} author={data.name}>
      <Page size="A4" style={s.page}>
        <View>
          <Text style={s.name}>{data.name}</Text>
          {data.title ? <Text style={s.title}>{data.title}</Text> : null}
          {contact.length > 0 && <Text style={s.contact}>{contact.join('  |  ')}</Text>}
          {links.length > 0 && (
            <Text style={[s.contact, { marginTop: 2 }]}>
              {links.map((l, i) => (
                <Text key={`${l.href}-${i}`}>
                  {i > 0 ? '  |  ' : ''}
                  <Link src={href(l.href)} style={s.link}>
                    {l.label}
                  </Link>
                </Text>
              ))}
            </Text>
          )}
        </View>

        {data.summary ? (
          <Section title="Summary">
            <Text>{data.summary}</Text>
          </Section>
        ) : null}

        {data.experience.length > 0 && (
          <Section title="Experience">
            {data.experience.map((job, i) => (
              <View key={i} style={s.block}>
                <Row left={job.company} place={job.location} right={job.period} sub={job.role} />
                {job.points.map((p, x) => (
                  <Point key={x} text={p} />
                ))}
                {job.projects.map((p, x) => (
                  <View key={x} style={{ marginTop: 7 }}>
                    <Row left={`Project ${x + 1}: ${p.name}`} place={p.location} right={p.period} italicLeft />
                    {p.points.map((pt, y) => (
                      <Point key={y} text={pt} />
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </Section>
        )}

        {data.education.length > 0 && (
          <Section title="Education">
            {data.education.map((e, i) => (
              <View key={i} style={s.block} wrap={false}>
                <Row left={e.school} right={e.period} sub={e.degree} />
              </View>
            ))}
          </Section>
        )}

        {data.skillGroups.length > 0 && (
          <Section title="Skills">
            {data.skillGroups.map((g, i) => (
              <Bullet key={i}>
                <Text style={s.bold}>{g.category}:</Text> {g.items.join(', ')}
              </Bullet>
            ))}
          </Section>
        )}
      </Page>
    </Document>
  )
}
