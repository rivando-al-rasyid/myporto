// Single source of truth for the public resume page and the cover letter generator.
// Replace the placeholder values below with your own details.

export interface ResumeData {
  name: string
  title: string
  email: string
  phone?: string
  location: string
  website?: string
  links: { label: string; href: string }[]
  summary: string
  skills: string[]
  experience: {
    role: string
    company: string
    period: string
    location?: string
    points: string[]
  }[]
  education: { school: string; degree: string; period: string }[]
}

export const defaultResume: ResumeData = {
  name: 'Rivando Al Rasyid',
  title: 'Full-Stack Web Developer',
  email: 'hello@example.com',
  phone: '+62 800 0000 0000',
  location: 'West Java, Indonesia',
  website: 'example.com',
  links: [
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com' },
  ],
  summary:
    'Full-stack developer who builds fast, maintainable web products with Next.js, TypeScript and Supabase, and cares about the details between design and data.',
  skills: [
    'TypeScript',
    'Next.js',
    'React',
    'Node.js',
    'Supabase',
    'PostgreSQL',
    'Tailwind CSS',
    'REST APIs',
    'Git',
  ],
  experience: [
    {
      role: 'Full-Stack Developer',
      company: 'Company Name',
      period: '2023 – Present',
      location: 'Remote',
      points: [
        'Built and shipped customer-facing features with Next.js and Supabase.',
        'Cut page load times by moving data fetching to cached server components.',
        'Designed database schemas and Row Level Security policies for multi-role apps.',
      ],
    },
    {
      role: 'Junior Web Developer',
      company: 'Previous Company',
      period: '2021 – 2023',
      location: 'Jakarta, Indonesia',
      points: [
        'Developed responsive interfaces in React and Tailwind CSS.',
        'Integrated third-party REST APIs and wrote reusable component libraries.',
      ],
    },
  ],
  education: [
    {
      school: 'University Name',
      degree: 'B.Sc. in Computer Science',
      period: '2017 – 2021',
    },
  ],
}

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)
const strList = (v: unknown) =>
  Array.isArray(v) ? v.filter((i): i is string => typeof i === 'string' && i.trim().length > 0) : []

// Accepts whatever is stored in Supabase and returns a complete, safe ResumeData.
export function normalizeResume(input: unknown): ResumeData {
  if (!input || typeof input !== 'object') return defaultResume
  const r = input as Record<string, unknown>
  const d = defaultResume

  return {
    name: str(r.name, d.name),
    title: str(r.title, d.title),
    email: str(r.email, d.email),
    phone: str(r.phone) || undefined,
    location: str(r.location, d.location),
    website: str(r.website) || undefined,
    summary: str(r.summary, d.summary),
    skills: strList(r.skills),
    links: Array.isArray(r.links)
      ? r.links
          .map((l) => ({ label: str((l as any)?.label), href: str((l as any)?.href) }))
          .filter((l) => l.label && l.href)
      : [],
    experience: Array.isArray(r.experience)
      ? r.experience.map((e) => ({
          role: str((e as any)?.role),
          company: str((e as any)?.company),
          period: str((e as any)?.period),
          location: str((e as any)?.location) || undefined,
          points: strList((e as any)?.points),
        }))
      : [],
    education: Array.isArray(r.education)
      ? r.education.map((e) => ({
          school: str((e as any)?.school),
          degree: str((e as any)?.degree),
          period: str((e as any)?.period),
        }))
      : [],
  }
}
