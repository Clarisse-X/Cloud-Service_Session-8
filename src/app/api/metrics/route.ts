import { metricsText } from '@/lib/note-metrics'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET() {
  return new Response(metricsText(), {
    headers: {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
