import type { ComponentChildren } from 'preact'

/**
 * WhatsApp-flavored markup → Preact nodes. The agent's persona prompts ask
 * for "WhatsApp formatting" (the stack's home channel), so the widget renders
 * the same dialect: *bold*, _italic_, ~strike~, `code`, "* "/"- " bullets,
 * bare URLs. XSS-safe by construction — everything is emitted as text nodes
 * or our own elements, never raw HTML.
 */

const INLINE = /(\*[^*\n]+\*)|(_[^_\n]+_)|(~[^~\n]+~)|(`[^`\n]+`)|(https?:\/\/[^\s]+)/g

/** Trailing punctuation that reads as prose, not as part of a URL. */
const URL_TRAIL = /[.,;:!?)\]}'"]+$/

function renderInline(text: string): ComponentChildren[] {
  const out: ComponentChildren[] = []
  let last = 0
  for (let m = INLINE.exec(text); m; m = INLINE.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index))
    const tok = m[0]
    if (m[1]) out.push(<strong>{tok.slice(1, -1)}</strong>)
    else if (m[2]) out.push(<em>{tok.slice(1, -1)}</em>)
    else if (m[3]) out.push(<s>{tok.slice(1, -1)}</s>)
    else if (m[4]) out.push(<code>{tok.slice(1, -1)}</code>)
    else {
      const trail = URL_TRAIL.exec(tok)
      const url = trail ? tok.slice(0, -trail[0].length) : tok
      out.push(
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>,
      )
      if (trail) out.push(trail[0])
    }
    last = m.index + tok.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

/** A bullet is "* item" / "- item" (delimiter + space); *bold* has no space. */
const BULLET = /^(\s*)[*-]\s+(.*)$/

export function renderMarkup(text: string): ComponentChildren[] {
  const out: ComponentChildren[] = []
  text.split('\n').forEach((line, i) => {
    if (i > 0) out.push('\n')
    const bullet = BULLET.exec(line)
    if (bullet) {
      out.push(bullet[1], '• ', ...renderInline(bullet[2]))
    } else {
      out.push(...renderInline(line))
    }
  })
  return out
}
