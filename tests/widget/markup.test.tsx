// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render } from 'preact'
import { renderMarkup } from '../../src/widget/markup'

function html(text: string): string {
  const host = document.createElement('div')
  render(<div>{renderMarkup(text)}</div>, host)
  return host.innerHTML
}

describe('renderMarkup (WhatsApp dialect)', () => {
  it('renders *bold*, _italic_, ~strike~ and `code`', () => {
    const out = html('a *b* c _d_ e ~f~ g `h`')
    expect(out).toContain('<strong>b</strong>')
    expect(out).toContain('<em>d</em>')
    expect(out).toContain('<s>f</s>')
    expect(out).toContain('<code>h</code>')
  })

  it('turns "* item" lines into bullets but keeps *bold* intact', () => {
    const out = html('* Aceptamos devoluciones de *30 días*.')
    expect(out).toContain('• ')
    expect(out).toContain('<strong>30 días</strong>')
  })

  it('supports "- item" bullets too', () => {
    expect(html('- uno\n- dos')).toContain('• uno')
  })

  it('links bare URLs without swallowing trailing punctuation', () => {
    const out = html('mira https://chasqui.dev/docs.')
    expect(out).toContain('<a href="https://chasqui.dev/docs" target="_blank" rel="noopener noreferrer">')
    expect(out).toContain('</a>.')
  })

  it('never injects HTML from the message text', () => {
    const out = html('<img src=x onerror=alert(1)> *bold*')
    expect(out).not.toContain('<img')
    expect(out).toContain('&lt;img')
    expect(out).toContain('<strong>bold</strong>')
  })

  it('preserves blank lines between paragraphs', () => {
    const out = html('hola\n\nadiós')
    expect(out).toContain('hola\n\nadiós')
  })
})
