// Resume data model, based on the "Template CV - LWA" layout:
// header, summary, experience, projects, education, skills (parent skill → sub skills).

export interface ResumeData {
  name: string
  title: string
  email: string
  phone?: string
  location?: string
  website?: string
  links: { label: string; href: string }[]
  summary: string
  experience: {
    company: string
    location?: string
    role: string
    period: string
    points: string[]
  }[]
  projects: {
    name: string
    location?: string
    period: string
    points: string[]
  }[]
  education: { school: string; degree: string; period: string }[]
  skillGroups: { category: string; items: string[] }[]
}

const pushPoints = [
  'Developed and deployed a push notification service using Golang (Gin) and Firebase Cloud Messaging (FCM), ensuring real-time delivery of promotional content to over 10,000 users.',
  'Integrated Enterprise Service Bus (ESB) APIs to automate notification relay processes, reducing manual intervention by 90%.',
  'Implemented JWT-based authentication and OAuth2 for secure API communication and user verification.',
  'Optimized notification dispatch system for scalability, achieving under 300ms response time on average.',
  'Collaborated with cross-functional teams to align on delivery timelines, contributing to a 100% on-time feature rollout within the project duration.',
]

export const defaultResume: ResumeData = {
  name: 'Rivando Al Rasyid',
  title: 'Fullstack Web Developer',
  email: 'youremail@gmail.com',
  phone: '+628597783xxx',
  location: 'Batam, Indonesia',
  website: '',
  links: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/andisatr/' }],
  summary:
    'Fullstack web developer with nearly 3 years of hands-on experience building scalable web applications with React.js and performant backend APIs with Golang (Gin). Currently at Emados, where I built and deployed a push notification service on Firebase Cloud Messaging (FCM) that delivers real-time promotions to over 10,000 users in under 300ms on average. Strong foundation in JavaScript, Tailwind CSS, RESTful APIs and component-based UI design. Passionate about clean code, performance optimization and solutions that improve user experience and business outcomes.',
  experience: [
    {
      company: 'Emados',
      location: 'Remote from Batam, Indonesia',
      role: 'Fullstack Web Developer',
      period: 'Jan 2024 – Present',
      points: pushPoints,
    },
    {
      company: 'Koda',
      location: 'Jakarta, Indonesia',
      role: 'Fullstack Web Developer',
      period: 'Jun 2025 – Jul 2025',
      points: pushPoints,
    },
    {
      company: 'General Practitioner & Dentist Clinic',
      location: 'Surabaya, Indonesia',
      role: 'Freelance',
      period: 'May 2022 – Dec 2022',
      points: [
        'Led the clinic’s digitalization: registered the BPJS system and a SatuSehat account, selected a third-party vendor for the electronic medical record and entered data into the system.',
      ],
    },
  ],
  projects: [
    {
      name: 'PT ESB Indonesia',
      location: 'Remote',
      period: 'Jun 2025 – Jul 2025',
      points: pushPoints,
    },
  ],
  education: [
    {
      school: 'Diponegoro University',
      degree: 'Bachelor Degree in Naval Architecture',
      period: '2011 – 2015',
    },
  ],
  skillGroups: [
    { category: 'Frontend Development', items: ['React.js', 'JavaScript', 'Tailwind CSS', 'Component-Based UI', 'RESTful API Integration'] },
    { category: 'Backend Development', items: ['Go (Golang)', 'Gin', 'Microservices', 'Event-Driven Architecture', 'gRPC', 'REST APIs', 'GraphQL'] },
    { category: 'Cloud Computing', items: ['AWS', 'Kubernetes', 'Docker', 'Cloud Monitoring', 'Infrastructure as Code'] },
    { category: 'Database Management', items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Elasticsearch', 'Typesense'] },
    { category: 'Messaging Systems', items: ['Apache Kafka', 'Redis', 'Firebase Cloud Messaging (FCM)', 'Event Streaming', 'Data Synchronization'] },
    { category: 'API Development', items: ['OAuth2', 'JWT', 'API Gateway', 'Swagger', 'Postman', 'Secure Authentication'] },
    { category: 'DevOps & CI/CD', items: ['Jenkins', 'GitLab CI/CD', 'Deployment Automation', 'Performance Monitoring'] },
    { category: 'System Design & Architecture', items: ['Distributed Systems', 'High-Availability Architectures', 'Caching Strategies'] },
    { category: 'Testing & Debugging', items: ['Unit Testing', 'Integration Testing', 'Performance Testing'] },
    { category: 'Project & Product Management', items: ['Planning', 'Time Estimation', 'Budget Estimation', 'Communication', 'Load Distribution', 'Deployment'] },
    { category: 'Partnership', items: ['Presentation', 'Community', 'Partnership Development', 'Partnership Strategy'] },
    { category: 'Collaboration & Communication', items: ['Agile Methodologies', 'Cross-Functional Teams', 'Technical Documentation'] },
    { category: 'R&D & Innovation', items: ['Emerging Tech Evaluation', 'System Optimization', 'Proof-of-Concept Development'] },
  ],
}

export function allSkills(resume: ResumeData) {
  return resume.skillGroups.flatMap((g) => g.items)
}

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)
const strList = (v: unknown) =>
  Array.isArray(v) ? v.filter((i): i is string => typeof i === 'string' && i.trim().length > 0) : []
const rows = (v: unknown) => (Array.isArray(v) ? (v as Record<string, unknown>[]) : [])

// Accepts whatever is stored in Supabase and returns a complete, safe ResumeData.
export function normalizeResume(input: unknown): ResumeData {
  if (!input || typeof input !== 'object') return defaultResume
  const r = input as Record<string, unknown>
  const d = defaultResume

  const groups = rows(r.skillGroups)
    .map((g) => ({ category: str(g.category).trim(), items: strList(g.items) }))
    .filter((g) => g.category && g.items.length)
  // Older saves stored a flat `skills` string list.
  const legacy = strList(r.skills)

  return {
    name: str(r.name, d.name),
    title: str(r.title, d.title),
    email: str(r.email, d.email),
    phone: str(r.phone) || undefined,
    location: str(r.location) || undefined,
    website: str(r.website) || undefined,
    summary: str(r.summary, d.summary),
    links: rows(r.links)
      .map((l) => ({ label: str(l.label).trim(), href: str(l.href).trim() }))
      .filter((l) => l.label && l.href),
    experience: rows(r.experience).map((e) => ({
      company: str(e.company),
      location: str(e.location) || undefined,
      role: str(e.role),
      period: str(e.period),
      points: strList(e.points),
    })),
    projects: rows(r.projects).map((p) => ({
      name: str(p.name),
      location: str(p.location) || undefined,
      period: str(p.period),
      points: strList(p.points),
    })),
    education: rows(r.education).map((e) => ({
      school: str(e.school),
      degree: str(e.degree),
      period: str(e.period),
    })),
    skillGroups: groups.length ? groups : legacy.length ? [{ category: 'Skills', items: legacy }] : [],
  }
}
