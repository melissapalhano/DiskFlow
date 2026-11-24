import { Clock } from 'lucide-react'

export default function MetaPanel({
  strategy,
  placement,
  showIndex,
  estimate,
  elapsed,
}) {
  if (!placement) {
    return (
      <div className="lab-meta">
        <div className="lab-meta-strategy">
          <p className="lab-meta-empty">
            Selecione um arquivo para ver localização e tempo estimado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="lab-meta">
      <div className="meta-card time-card">
        <strong>
          <Clock size={14} /> Tempo para ler o arquivo
        </strong>
        <p className="time-total">
          {elapsed != null ? (
            <>
              Já levou: <b>{elapsed}</b> unidades de tempo
            </>
          ) : (
            <>
              Estimativa: <b>{estimate?.total ?? 0}</b> unidades de tempo
            </>
          )}
        </p>
        {estimate?.breakdown?.length > 0 && (
          <ul className="time-breakdown">
            {estimate.breakdown.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <b>{item.cost} tempo</b>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="lab-meta-strategy">
        {strategy === 'contiguous' && (
          <div className="meta-card">
            <strong>Intervalo contínuo</strong>
            <p>
              Início no bloco <b>{placement.positions[0] + 1}</b>, tamanho{' '}
              <b>{placement.positions.length}</b>.
            </p>
            <div className="meta-chips">
              {placement.positions.map((p) => (
                <span key={p}>{p + 1}</span>
              ))}
            </div>
          </div>
        )}

        {strategy === 'chained' && (
          <div className="meta-card">
            <strong>Cadeia de ponteiros</strong>
            <ol className="pointer-chain">
              {placement.positions.map((block, i) => (
                <li key={block}>
                  <span className="ptr-block">{block + 1}</span>
                  {i < placement.positions.length - 1 ? (
                    <span className="ptr-arrow">
                      → {placement.positions[i + 1] + 1}
                    </span>
                  ) : (
                    <span className="ptr-end">FIM</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {(strategy === 'indexed' || showIndex) && (
          <div className="meta-card index-card">
            <table className="index-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Endereço</th>
                </tr>
              </thead>
              <tbody>
                {placement.positions.map((block, i) => (
                  <tr key={block}>
                    <td>{i}</td>
                    <td>bloco {block + 1}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
