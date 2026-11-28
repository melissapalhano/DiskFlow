export const DEFAULT_DISK_SIZE = 24

export const DISK_SIZE_OPTIONS = [12, 16, 24, 32, 48]

// tamanho máximo de um arquivo
export const MAX_FILE_BLOCKS = 12

// custos de tempo da simulação de acesso
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
  { id: 'demo-image', name: 'Imagem', blocks: 3, color: FILE_COLORS[0] },
  { id: 'demo-text', name: 'Texto', blocks: 2, color: FILE_COLORS[1] },
  { id: 'demo-audio', name: 'Áudio', blocks: 3, color: FILE_COLORS[2] },
]

export const STRATEGY_DETAILS = {
  contiguous: {
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
  chained: {
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
  indexed: {
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

// cria um arquivo de exemplo
const create = (file) => ({ type: 'create', file, scatter: true })

const fragFiles = {
  a: { id: 'frag-a', name: 'A', blocks: 4, color: FILE_COLORS[0] },
  b: { id: 'frag-b', name: 'B', blocks: 3, color: FILE_COLORS[1] },
  c: { id: 'frag-c', name: 'C', blocks: 4, color: FILE_COLORS[2] },
  d: { id: 'frag-d', name: 'D', blocks: 3, color: FILE_COLORS[3] },
  e: { id: 'frag-e', name: 'E', blocks: 4, color: FILE_COLORS[4] },
  f: { id: 'frag-f', name: 'F', blocks: 7, color: FILE_COLORS[1] },
}

// cada cenário é uma sequência de operações
export const DEMO_SCENARIOS = [
  {
    id: 'basic',
    title: 'Cenário básico',
    description: 'Três arquivos pequenos para comparar as estratégias.',
    operations: INITIAL_FILES.map(create),
  },
  {
    id: 'fragmentation',
    title: 'Fragmentação',
    description:
      'Cria A a E, remove B e D e tenta criar F (7 blocos), maior que cada buraco.',
    operations: [
      create(fragFiles.a),
      create(fragFiles.b),
      create(fragFiles.c),
      create(fragFiles.d),
      create(fragFiles.e),
      { type: 'remove', fileId: 'frag-b' },
      { type: 'remove', fileId: 'frag-d' },
      // F usa os blocos livres reais
      { type: 'create', file: fragFiles.f },
    ],
  },
  {
    id: 'large',
    title: 'Arquivo maior',
    description: 'Um arquivo de 6 blocos destaca diferenças de tempo.',
    operations: [
      create({ id: 'big-video', name: 'Video', blocks: 6, color: FILE_COLORS[4] }),
      create({ id: 'big-docs', name: 'Docs', blocks: 2, color: FILE_COLORS[1] }),
    ],
  },
]
