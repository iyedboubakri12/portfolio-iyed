import { marked } from 'marked'

export type Post = {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  minutes: number
  html: string
}

export const BLOG_PATH = '/blog'

// Articles live in /content/blog/*.md. The same files are read by
// scripts/prerender.mjs to generate static HTML, RSS and the sitemap.
const files = import.meta.glob('/content/blog/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

function parse(path: string, raw: string): Post | null {
  const m = raw.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) return null
  const meta: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')
  }
  if (meta.draft === 'true') return null
  const body = m[2]
  const words = body.split(/\s+/).filter(Boolean).length
  return {
    slug: path.split('/').pop()!.replace(/\.md$/, ''),
    title: meta.title,
    description: meta.description,
    date: meta.date,
    tags: (meta.tags ?? '').replace(/^\[|\]$/g, '').split(',').map((t) => t.trim()).filter(Boolean),
    minutes: Math.max(1, Math.round(words / 220)),
    html: marked.parse(body, { async: false }),
  }
}

export const POSTS: Post[] = Object.entries(files)
  .map(([path, raw]) => parse(path, raw))
  .filter((p): p is Post => p !== null)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

export const postPath = (p: Post) => `${BLOG_PATH}/${p.slug}`

export function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
}
