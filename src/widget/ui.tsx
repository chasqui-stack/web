import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { createApi, type ChatMessage, type WidgetApi } from './api'
import { getVisitorId } from './visitor'

function fileToDataUri(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = () => reject(new Error('read failed'))
    r.readAsDataURL(file)
  })
}

export interface AppProps {
  gateway: string
  /** Injectable for tests; defaults to a real client over `gateway`. */
  api?: WidgetApi
}

export function App({ gateway, api: injected }: AppProps) {
  const api = useMemo(() => injected ?? createApi(gateway), [gateway, injected])
  const visitor = useMemo(() => getVisitorId(), [])

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [recording, setRecording] = useState(false)
  const [status, setStatus] = useState('')
  const logRef = useRef<HTMLDivElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)

  // Rehydrate history + open the live stream on mount (ADR-011 §3).
  useEffect(() => {
    let closed = false
    api.history(visitor).then((h) => {
      if (!closed) setMessages(h)
    })
    const close = api.openStream(visitor, (m) => setMessages((prev) => [...prev, m]))
    return () => {
      closed = true
      close()
    }
  }, [api, visitor])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [messages, open])

  async function sendText() {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages((m) => [...m, { role: 'in', type: 'text', text }])
    const replies = await api.send(visitor, { type: 'text', text })
    if (replies.length) setMessages((m) => [...m, ...replies])
  }

  async function sendImage(file: File) {
    const dataUri = await fileToDataUri(file)
    setMessages((m) => [...m, { role: 'in', type: 'image', text: '[image]' }])
    const replies = await api.send(visitor, { type: 'image', media: { mime: file.type, dataUri } })
    if (replies.length) setMessages((m) => [...m, ...replies])
  }

  async function toggleRecord() {
    if (recording) {
      recorderRef.current?.stop()
      return
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('Voice not supported on this browser')
      return
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    const chunks: Blob[] = []
    mr.ondataavailable = (e) => chunks.push(e.data)
    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' })
      setMessages((m) => [...m, { role: 'in', type: 'audio', text: '[voice note]' }])
      const dataUri = await fileToDataUri(blob)
      const replies = await api.send(visitor, { type: 'audio', media: { mime: blob.type, dataUri } })
      if (replies.length) setMessages((m) => [...m, ...replies])
      setRecording(false)
    }
    recorderRef.current = mr
    mr.start()
    setRecording(true)
    setStatus('')
  }

  if (!open) {
    return (
      <div class="root">
        <button class="bubble" aria-label="Open chat" onClick={() => setOpen(true)}>
          💬
        </button>
      </div>
    )
  }

  return (
    <div class="root">
      <div class="panel">
        <div class="header">
          <span>Chasqui</span>
          <button aria-label="Close chat" onClick={() => setOpen(false)}>
            ×
          </button>
        </div>
        <div class="log" ref={logRef}>
          {messages.map((m, i) => (
            <div key={i} class={`msg ${m.role}${m.type !== 'text' ? ' media' : ''}`}>
              {m.text ?? (m.hasMedia ? '[media]' : '')}
            </div>
          ))}
        </div>
        {status ? <div class="status">{status}</div> : null}
        <div class="composer">
          <label class="icon" aria-label="Send image" style="cursor:pointer">
            🖼
            <input
              type="file"
              accept="image/*"
              style="display:none"
              onChange={(e) => {
                const f = (e.currentTarget as HTMLInputElement).files?.[0]
                if (f) void sendImage(f)
              }}
            />
          </label>
          <button
            class={`icon${recording ? ' rec' : ''}`}
            aria-label={recording ? 'Stop recording' : 'Record voice'}
            onClick={() => void toggleRecord()}
          >
            {recording ? '⏹' : '🎤'}
          </button>
          <input
            type="text"
            placeholder="Type a message…"
            value={input}
            onInput={(e) => setInput((e.currentTarget as HTMLInputElement).value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void sendText()
            }}
          />
          <button onClick={() => void sendText()}>Send</button>
        </div>
      </div>
    </div>
  )
}
