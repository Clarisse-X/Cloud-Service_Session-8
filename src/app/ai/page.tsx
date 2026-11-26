'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'

type Hasil = { status: number; requestId: string | null; ms: number; answer?: string; model?: string; error?: string }

/** Halaman uji /api/ai: browser hanya mengirim prompt; token dan alamat provider tetap di server. */
export default function TanyaAI() {
  const [prompt, setPrompt] = useState('Jelaskan Docker dalam 2 kalimat.')
  const [busy, setBusy] = useState(false)
  const [riwayat, setRiwayat] = useState<(Hasil & { prompt: string })[]>([])

  async function kirim(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    const mulai = performance.now()
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const body = await response.json().catch(() => ({ error: 'Respons bukan JSON' }))
      setRiwayat((lama) => [{ prompt, status: response.status, requestId: response.headers.get('x-request-id'),
        ms: Math.round(performance.now() - mulai), ...body }, ...lama].slice(0, 5))
    } catch (error) {
      setRiwayat((lama) => [{ prompt, status: 0, requestId: null,
        ms: Math.round(performance.now() - mulai), error: String(error) }, ...lama].slice(0, 5))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="ai-demo">
      <p className="muted"><Link href="/">← Cloud Notes</Link></p>
      <h1>Tanya AI</h1>
      <p className="muted">Browser → <code>/api/ai</code> (Route Handler server) → model OpenAI-compatible (mis. Ollama lokal).
        Token tidak pernah sampai ke browser.</p>
      <section aria-busy={busy}>
        <form onSubmit={kirim}>
          <div className="ai-prompt">
            <label htmlFor="ai-prompt">Prompt</label>
            <textarea id="ai-prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={2000} />
          </div>
          <div className="row">
            <button disabled={busy || !prompt.trim()}>{busy ? 'Menunggu model...' : 'Kirim'}</button>
            <span className="muted">Batas prompt 2.000 karakter; batas waktu diatur AI_TIMEOUT_MS di server.</span>
          </div>
        </form>
      </section>
      <div aria-live="polite">
        {riwayat.map((h, i) => (
          <section key={h.requestId ?? i}>
            <div className="row">
              <span className="badge">{h.status ? `HTTP ${h.status}` : 'Gangguan koneksi'}</span>
              <span className="badge">{h.ms} ms</span>
              {h.model && <span className="badge">{h.model}</span>}
            </div>
            <p className="muted"><b>Prompt:</b> {h.prompt}</p>
            {h.answer ? <p className="ai-answer">{h.answer}</p> : <p className="error">{h.error}</p>}
            <p className="muted ai-request-id">X-Request-ID: {h.requestId ?? '-'}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
