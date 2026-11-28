import { DEFAULT_TIMING } from './constants.js'

/**
 * calcula o tempo total para ler um arquivo inteiro.
 * contígua: 1 busca + n leituras + (n-1) avanços sequenciais
 * encadeada: n leituras + (n-1) ponteiros + saltos entre blocos não vizinhos
 * indexada: 1 consulta ao índice + n (busca + leitura)
 * @param {string} strategy técnica de alocação
 * @param {number[]} positions blocos do arquivo na ordem de leitura
 * @param {object} [timing] custos de cada operação
 * @returns {{ total: number, breakdown: { label: string, cost: number }[], label: string }}
 */
export function estimateAccessTime(strategy, positions, timing = DEFAULT_TIMING) {
  const n = positions.length
  if (!n) {
    return { total: 0, breakdown: [], label: 'Sem blocos' }
  }

  if (strategy === 'contiguous') {
    const breakdown = [
      { label: 'Ir até o início do arquivo', cost: timing.seek },
      { label: `Ler ${n} bloco(s)`, cost: timing.read * n },
      {
        label: `Avançar bloco a bloco (${Math.max(0, n - 1)}×)`,
        cost: timing.sequential * Math.max(0, n - 1),
      },
    ]
    return {
      total: breakdown.reduce((sum, item) => sum + item.cost, 0),
      breakdown,
      label: 'Acesso sequencial',
    }
  }

  if (strategy === 'chained') {
    let seeks = timing.seek
    let pointers = 0
    for (let i = 0; i < n - 1; i++) {
      pointers += timing.pointer
      const gap = Math.abs(positions[i + 1] - positions[i])
      seeks += gap === 1 ? timing.sequential : timing.seek
    }
    const breakdown = [
      { label: 'Ir até o primeiro bloco', cost: timing.seek },
      { label: `Ler ${n} bloco(s)`, cost: timing.read * n },
      { label: `Seguir ponteiros (${n - 1}×)`, cost: pointers },
      {
        label: 'Saltar entre blocos espalhados',
        cost: seeks - timing.seek,
      },
    ]
    return {
      total: timing.read * n + pointers + seeks,
      breakdown,
      label: 'Percurso por ponteiros',
    }
  }

  const breakdown = [
    { label: 'Consultar a tabela de índices', cost: timing.indexLookup },
    {
      label: `Ir e ler cada bloco (${n}×)`,
      cost: (timing.seek + timing.read) * n,
    },
  ]
  return {
    total: breakdown.reduce((sum, item) => sum + item.cost, 0),
    breakdown,
    label: 'Acesso via índice',
  }
}

/**
 * gera os passos da animação de leitura, com o tempo acumulado em cada um.
 * @param {string} strategy técnica de alocação
 * @param {number[]} positions blocos do arquivo na ordem de leitura
 * @param {object} [timing] custos de cada operação
 * @param {number | null} [indexBlock] bloco de índice (só na indexada)
 * @returns {{ steps: object[], estimate: object }}
 */
export function buildTimedAccessSteps(
  strategy,
  positions,
  timing = DEFAULT_TIMING,
  indexBlock = null,
) {
  const estimate = estimateAccessTime(strategy, positions, timing)
  if (!positions.length) return { steps: [], estimate }

  let elapsed = 0

  if (strategy === 'contiguous') {
    elapsed += timing.seek
    const steps = [
      {
        id: 'start',
        kind: 'info',
        text: `Indo até o bloco ${positions[0] + 1} (+${timing.seek}).`,
        active: [positions[0]],
        trail: [],
        elapsed,
        delta: timing.seek,
      },
    ]

    positions.forEach((block, i) => {
      const delta =
        timing.read + (i > 0 ? timing.sequential : 0)
      elapsed += delta
      steps.push({
        id: `read-${block}`,
        kind: 'read',
        text: `Lê bloco ${block + 1} (+${delta}) · total ${elapsed}`,
        active: [block],
        trail: positions.slice(0, i + 1),
        elapsed,
        delta,
      })
    })

    steps.push({
      id: 'done',
      kind: 'done',
      text: `Concluído em ${elapsed} unidades de tempo (sequencial).`,
      active: positions,
      trail: positions,
      elapsed,
      delta: 0,
    })
    return { steps, estimate: { ...estimate, total: elapsed } }
  }

  if (strategy === 'chained') {
    elapsed += timing.seek
    const steps = [
      {
        id: 'start',
        kind: 'info',
        text: `Início no bloco ${positions[0] + 1} (+${timing.seek}).`,
        active: [positions[0]],
        trail: [],
        elapsed,
        delta: timing.seek,
      },
    ]

    positions.forEach((block, i) => {
      elapsed += timing.read
      steps.push({
        id: `read-${block}`,
        kind: 'read',
        text: `Lê bloco ${block + 1} (+${timing.read}) · total ${elapsed}`,
        active: [block],
        trail: positions.slice(0, i + 1),
        elapsed,
        delta: timing.read,
      })

      if (i < positions.length - 1) {
        const next = positions[i + 1]
        const gap = Math.abs(next - block)
        const move = gap === 1 ? timing.sequential : timing.seek
        const delta = timing.pointer + move
        elapsed += delta
        steps.push({
          id: `ptr-${block}`,
          kind: 'pointer',
          text: `Ponteiro ${block + 1} → ${next + 1} (+${delta}) · total ${elapsed}`,
          active: [block, next],
          trail: positions.slice(0, i + 1),
          elapsed,
          delta,
        })
      }
    })

    steps.push({
      id: 'done',
      kind: 'done',
      text: `Concluído em ${elapsed} unidades de tempo (encadeada).`,
      active: positions,
      trail: positions,
      elapsed,
      delta: 0,
    })
    return { steps, estimate: { ...estimate, total: elapsed } }
  }

  elapsed += timing.indexLookup
  const steps = [
    {
      id: 'index',
      kind: 'index',
      text: `Consulta índices (+${timing.indexLookup}).`,
      // acende o bloco onde o índice está gravado
      active: indexBlock != null ? [indexBlock] : [],
      trail: [],
      showIndex: true,
      elapsed,
      delta: timing.indexLookup,
    },
  ]

  positions.forEach((block, i) => {
    const delta = timing.seek + timing.read
    elapsed += delta
    steps.push({
      id: `jump-${block}`,
      kind: 'read',
      text: `Índice → bloco ${block + 1} (+${delta}) · total ${elapsed}`,
      active: [block],
      trail: positions.slice(0, i + 1),
      showIndex: true,
      elapsed,
      delta,
    })
  })

  steps.push({
    id: 'done',
    kind: 'done',
    text: `Concluído em ${elapsed} unidades de tempo (indexada).`,
    active: positions,
    trail: positions,
    showIndex: true,
    elapsed,
    delta: 0,
  })

  return { steps, estimate: { ...estimate, total: elapsed } }
}
