// testes rápidos da lógica de alocação, sem framework: node scripts/testar-alocacao.mjs
import assert from 'node:assert/strict'
import {
  allocateFile,
  createDisk,
  diskStats,
  getFilePositions,
  removeFile,
  runOperations,
} from '../src/simulation/allocation.js'
import { DEMO_SCENARIOS } from '../src/simulation/constants.js'

const file = (name, blocks) => ({ id: name, name, blocks, color: '#000' })

// desenha o disco como texto: letra do arquivo, "i" para índice, "." livre
const draw = (disk) =>
  disk.blocks
    .map((c) => (!c ? '.' : c.kind === 'index' ? 'i' : c.file.name))
    .join('')

function create(disk, ...files) {
  return files.reduce((d, f) => {
    const r = allocateFile(d, f)
    assert.ok(r.ok, r.message)
    return r.disk
  }, disk)
}

let passed = 0
function test(name, fn) {
  fn()
  passed += 1
  console.log(`ok - ${name}`)
}

test('remover B na contígua deixa o buraco no lugar', () => {
  let disk = create(createDisk(12, 'contiguous'),
    file('A', 3), file('B', 2), file('C', 3), file('D', 2))
  assert.equal(draw(disk), 'AAABBCCCDD..')
  disk = removeFile(disk, 'B')
  assert.equal(draw(disk), 'AAA..CCCDD..')
  assert.deepEqual(getFilePositions(disk, 'C'), [5, 6, 7])
})

test('arquivo maior que os buracos falha na contígua e cabe nas outras', () => {
  const scenario = DEMO_SCENARIOS.find((s) => s.id === 'fragmentation')
  const contig = runOperations(24, 'contiguous', scenario.operations)
  assert.equal(contig.failed.length, 1)
  assert.equal(contig.failed[0].reason, 'fragmentation')
  assert.ok(diskStats(contig.disk).freeBlocks >= 7)

  for (const strategy of ['chained', 'indexed']) {
    const r = runOperations(24, strategy, scenario.operations)
    assert.equal(r.failed.length, 0, `${strategy}: ${r.failed[0]?.message}`)
    assert.equal(getFilePositions(r.disk, 'frag-f').length, 7)
  }
})

test('encadeada segue os ponteiros gravados nos blocos', () => {
  let disk = create(createDisk(8, 'chained'), file('A', 2), file('B', 2))
  disk = removeFile(disk, 'A')
  disk = create(disk, file('C', 3))
  const chain = getFilePositions(disk, 'C')
  assert.deepEqual(chain, [0, 1, 4])
  assert.equal(disk.blocks[1].next, 4)
  assert.equal(disk.blocks[4].next, null)
  assert.equal(diskStats(disk).pointers, 5)
})

test('indexada usa 1 bloco a mais por arquivo', () => {
  const disk = create(createDisk(12, 'indexed'), file('A', 3), file('B', 2))
  const stats = diskStats(disk)
  assert.equal(stats.dataBlocks, 5)
  assert.equal(stats.indexBlocks, 2)
  assert.equal(stats.freeBlocks, 12 - 7)
  const full = allocateFile(disk, file('C', 5))
  assert.equal(full.ok, false)
  assert.equal(full.reason, 'space')
})

test('remover libera também o bloco de índice', () => {
  let disk = create(createDisk(12, 'indexed'), file('A', 3), file('B', 2))
  disk = removeFile(disk, 'A')
  assert.equal(diskStats(disk).indexBlocks, 1)
  assert.equal(diskStats(disk).freeBlocks, 12 - 3)
  assert.ok(disk.blocks.every((c) => c?.file.id !== 'A'))
})

console.log(`\n${passed} testes passaram`)
