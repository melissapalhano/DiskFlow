export const DISK_SIZE = 24

export const FILE_COLORS = ['#71869A', '#7C9C91', '#8B8DA6', '#A98986', '#6F91AA']

export const INITIAL_FILES = [
  { name: 'Imagem', blocks: 3, color: FILE_COLORS[0] },
  { name: 'Texto', blocks: 2, color: FILE_COLORS[1] },
  { name: 'Áudio', blocks: 3, color: FILE_COLORS[2] },
]

export const STRATEGY_DETAILS = {
  contigua: {
    title: 'Contígua',
    analogy: 'Blocos em sequência',
    icon: '▤',
    description:
      'Os blocos ficam lado a lado. O acesso é simples, mas o arquivo precisa de uma área livre contínua.',
  },
  encadeada: {
    title: 'Encadeada',
    analogy: 'Blocos ligados por ponteiros',
    icon: '→',
    description:
      'Os blocos podem ficar separados. Cada um indica onde está o próximo.',
  },
  indexada: {
    title: 'Indexada',
    analogy: 'Endereços reunidos em um índice',
    icon: '≡',
    description:
      'Um bloco de índices guarda os endereços de cada parte do arquivo.',
  },
}

export const SCATTERED_ORDER = [
  0, 2, 3, 5, 7, 8, 10, 12, 13, 15, 17, 18, 20, 21, 23, 1, 4, 6, 9, 11, 14, 16,
  19, 22,
]
