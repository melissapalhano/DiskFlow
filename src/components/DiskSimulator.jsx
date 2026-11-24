import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  FilePlus2,
  Folder,
  HardDrive,
  ListTree,
  Play,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import {
  DISK_SIZE,
  FILE_COLORS,
  INITIAL_FILES,
  STRATEGY_DETAILS,
} from '../data/disk.js'
import {
  allocateBlocks,
  countFreeBlocks,
  hasContiguousSpace,
} from '../lib/allocateBlocks.js'

const STRATEGIES = Object.keys(STRATEGY_DETAILS)

const STRATEGY_ICONS = {
  contigua: Folder,
  encadeada: ArrowRight,
  indexada: ListTree,
}

function createRandomFile(counter) {
  return {
    name: `Arquivo ${counter}`,
    blocks: Math.floor(Math.random() * 3) + 2,
    color: FILE_COLORS[(counter + 2) % FILE_COLORS.length],
  }
}

export default function DiskSimulator() {
  const [strategy, setStrategy] = useState('contigua')
  const [files, setFiles] = useState(INITIAL_FILES)
  const [message, setMessage] = useState(
    'Escolha um jeito de guardar e experimente!',
  )
  const [counter, setCounter] = useState(1)
  const [highlight, setHighlight] = useState([])

  const blocks = useMemo(
    () => allocateBlocks(files, strategy),
    [files, strategy],
  )
  const occupied = DISK_SIZE - countFreeBlocks(blocks)

  const selectStrategy = (key) => {
    setStrategy(key)
    setHighlight([])
    setMessage(
      `Estratégia selecionada: alocação ${STRATEGY_DETAILS[key].title.toLowerCase()}.`,
    )
  }

  const addFile = () => {
    const file = createRandomFile(counter)
    const free = countFreeBlocks(blocks)
    const canFitContiguous =
      strategy !== 'contigua' || hasContiguousSpace(blocks, file.blocks)

    if (file.blocks > free || !canFitContiguous) {
      setMessage(
        strategy === 'contigua'
          ? 'Não há uma sequência livre com espaço suficiente. O espaço disponível está fragmentado.'
          : 'Não há blocos livres suficientes. Exclua um arquivo para liberar espaço.',
      )
      setHighlight([])
      return
    }

    setFiles((current) => [...current, file])
    setCounter((value) => value + 1)
    setMessage(`${file.name} foi criado e ocupa ${file.blocks} blocos do disco.`)
    setHighlight([])
  }

  const removeFile = () => {
    if (files.length <= 1) {
      setMessage('Mantenha pelo menos um arquivo para continuar a simulação.')
      return
    }

    const removed = files[files.length - 1]
    setFiles((current) => current.slice(0, -1))
    setMessage(
      `${removed.name} foi excluído. Os blocos ocupados por ele foram liberados.`,
    )
    setHighlight([])
  }

  const accessFile = () => {
    const target = files[0]
    const found = blocks.flatMap((block, index) =>
      block?.name === target?.name ? [index] : [],
    )
    setHighlight(found)

    const accessMessages = {
      contigua: `Acesso direto: os ${found.length} blocos de ${target?.name} estão em sequência.`,
      encadeada: `A leitura percorre os ponteiros até localizar os ${found.length} blocos de ${target?.name}.`,
      indexada: `O bloco de índices localiza diretamente os ${found.length} blocos de ${target?.name}.`,
    }
    setMessage(accessMessages[strategy])
  }

  const reset = () => {
    setFiles(INITIAL_FILES)
    setCounter(1)
    setHighlight([])
    setMessage(
      'Selecione uma estratégia e observe como os blocos são distribuídos.',
    )
  }

  const current = STRATEGY_DETAILS[strategy]

  return (
    <div className="simulator-card">
      <div className="simulator-top">
        <div>
          <div className="eyebrow">SIMULAÇÃO INTERATIVA</div>
          <h3>Alocação de arquivos em disco</h3>
          <p>
            O disco virtual tem {DISK_SIZE} blocos. Compare como cada estratégia
            organiza os arquivos.
          </p>
        </div>
        <button
          className="reset-button"
          onClick={reset}
          aria-label="Reiniciar simulação"
          type="button"
        >
          <RotateCcw size={17} />
          <span>Reiniciar</span>
        </button>
      </div>

      <div
        className="strategy-picker"
        role="group"
        aria-label="Selecione a estratégia de alocação"
      >
        {STRATEGIES.map((key) => {
          const Icon = STRATEGY_ICONS[key]
          const detail = STRATEGY_DETAILS[key]
          const selected = strategy === key

          return (
            <button
              key={key}
              type="button"
              className={`strategy-option${selected ? ' selected' : ''}`}
              onClick={() => selectStrategy(key)}
            >
              <span className="strategy-icon">
                <Icon size={19} />
              </span>
              <span>
                <strong>{detail.title}</strong>
                <small>{detail.analogy}</small>
              </span>
              {selected && <Check className="strategy-check" size={17} />}
            </button>
          )
        })}
      </div>

      <div className="disk-heading">
        <span>
          <HardDrive size={18} /> Disco virtual
        </span>
        <span>
          {occupied} de {DISK_SIZE} espaços ocupados
        </span>
      </div>

      <div className="disk-grid" aria-label={`Visualização dos ${DISK_SIZE} blocos do disco`}>
        {blocks.map((file, index) => (
          <div
            key={index}
            className={`disk-block${file ? ' occupied' : ''}${highlight.includes(index) ? ' highlighted' : ''}`}
            style={
              file
                ? { backgroundColor: file.color, borderColor: file.color }
                : undefined
            }
            title={
              file
                ? `${file.name}, bloco ${index + 1}`
                : `Espaço livre ${index + 1}`
            }
          >
            <span>{file ? file.name.slice(0, 2).toUpperCase() : ''}</span>
            <small>{index + 1}</small>
          </div>
        ))}
      </div>

      <div className="disk-legend">
        <span>
          <i className="legend-free" /> Espaço livre
        </span>
        {files.map((file) => (
          <span key={file.name}>
            <i style={{ backgroundColor: file.color }} />
            {file.name}
          </span>
        ))}
      </div>

      <div className="sim-actions">
        <button className="action-button add" type="button" onClick={addFile}>
          <FilePlus2 size={17} />
          Criar arquivo
        </button>
        <button className="action-button" type="button" onClick={accessFile}>
          <Play size={16} />
          Acessar arquivo
        </button>
        <button
          className="action-button delete"
          type="button"
          onClick={removeFile}
        >
          <Trash2 size={16} />
          Excluir último arquivo
        </button>
      </div>

      <div className="sim-message" aria-live="polite">
        <span className="message-star">✦</span>
        <span>{message}</span>
      </div>

      <div className="analogy-box">
        <span>{current.icon}</span>
        <p>
          <strong>{current.analogy}.</strong> {current.description}
        </p>
      </div>
    </div>
  )
}
