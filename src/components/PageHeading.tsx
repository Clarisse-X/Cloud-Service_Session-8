import type { ReactNode } from 'react'

type PageHeadingProps = {
  title: string
  children?: ReactNode
}

export function PageHeading({ title, children }: PageHeadingProps) {
  return (
    <>
      <h1 className="text-balance">{title}</h1>
      {children}
    </>
  )
}
