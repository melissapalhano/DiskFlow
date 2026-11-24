import { DISK_SIZE, SCATTERED_ORDER } from '../data/disk.js'

function findContiguousSegment(blocks, size) {
  for (let start = 0; start <= DISK_SIZE - size; start++) {
    const segment = Array.from({ length: size }, (_, i) => start + i)
    if (segment.every((index) => blocks[index] === null)) {
      return segment
    }
  }
  return []
}

/**
 * Distribui arquivos nos blocos do disco virtual conforme a estratégia.
 * @param {{ name: string; blocks: number; color: string }[]} files
 * @param {'contigua' | 'encadeada' | 'indexada'} strategy
 */
export function allocateBlocks(files, strategy) {
  const result = Array(DISK_SIZE).fill(null)
  const order =
    strategy === 'contigua'
      ? Array.from({ length: DISK_SIZE }, (_, i) => i)
      : SCATTERED_ORDER

  let cursor = 0

  files.forEach((file) => {
    let positions = []

    if (strategy === 'contigua') {
      positions = findContiguousSegment(result, file.blocks)
      if (!positions.length) {
        positions = order
          .filter((index) => result[index] === null)
          .slice(0, file.blocks)
        if (positions.length !== file.blocks) positions = []
      }
    } else {
      positions = order
        .slice(cursor, cursor + file.blocks)
        .filter((index) => result[index] === null)
      cursor += file.blocks
    }

    positions.forEach((index) => {
      result[index] = file
    })
  })

  return result
}

export function hasContiguousSpace(blocks, size) {
  return findContiguousSegment(blocks, size).length === size
}

export function countFreeBlocks(blocks) {
  return blocks.filter((block) => !block).length
}
