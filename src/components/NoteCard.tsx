type NoteCardProps = {
  title: string
  content: string
}

export function NoteCard({ title, content }: NoteCardProps) {
  return (
    <article>
      <h3>{title}</h3>
      <p className="whitespace-pre-wrap">{content}</p>
    </article>
  )
}
