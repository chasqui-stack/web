import { h, render } from 'preact'
import { App } from './ui'
import { styles } from './styles'

// Capture the embedding <script> at module-eval time (not inside a later
// callback, where document.currentScript is null).
const currentScript = document.currentScript as HTMLScriptElement | null

function mount(): void {
  if (document.getElementById('chasqui-web-widget')) return
  const gateway =
    currentScript?.dataset.gateway ??
    (currentScript ? new URL(currentScript.src).origin : window.location.origin)

  const host = document.createElement('div')
  host.id = 'chasqui-web-widget'
  document.body.appendChild(host)

  // Shadow DOM: total style isolation from the host page (ADR-011 §1/§6).
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = styles
  shadow.appendChild(style)
  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  render(h(App, { gateway }), mountPoint)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount)
} else {
  mount()
}
