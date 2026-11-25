import { allSkills, type ResumeData } from '@/lib/resume'

export type LetterTone = 'professional' | 'friendly' | 'concise'

export interface CoverLetterInput {
  company: string
  role: string
  hiringManager: string
  jobDescription: string
  tone: LetterTone
  projects: { title: string; summary: string | null }[]
  extra: string
  today: string
}

function list(items: string[]) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

// "Go (Golang)" should match a job description that says either "go" or "golang".
function skillTerms(skill: string) {
  const alias = skill.match(/\(([^)]+)\)/)?.[1]
  return [skill.replace(/\s*\([^)]*\)/, ''), alias, skill]
    .filter((t): t is string => Boolean(t))
    .map((t) => t.toLowerCase())
}

export function matchSkills(resume: ResumeData, jobDescription: string) {
  const jd = jobDescription.toLowerCase()
  const skills = allSkills(resume)
  const matched = jd ? skills.filter((s) => skillTerms(s).some((t) => jd.includes(t))) : []
  return (matched.length ? matched : skills).slice(0, 5)
}

export function generateCoverLetter(resume: ResumeData, input: CoverLetterInput) {
  const company = input.company.trim() || '[Company]'
  const role = input.role.trim() || '[Role]'
  const manager = input.hiringManager.trim()
  const skills = list(matchSkills(resume, input.jobDescription))
  const latest = resume.experience.find((e) => e.points.length > 0)

  const greeting = manager ? `Dear ${manager},` : `Dear ${company} Hiring Team,`
  const signOff = input.tone === 'friendly' ? 'Warm regards,' : 'Sincerely,'

  const intro = {
    professional: `I am writing to apply for the ${role} position at ${company}. As a ${resume.title} with hands-on experience in ${skills}, I am confident I can contribute to your team from day one.`,
    friendly: `I was excited to see the ${role} opening at ${company}, and I would love to be considered. I'm a ${resume.title} who enjoys working with ${skills}, and your team looks like a great place to keep building.`,
    concise: `I am applying for the ${role} role at ${company}. I am a ${resume.title} experienced in ${skills}.`,
  }[input.tone]

  const experience = latest
    ? `In my role as ${latest.role} at ${latest.company}, I ${latest.points[0].charAt(0).toLowerCase()}${latest.points[0].slice(1).replace(/\.$/, '')}.`
    : resume.summary

  const projectLine = input.projects.length
    ? `Recent work I'm proud of includes ${list(
        input.projects.map((p) => (p.summary ? `${p.title} (${p.summary.replace(/\.$/, '')})` : p.title))
      )}. You can see more at ${resume.website || 'my portfolio'}.`
    : ''

  const extra = input.extra.trim()

  const closing = {
    professional: `I would welcome the opportunity to discuss how my background fits ${company}'s goals. Thank you for your time and consideration.`,
    friendly: `I'd really enjoy chatting about how I can help ${company}. Thanks so much for reading, and I hope to hear from you soon.`,
    concise: `I would welcome a conversation. Thank you for your consideration.`,
  }[input.tone]

  const body =
    input.tone === 'concise'
      ? [intro, projectLine || experience, extra, closing]
      : [intro, experience, projectLine, extra, closing]

  return [
    input.today,
    greeting,
    ...body.filter(Boolean),
    `${signOff}\n${resume.name}\n${[resume.email, resume.phone].filter(Boolean).join(' · ')}`,
  ].join('\n\n')
}
