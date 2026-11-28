// resumo de ocupação de um disco: dados, metadados, livres e o maior
// trecho livre seguido (quando é bem menor que o livre total, há fragmentação)
export default function DiskStats({ strategy, stats }) {
  const fragmented =
    stats.freeBlocks > 0 && stats.largestFreeRun < stats.freeBlocks

  return (
    <dl className="disk-stats">
      <div>
        <dt>Dados</dt>
        <dd>{stats.dataBlocks}</dd>
      </div>
      <div>
        <dt>Extra</dt>
        <dd>
          {strategy === 'indexed' && `${stats.indexBlocks} bloco(s) de índice`}
          {strategy === 'chained' && `${stats.pointers} ponteiros`}
          {strategy === 'contiguous' && 'nenhum'}
        </dd>
      </div>
      <div>
        <dt>Livres</dt>
        <dd>{stats.freeBlocks}</dd>
      </div>
      <div className={fragmented ? 'warn' : ''}>
        <dt>Maior trecho livre</dt>
        <dd>{stats.largestFreeRun}</dd>
      </div>
    </dl>
  )
}
