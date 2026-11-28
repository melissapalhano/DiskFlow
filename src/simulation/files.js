import { FILE_COLORS, MAX_FILE_BLOCKS } from './constants.js'

let fileSeq = 0

/**
 * gera um id único para um arquivo novo.
 * @returns {string}
 */
export function createFileId() {
  fileSeq += 1
  return `file-${Date.now()}-${fileSeq}`
}

/**
 * normaliza os dados do formulário num arquivo válido.
 * @param {{ name?: string, blocks?: number, color?: string, id?: string }} data
 * @returns {{ id: string, name: string, blocks: number, color: string }}
 */
export function buildFile({ name, blocks, color, id }) {
  return {
    id: id ?? createFileId(),
    name: (name || 'Arquivo').trim() || 'Arquivo',
    blocks: Math.min(MAX_FILE_BLOCKS, Math.max(1, Number(blocks) || 1)),
    color: color || FILE_COLORS[0],
  }
}

/**
 * sugere a próxima cor
 * @param {object[]} files arquivos atuais
 * @returns {string}
 */
export function nextFileColor(files) {
  return FILE_COLORS[files.length % FILE_COLORS.length]
}

/**
 * sugere um nome padrão para o próximo arquivo.
 * @param {object[]} files arquivos atuais
 * @returns {string}
 */
export function suggestFileName(files) {
  return `Arquivo ${files.length + 1}`
}
