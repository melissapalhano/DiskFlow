import { FILE_COLORS, INITIAL_FILES } from './constants.js'

let fileSeq = 0

export function createFileId() {
  fileSeq += 1
  return `file-${Date.now()}-${fileSeq}`
}

export function withFileIds(files) {
  return files.map((file) => ({
    ...file,
    id: file.id ?? createFileId(),
  }))
}

export function cloneInitialFiles() {
  return withFileIds(INITIAL_FILES.map((file) => ({ ...file })))
}

export function buildFile({ name, blocks, color, id }) {
  return {
    id: id ?? createFileId(),
    name: (name || 'Arquivo').trim() || 'Arquivo',
    blocks: Math.min(24, Math.max(1, Number(blocks) || 1)),
    color: color || FILE_COLORS[0],
  }
}

export function nextFileColor(files) {
  return FILE_COLORS[files.length % FILE_COLORS.length]
}

export function suggestFileName(files) {
  return `Arquivo ${files.length + 1}`
}

export function totalBlocksUsed(files) {
  return files.reduce((sum, file) => sum + file.blocks, 0)
}

export function fitFilesToDisk(files, diskSize) {
  const result = []
  let used = 0
  for (const file of files) {
    if (used + file.blocks > diskSize) break
    result.push(file)
    used += file.blocks
  }
  return result.length ? result : [buildFile({ name: 'Arquivo', blocks: 1 })]
}
