// desenha o disco como uma grade de blocos. blocos de índice aparecem
// tracejados com "IDX" e, na encadeada, o tooltip mostra o próximo bloco.
function blockTitle(cell, index) {
  const label = `bloco ${index + 1}`
  if (!cell) return `Livre · ${label}`
  if (cell.kind === 'index') {
    const list = cell.entries.map((pos) => pos + 1).join(', ')
    return `Índice de ${cell.file.name} · ${label} · aponta para ${list}`
  }
  if (cell.file && cell.next != null) {
    return `${cell.file.name} · ${label} · próximo: ${cell.next + 1}`
  }
  return `${cell.file.name} · ${label}`
}

export default function DiskGrid({
  blocks,
  activeBlocks = [],
  trailBlocks = [],
  allocatingBlocks = [],
  compact = false,
  fluid = false,
  columns = 12,
  label = 'Disco virtual',
}) {
  const className = [
    'lab-disk-grid',
    compact ? 'compact' : '',
    !compact && !fluid ? 'large' : '',
    fluid ? 'fluid' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      style={{ '--disk-cols': columns }}
      aria-label={label}
    >
      {blocks.map((cell, index) => {
        const isIndex = cell?.kind === 'index'
        const color = cell?.file.color

        return (
          <div
            key={index}
            className={[
              'lab-block',
              cell ? 'occupied' : '',
              isIndex ? 'index' : '',
              activeBlocks.includes(index) ? 'active' : '',
              trailBlocks.includes(index) ? 'trail' : '',
              allocatingBlocks.includes(index) ? 'allocating' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={
              cell
                ? isIndex
                  ? { borderColor: color, color }
                  : { backgroundColor: color, borderColor: color }
                : undefined
            }
            title={blockTitle(cell, index)}
          >
            <span>
              {isIndex ? 'IDX' : cell ? cell.file.name.slice(0, 2).toUpperCase() : ''}
            </span>
            <small>{index + 1}</small>
          </div>
        )
      })}
    </div>
  )
}
