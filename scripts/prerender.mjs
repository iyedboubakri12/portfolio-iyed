// Runs after `vite build`. For every article in content/blog it writes
// dist/blog/<slug>/index.html with the right <title>, description, Open Graph
// tags, JSON-LD and the article HTML inside #root, so search engines and
// LinkedIn link previews see real content. React replaces #root on load.
// It also writes dist/blog/index.html, dist/rss.xml and dist/sitemap.xml.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'

const SITE = 'https://portfolio-iyed-iota.vercel.app'
const AUTHOR = 'Iyed Boubakri'
const root = fileURLToPath(new URL('..', import.meta.url))
const dist = join(root, 'dist')
const contentDir = join(root, 'content', 'blog')

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function parse(file) {
  const raw = readFileSync(join(contentDir, file), 'utf8').replace(/\r\n/g, '\n')
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!m) throw new Error(`Missing front matter in ${file}`)
  const meta = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1')
  }
  for (const k of ['title', 'description', 'date']) if (!meta[k]) throw new Error(`${file}: missing "${k}"`)
  return {
    slug: file.replace(/\.md$/, ''),
    title: meta.title,
    description: meta.description,
    date: meta.date,
    draft: meta.draft === 'true',
    tags: (meta.tags ?? '').replace(/^\[|\]$/g, '').split(',').map((t) => t.trim()).filter(Boolean),
    html: marked.parse(m[2]),
  }
}

const posts = readdirSync(contentDir)
  .filter((f) => f.endsWith('.md'))
  .map(parse)
  .filter((p) => !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))

const shell = readFileSync(join(dist, 'index.html'), 'utf8')

function page({ url, title, description, type, jsonLd, body }) {
  let html = shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${url}`)
    .replace(/(<meta property="og:type" content=")[^"]*/, `$1${type}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  if (jsonLd) html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n</head>`)
  html = html.replace('</head>', `<link rel="alternate" type="application/rss+xml" title="${AUTHOR} – Blog" href="${SITE}/rss.xml" />\n</head>`)
  return html
}

function write(path, content) {
  mkdirSync(join(dist, path, '..'), { recursive: true })
  writeFileSync(join(dist, path), content)
}

for (const p of posts) {
  const url = `${SITE}/blog/${p.slug}`
  write(`blog/${p.slug}/index.html`, page({
    url,
    title: `${p.title} – ${AUTHOR}`,
    description: p.description,
    type: 'article',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.date,
      keywords: p.tags.join(', '),
      url,
      author: { '@type': 'Person', name: AUTHOR, url: SITE },
    },
    body: `<main><article class="container"><p><a href="/blog">All articles</a></p><h1>${esc(p.title)}</h1><p>By ${AUTHOR} · ${p.date}</p>${p.html}</article></main>`,
  }))
}

write('blog/index.html', page({
  url: `${SITE}/blog`,
  title: `Blog – DevOps & DevSecOps articles by ${AUTHOR}`,
  description: 'Practical articles on secure CI/CD, Kubernetes, Policy-as-Code, supply chain security and runtime detection.',
  type: 'website',
  body: `<main class="container"><h1>DevOps &amp; DevSecOps notes from the field</h1><ul>${posts
    .map((p) => `<li><a href="/blog/${p.slug}">${esc(p.title)}</a> – ${esc(p.description)}</li>`)
    .join('')}</ul></main>`,
}))

const rfc822 = (d) => new Date(d + 'T08:00:00Z').toUTCString()
write('rss.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${AUTHOR} – DevOps &amp; DevSecOps blog</title>
<link>${SITE}/blog</link>
<atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
<description>Practical articles on secure CI/CD, Kubernetes and DevSecOps.</description>
<language>en</language>
${posts.map((p) => `<item><title>${esc(p.title)}</title><link>${SITE}/blog/${p.slug}</link><guid>${SITE}/blog/${p.slug}</guid><pubDate>${rfc822(p.date)}</pubDate><description>${esc(p.description)}</description></item>`).join('\n')}
</channel>
</rss>
`)

const latest = posts[0]?.date ?? new Date().toISOString().slice(0, 10)
const urls = [
  ['/', latest, '1.0'],
  ['/projects/devsecops-pfe', '2026-11-02', '0.9'],
  ['/blog', latest, '0.8'],
  ...posts.map((p) => [`/blog/${p.slug}`, p.date, '0.7']),
]
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([u, d, pr]) => `  <url><loc>${SITE}${u === '/' ? '/' : u}</loc><lastmod>${d}</lastmod><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`)

console.log(`prerender: ${posts.length} articles, blog index, rss.xml, sitemap.xml`)
