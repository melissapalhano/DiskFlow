// cada posição do disco é null (livre) ou uma célula:
//   { file, kind: 'data', next }   bloco de dados (next só é usado na encadeada)
//   { file, kind: 'index', entries } bloco de índice da indexada
// o diretório guarda só o necessário para achar o arquivo: o bloco inicial
// (contígua), a cabeça da lista (encadeada) ou o bloco de índice (indexada).

/**
 * cria um disco vazio.
 * @param {number} size quantidade de blocos
 * @param {'contiguous' | 'chained' | 'indexed'} strategy técnica de alocação
 * @returns {{ size: number, strategy: string, blocks: Array, directory: Array }}
 */
export function createDisk(size, strategy) {
  return { size, strategy, blocks: Array(size).fill(null), directory: [] }
}

/**
 * lista os índices dos blocos livres, em ordem.
 * @param {Array} blocks blocos do disco
 * @returns {number[]}
 */
export function freePositions(blocks) {
  return blocks.flatMap((cell, index) => (cell ? [] : [index]))
}

/**
 * conta os blocos livres.
 * @param {Array} blocks blocos do disco
 * @returns {number}
 */
export function countFreeBlocks(blocks) {
  return freePositions(blocks).length
}

/**
 * tamanho do maior trecho livre contínuo. se for menor que o total livre,
 * o espaço está quebrado em buracos (fragmentação externa).
 * @param {Array} blocks blocos do disco
 * @returns {number}
 */
export function largestFreeRun(blocks) {
  let best = 0
  let run = 0
  for (const cell of blocks) {
    run = cell ? 0 : run + 1
    best = Math.max(best, run)
  }
  return best
}

/**
 * first-fit: devolve o primeiro trecho livre com `size` blocos seguidos.
 * @param {Array} blocks blocos do disco
 * @param {number} size blocos necessários
 * @returns {number[]} posições do trecho, ou [] se não houver
 */
function findFirstFit(blocks, size) {
  let start = 0
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i]) {
      start = i + 1
      continue
    }
    // achou blocos livres seguidos o bastante a partir de `start`
    if (i - start + 1 === size) {
      return Array.from({ length: size }, (_, k) => start + k)
    }
  }
  return []
}

/**
 * escolhe blocos livres intercalados (pares da lista de livres e depois
 * ímpares). só serve para deixar os cenários de exemplo espalhados.
 * @param {number[]} free posições livres
 * @param {number} size blocos necessários
 * @returns {number[]}
 */
function pickScattered(free, size) {
  const evens = free.filter((_, i) => i % 2 === 0)
  const odds = free.filter((_, i) => i % 2 === 1)
  return [...evens, ...odds].slice(0, size)
}

/**
 * aloca um arquivo no estado atual do disco, sem mexer nos outros arquivos.
 * @param {object} disk disco atual
 * @param {{ id: string, name: string, blocks: number, color: string }} file arquivo novo
 * @param {{ scatter?: boolean }} [options] scatter espalha os blocos (só cenários)
 * @returns {{ ok: boolean, disk: object, reason?: 'space' | 'fragmentation', message: string }}
 *   em caso de falha, `disk` é o mesmo disco recebido
 */
export function allocateFile(disk, file, options = {}) {
  const { strategy } = disk
  const free = freePositions(disk.blocks)
  // a indexada precisa de um bloco a mais para guardar o índice
  const needed = file.blocks + (strategy === 'indexed' ? 1 : 0)

  if (needed > free.length) {
    return {
      ok: false,
      disk,
      reason: 'space',
      message: `${file.name} não coube: precisa de ${needed} blocos e só há ${free.length} livres.`,
    }
  }

  const blocks = [...disk.blocks]
  let start

  if (strategy === 'contiguous') {
    const segment = findFirstFit(blocks, file.blocks)
    if (!segment.length) {
      return {
        ok: false,
        disk,
        reason: 'fragmentation',
        message: `${file.name} não coube: há ${free.length} blocos livres, mas o maior trecho contínuo tem ${largestFreeRun(blocks)} (fragmentação externa).`,
      }
    }
    segment.forEach((pos) => {
      blocks[pos] = { file, kind: 'data', next: null }
    })
    start = segment[0]
  } else {
    // encadeada e indexada aproveitam qualquer bloco livre, inclusive buracos
    let pool = free
    let indexBlock = null
    if (strategy === 'indexed') {
      // reserva o primeiro livre para o índice, os dados vêm do resto
      indexBlock = pool[0]
      pool = pool.slice(1)
    }
    const positions = options.scatter
      ? pickScattered(pool, file.blocks)
      : pool.slice(0, file.blocks)

    positions.forEach((pos, i) => {
      // na encadeada cada bloco guarda o endereço do próximo; o último fica null
      const next =
        strategy === 'chained' ? (positions[i + 1] ?? null) : null
      blocks[pos] = { file, kind: 'data', next }
    })

    if (strategy === 'indexed') {
      blocks[indexBlock] = { file, kind: 'index', entries: positions }
      start = indexBlock
    } else {
      start = positions[0]
    }
  }

  return {
    ok: true,
    disk: { ...disk, blocks, directory: [...disk.directory, { file, start }] },
    message: `${file.name} criado (${file.blocks} blocos).`,
  }
}

/**
 * remove um arquivo liberando só os blocos dele (inclusive o de índice).
 * @param {object} disk disco atual
 * @param {string} fileId id do arquivo
 * @returns {object} novo disco
 */
export function removeFile(disk, fileId) {
  return {
    ...disk,
    blocks: disk.blocks.map((cell) => (cell?.file.id === fileId ? null : cell)),
    directory: disk.directory.filter((entry) => entry.file.id !== fileId),
  }
}

/**
 * troca um arquivo por uma nova versão: remove e aloca de novo só ele.
 * se não couber, o disco continua como estava.
 * @param {object} disk disco atual
 * @param {object} file arquivo com os dados novos (mesmo id)
 * @returns {{ ok: boolean, disk: object, reason?: string, message: string }}
 */
export function updateFile(disk, file) {
  const position = disk.directory.findIndex((entry) => entry.file.id === file.id)
  const result = allocateFile(removeFile(disk, file.id), file)
  if (!result.ok) return { ...result, disk }

  // mantém o arquivo na mesma posição da lista do diretório
  const directory = result.disk.directory.filter((e) => e.file.id !== file.id)
  const entry = result.disk.directory.at(-1)
  directory.splice(position < 0 ? directory.length : position, 0, entry)
  return {
    ...result,
    disk: { ...result.disk, directory },
    message: `${file.name} atualizado.`,
  }
}

/**
 * devolve os blocos de dados do arquivo na ordem de leitura, usando só o
 * que está gravado no disco: o trecho (contígua), os ponteiros (encadeada)
 * ou a lista do bloco de índice (indexada).
 * @param {object} disk disco atual
 * @param {string} fileId id do arquivo
 * @returns {number[]}
 */
export function getFilePositions(disk, fileId) {
  const entry = disk.directory.find((item) => item.file.id === fileId)
  if (!entry) return []

  if (disk.strategy === 'contiguous') {
    return Array.from({ length: entry.file.blocks }, (_, i) => entry.start + i)
  }
  if (disk.strategy === 'indexed') {
    return [...disk.blocks[entry.start].entries]
  }

  // segue a cadeia de ponteiros a partir da cabeça
  const chain = []
  for (let pos = entry.start; pos != null; pos = disk.blocks[pos].next) {
    chain.push(pos)
  }
  return chain
}

/**
 * monta a visão de cada arquivo usada pelos painéis.
 * @param {object} disk disco atual
 * @returns {{ file: object, positions: number[], indexBlock: number | null }[]}
 */
export function getPlacements(disk) {
  return disk.directory.map((entry) => ({
    file: entry.file,
    positions: getFilePositions(disk, entry.file.id),
    indexBlock: disk.strategy === 'indexed' ? entry.start : null,
  }))
}

/**
 * números de ocupação do disco, para comparar o custo de espaço.
 * @param {object} disk disco atual
 * @returns {{ dataBlocks: number, indexBlocks: number, pointers: number, freeBlocks: number, largestFreeRun: number }}
 */
export function diskStats(disk) {
  const data = disk.blocks.filter((cell) => cell?.kind === 'data').length
  return {
    dataBlocks: data,
    indexBlocks: disk.blocks.filter((cell) => cell?.kind === 'index').length,
    // na encadeada todo bloco de dados perde um pedaço para o campo next
    pointers: disk.strategy === 'chained' ? data : 0,
    freeBlocks: countFreeBlocks(disk.blocks),
    largestFreeRun: largestFreeRun(disk.blocks),
  }
}

/**
 * aplica uma lista de operações (criar/remover) num disco vazio.
 * usado pelos cenários de exemplo.
 * @param {number} size tamanho do disco
 * @param {string} strategy técnica de alocação
 * @param {{ type: 'create' | 'remove', file?: object, fileId?: string }[]} operations
 * @returns {{ disk: object, log: string[], failed: { file: object, reason: string, message: string }[] }}
 */
export function runOperations(size, strategy, operations) {
  let disk = createDisk(size, strategy)
  const log = []
  const failed = []

  for (const op of operations) {
    if (op.type === 'remove') {
      const entry = disk.directory.find((e) => e.file.id === op.fileId)
      disk = removeFile(disk, op.fileId)
      if (entry) log.push(`${entry.file.name} removido.`)
      continue
    }
    const result = allocateFile(disk, op.file, { scatter: op.scatter })
    disk = result.disk
    log.push(result.message)
    if (!result.ok) {
      failed.push({ file: op.file, reason: result.reason, message: result.message })
    }
  }

  return { disk, log, failed }
}

/**
 * realoca os arquivos atuais num disco de outro tamanho, na mesma ordem.
 * funciona como formatar e copiar tudo de volta; o que não couber fica de fora.
 * @param {object} disk disco atual
 * @param {number} size novo tamanho
 * @returns {{ disk: object, log: string[], failed: object[] }}
 */
export function resizeDisk(disk, size) {
  return runOperations(
    size,
    disk.strategy,
    disk.directory.map((entry) => ({ type: 'create', file: entry.file })),
  )
}

/**
 * espera alguns milissegundos (usado nas animações).
 * @param {number} ms tempo em milissegundos
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
