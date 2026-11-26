const state = globalThis as typeof globalThis & { notesCreated?: number }
const metric = 'cloudnotes_notes_created_total'

export function noteCreated() {
  state.notesCreated = (state.notesCreated ?? 0) + 1
}

export function metricsText() {
  return [
    `# HELP ${metric} Successful note creations seen by this web process.`,
    `# TYPE ${metric} counter`,
    `${metric} ${state.notesCreated ?? 0}`,
    '',
  ].join('\n')
}
