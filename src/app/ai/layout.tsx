import Link from 'next/link'
import type { ReactNode } from 'react'

export default function AILayout({ children }: { children: ReactNode }) {
  return (
    <main className="ai-demo">
      <p className="muted"><Link href="/">← Cloud Notes</Link></p>
      {children}
    </main>
  )
}
