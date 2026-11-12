import { Fragment, type ReactNode } from 'react'

// Minimal, XSS-safe Markdown for model output: it builds React elements and
// never injects HTML. Supports paragraphs, ### headings, - / 1. lists,
// **bold**, *italic* / _italic_, `code` and [links](url) with http(s), / or # targets.

const SAFE_HREF = /^(https?:\/\/|\/(?!\/)|#|mailto:)/i

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = []
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))|(\*[^*\s][^*]*\*)|(_[^_\s][^_]*_)/g
  let last = 0
  let m: RegExpExecArray | null
  let i = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    const k = `${key}-${i++}`
    if (m[1]) out.push(<code key={k}>{tok.slice(1, -1)}</code>)
    else if (m[2]) out.push(<strong key={k}>{inline(tok.slice(2, -2), k)}</strong>)
    else if (m[3]) {
      const [, label, href] = tok.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/) ?? []
      if (href && SAFE_HREF.test(href)) {
        const external = /^https?:/i.test(href) && !href.startsWith(window.location.origin)
        out.push(
          <a key={k} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {label}
          </a>,
        )
      } else out.push(label ?? tok)
    } else out.push(<em key={k}>{tok.slice(1, -1)}</em>)
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

type Block = { type: 'p' | 'h' | 'ul' | 'ol'; lines: string[] }

export function Markdown({ text }: { text: string }) {
  const blocks: Block[] = []
  for (const raw of text.replace(/\r\n/g, '\n').split('\n')) {
    const line = raw.replace(/\s+$/, '')
    const ul = line.match(/^\s*[-*•]\s+(.*)$/)
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/)
    const h = line.match(/^#{1,4}\s+(.*)$/)
    const prev = blocks[blocks.length - 1]
    if (!line.trim()) {
      blocks.push({ type: 'p', lines: [] })
    } else if (h) {
      blocks.push({ type: 'h', lines: [h[1]] })
    } else if (ul) {
      const nested = /^\s{2,}/.test(line)
      if (prev?.type === 'ul') prev.lines.push((nested ? '\u0000' : '') + ul[1])
      else blocks.push({ type: 'ul', lines: [ul[1]] })
    } else if (ol) {
      if (prev?.type === 'ol') prev.lines.push(ol[1])
      else blocks.push({ type: 'ol', lines: [ol[1]] })
    } else if ((prev?.type === 'ul' || prev?.type === 'ol') && /^\s{2,}/.test(raw)) {
      // continuation line of a list item
      prev.lines[prev.lines.length - 1] += ' ' + line.trim()
    } else if (prev?.type === 'p' && prev.lines.length) {
      prev.lines.push(line)
    } else {
      blocks.push({ type: 'p', lines: [line] })
    }
  }

  return (
    <div className="md">
      {blocks
        .filter((b) => b.lines.length)
        .map((b, i) => {
          const k = `b${i}`
          if (b.type === 'h') return <p key={k} className="md__h">{inline(b.lines[0], k)}</p>
          if (b.type === 'ul')
            return (
              <ul key={k}>
                {b.lines.map((l, j) => (
                  <li key={j} className={l.startsWith('\u0000') ? 'md__nested' : undefined}>{inline(l.replace('\u0000', ''), `${k}-${j}`)}</li>
                ))}
              </ul>
            )
          if (b.type === 'ol')
            return (
              <ol key={k}>
                {b.lines.map((l, j) => <li key={j}>{inline(l, `${k}-${j}`)}</li>)}
              </ol>
            )
          return (
            <p key={k}>
              {b.lines.map((l, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {inline(l, `${k}-${j}`)}
                </Fragment>
              ))}
            </p>
          )
        })}
    </div>
  )
}
