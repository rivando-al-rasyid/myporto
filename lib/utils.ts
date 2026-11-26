export { cn } from "cn"

export function truncateText(value: string | null | undefined, max = 140) {
  if (!value) return ""
  return value.length > max ? `${value.slice(0, max).trim()}…` : value
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

export function stripMarkdown(value: string | null | undefined) {
  if (!value) return ""

  return normalizeWhitespace(
    value
      .replace(/^::(youtube|audio)\s+.*$/gim, "")
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/^>\s?/gm, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/[*_~|]/g, "")
      .replace(/<[^>]+>/g, "")
  )
}

export function generateSeoTitle(title: string, maxLength = 60) {
  return truncateText(normalizeWhitespace(title || "Untitled"), maxLength)
}

export function generateSeoDescription(
  input: { description?: string | null; content?: string | null },
  maxLength = 155
) {
  const source =
    stripMarkdown(input.description) ||
    stripMarkdown(input.content) ||
    "Read this portfolio content."
  return truncateText(source, maxLength)
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured.replace(/\/$/, "")
  if (typeof window !== "undefined") return window.location.origin
  return "http://localhost:3000"
}

export function getCanonicalUrl(path: string) {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`
}
