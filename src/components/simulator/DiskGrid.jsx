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
      {blocks.map((file, index) => {
        const isActive = activeBlocks.includes(index)
        const isTrail = trailBlocks.includes(index)
        const isAllocating = allocatingBlocks.includes(index)

        return (
          <div
            key={index}
            className={[
              'lab-block',
              file ? 'occupied' : '',
              isActive ? 'active' : '',
              isTrail ? 'trail' : '',
              isAllocating ? 'allocating' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={
              file
                ? { backgroundColor: file.color, borderColor: file.color }
                : undefined
            }
            title={
              file
                ? `${file.name} · bloco ${index + 1}`
                : `Livre · bloco ${index + 1}`
            }
          >
            <span>{file ? file.name.slice(0, 2).toUpperCase() : ''}</span>
            <small>{index + 1}</small>
          </div>
        )
      })}
    </div>
  )
}
