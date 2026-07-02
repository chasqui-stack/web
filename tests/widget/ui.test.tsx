import { h, render } from 'preact'
import { act } from 'preact/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../../src/widget/ui'
import type { WidgetApi } from '../../src/widget/api'

function fakeApi(overrides: Partial<WidgetApi> = {}): WidgetApi {
  return {
    history: vi.fn(async () => []),
    send: vi.fn(async () => []),
    openStream: vi.fn(() => () => {}),
    ...overrides,
  }
}

function mount(api: WidgetApi): HTMLElement {
  const root = document.createElement('div')
  document.body.appendChild(root)
  act(() => {
    render(h(App, { gateway: 'http://gw.test', api }), root)
  })
  return root
}

describe('widget App', () => {
  it('mounts a bubble and wires history + live stream on open', () => {
    const api = fakeApi()
    const root = mount(api)
    expect(root.querySelector('.bubble')).toBeTruthy()
    expect(api.history).toHaveBeenCalled()
    expect(api.openStream).toHaveBeenCalled()
  })

  it('opens the panel and renders an agent reply pushed over the stream', () => {
    let emit: ((m: { role: 'out'; type: string; text: string }) => void) | undefined
    const api = fakeApi({
      openStream: vi.fn((_v, on) => {
        emit = on as typeof emit
        return () => {}
      }),
    })
    const root = mount(api)

    act(() => {
      ;(root.querySelector('.bubble') as HTMLButtonElement).click()
    })
    expect(root.querySelector('.composer')).toBeTruthy()

    act(() => {
      emit?.({ role: 'out', type: 'text', text: 'hi from the agent' })
    })
    expect(root.textContent).toContain('hi from the agent')
  })

  it('sends a typed message optimistically and relays it to the api', async () => {
    const api = fakeApi()
    const root = mount(api)
    act(() => {
      ;(root.querySelector('.bubble') as HTMLButtonElement).click()
    })
    const input = root.querySelector('input[type=text]') as HTMLInputElement
    await act(async () => {
      input.value = 'hello'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    await act(async () => {
      ;(root.querySelector('.composer button:last-child') as HTMLButtonElement).click()
    })
    expect(api.send).toHaveBeenCalled()
    expect(root.textContent).toContain('hello')
  })
})
