import { NextResponse } from 'next/server'
import { logEvent } from '@/lib/logger'
import { noteCreated } from '@/lib/note-metrics'

const baseUrl = process.env.LOCAL_API_URL || 'http://127.0.0.1:18006'

async function forward(method: 'GET' | 'POST', body?: string) {
  const started = Date.now()
  const requestId = crypto.randomUUID()
  try {
    const upstream = await fetch(`${baseUrl}/notes`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body,
      cache: 'no-store',
    })
    const payload = await upstream.text()
    if (method === 'POST' && upstream.status === 201) noteCreated()
    logEvent('info', 'notes_proxy', { requestId, method, status: upstream.status, durationMs: Date.now() - started })
    return new NextResponse(payload, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'X-Request-ID': requestId,
      },
    })
  } catch {
    logEvent('error', 'notes_proxy_unavailable', { requestId, method, durationMs: Date.now() - started })
    return NextResponse.json({ error: 'API lokal tidak tersedia. Jalankan Compose Lab 06.' },
      { status: 503, headers: { 'X-Request-ID': requestId } })
  }
}

export async function GET() {
  return forward('GET')
}

function exceedsLength(value: string, limit: number) {
  if (value.length <= limit) return false
  if (value.length > limit * 2) return true

  // Match Lab 06, which counts Unicode code points.
  return Array.from(value).length > limit
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON tidak valid' }, { status: 400 })
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Isi harus berupa objek JSON' }, { status: 400 })
  }

  const fields = body as Record<string, unknown>
  const title = typeof fields.title === 'string' ? fields.title.trim() : ''
  const content = typeof fields.content === 'string' ? fields.content.trim() : ''
  if (!title || !content) {
    return NextResponse.json({ error: 'Judul dan isi wajib diisi' }, { status: 400 })
  }
  if (exceedsLength(title, 120) || exceedsLength(content, 5000)) {
    return NextResponse.json({ error: 'Judul maksimal 120 karakter dan isi maksimal 5000 karakter' }, { status: 422 })
  }
  return forward('POST', JSON.stringify({ title, content }))
}
