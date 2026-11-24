export const TIMING_PRESETS = {
  fast: {
    id: 'fast',
    label: 'Rápido',
    hint: 'Operações baratas — útil para ver o fluxo.',
    values: { seek: 4, sequential: 1, read: 2, pointer: 1, indexLookup: 2 },
  },
  balanced: {
    id: 'balanced',
    label: 'Equilibrado',
    hint: 'Valores didáticos padrão.',
    values: { seek: 10, sequential: 1, read: 5, pointer: 2, indexLookup: 5 },
  },
  slow: {
    id: 'slow',
    label: 'Lento',
    hint: 'Destaca melhor a diferença entre estratégias.',
    values: { seek: 20, sequential: 2, read: 8, pointer: 4, indexLookup: 10 },
  },
}
