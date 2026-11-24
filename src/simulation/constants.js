export const DEFAULT_DISK_SIZE = 24

export const DISK_SIZE_OPTIONS = [12, 16, 24, 32, 48]

/** Custos em unidades de tempo (u.t.) para a simulação educativa. */
export const DEFAULT_TIMING = {
  seek: 10,
  sequential: 1,
  read: 5,
  pointer: 2,
  indexLookup: 5,
}

export const FILE_COLORS = [
  '#5B7C99',
  '#5F8F82',
  '#7A7CA0',
  '#A98986',
  '#6F91AA',
]

export const INITIAL_FILES = [
  { id: 'demo-imagem', name: 'Imagem', blocks: 3, color: FILE_COLORS[0] },
  { id: 'demo-texto', name: 'Texto', blocks: 2, color: FILE_COLORS[1] },
  { id: 'demo-audio', name: 'Áudio', blocks: 3, color: FILE_COLORS[2] },
]

export const STRATEGY_DETAILS = {
  contigua: {
    title: 'Contígua',
    analogy: 'Blocos em sequência',
    short: 'Lado a lado no disco',
    pros: [
      'Acesso sequencial muito rápido',
      'Fácil de implementar',
      'Poucos metadados',
    ],
    cons: [
      'Sofre com fragmentação externa',
      'Difícil crescer o arquivo',
      'Precisa de espaço contínuo',
    ],
  },
  encadeada: {
    title: 'Encadeada',
    analogy: 'Blocos ligados por ponteiros',
    short: 'Cada bloco aponta para o próximo',
    pros: [
      'Usa espaços fragmentados',
      'Arquivo pode crescer fácil',
      'Sem necessidade de área contínua',
    ],
    cons: [
      'Acesso lento (segue ponteiros)',
      'Falha em um ponteiro quebra a cadeia',
      'Pior localidade espacial',
    ],
  },
  indexada: {
    title: 'Indexada',
    analogy: 'Endereços reunidos em um índice',
    short: 'Tabela com todos os endereços',
    pros: [
      'Acesso direto a qualquer bloco',
      'Evita percorrer cadeia',
      'Boa para arquivos grandes',
    ],
    cons: [
      'Gasta espaço com o índice',
      'Índice pode ficar grande',
      'Mais metadados para gerenciar',
    ],
  },
}

export const DEMO_SCENARIOS = [
  {
    id: 'basico',
    title: 'Cenário básico',
    description: 'Três arquivos pequenos para comparar as estratégias.',
    files: INITIAL_FILES,
  },
  {
    id: 'fragmentacao',
    title: 'Fragmentação',
    description: 'Vários arquivos pequenos intercalados no disco.',
    files: [
      { id: 'frag-a', name: 'A', blocks: 2, color: FILE_COLORS[0] },
      { id: 'frag-b', name: 'B', blocks: 2, color: FILE_COLORS[1] },
      { id: 'frag-c', name: 'C', blocks: 2, color: FILE_COLORS[2] },
      { id: 'frag-d', name: 'D', blocks: 2, color: FILE_COLORS[3] },
    ],
  },
  {
    id: 'grande',
    title: 'Arquivo maior',
    description: 'Um arquivo de 6 blocos destaca diferenças de tempo.',
    files: [
      { id: 'big-video', name: 'Video', blocks: 6, color: FILE_COLORS[4] },
      { id: 'big-docs', name: 'Docs', blocks: 2, color: FILE_COLORS[1] },
    ],
  },
]
