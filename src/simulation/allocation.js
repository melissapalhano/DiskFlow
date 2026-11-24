function findContiguousSegment(blocks, size) {
  const diskSize = blocks.length
  for (let start = 0; start <= diskSize - size; start++) {
    const segment = Array.from({ length: size }, (_, i) => start + i)
    if (segment.every((index) => blocks[index] === null)) {
      return segment
    }
  }
  return []
}

/** Scattered order from free blocks (works with any disk size). */
function pickScatteredPositions(blocks, size) {
  const free = blocks
    .map((block, index) => (block === null ? index : -1))
    .filter((index) => index >= 0)

  const scattered = []
  for (let i = 0; i < free.length; i += 2) scattered.push(free[i])
  for (let i = 1; i < free.length; i += 2) scattered.push(free[i])
  return scattered.slice(0, size)
}

function pickPositions(blocks, file, strategy) {
  if (strategy === 'contiguous') {
    return findContiguousSegment(blocks, file.blocks)
  }
  return pickScatteredPositions(blocks, file.blocks)
}

/**
 * Plans allocation on the virtual disk.
 * @param {{ name: string; blocks: number; color: string; id?: string }[]} files
 * @param {'contiguous' | 'chained' | 'indexed'} strategy
 * @param {number} diskSize
 */
export function planAllocation(files, strategy, diskSize) {
  const blocks = Array(diskSize).fill(null)
  const placements = []

  files.forEach((file) => {
    const positions = pickPositions(blocks, file, strategy)
    if (positions.length !== file.blocks) {
      placements.push({
        file,
        positions: [],
        pointers: [],
        indexEntries: [],
        failed: true,
      })
      return
    }

    positions.forEach((index) => {
      blocks[index] = file
    })

    placements.push({
      file,
      positions,
      pointers:
        strategy === 'chained'
          ? positions.slice(0, -1).map((from, i) => ({
              from,
              to: positions[i + 1],
            }))
          : [],
      indexEntries: strategy === 'indexed' ? [...positions] : [],
      failed: false,
    })
  })

  return { blocks, placements }
}

export function hasContiguousSpace(blocks, size) {
  return findContiguousSegment(blocks, size).length === size
}

export function countFreeBlocks(blocks) {
  return blocks.filter((block) => !block).length
}

export function getFilePositions(blocks, fileIdOrName) {
  return blocks.flatMap((block, index) => {
    if (!block) return []
    if (block.id === fileIdOrName || block.name === fileIdOrName) return [index]
    return []
  })
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
