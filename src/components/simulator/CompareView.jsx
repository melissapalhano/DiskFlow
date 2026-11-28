// compara as três técnicas lado a lado. cada uma tem o próprio disco
// persistente e recebe as mesmas operações de criar, editar e remover.
import { useMemo, useState } from 'react'
import { AlertTriangle, Play, RotateCcw } from 'lucide-react'
import {
  DEMO_SCENARIOS,
  DEFAULT_DISK_SIZE,
  STRATEGY_DETAILS,
  allocateFile,
  diskStats,
  estimateAccessTime,
  getPlacements,
  removeFile,
  resizeDisk,
  runOperations,
  sleep,
  updateFile,
} from '../../simulation/index.js'
import { TIMING_PRESETS } from '../../simulation/timingPresets.js'
import { useAccessAnimation } from '../../hooks/useAccessAnimation.js'
import DiskGrid from './DiskGrid.jsx'
import DiskStats from './DiskStats.jsx'
import FileEditor from './FileEditor.jsx'
import SettingsPanel from './SettingsPanel.jsx'

const STRATEGIES = ['contiguous', 'chained', 'indexed']
const DEFAULT_SCENARIO = 'basic'

// junta os arquivos dos três discos sem repetir, na ordem em que aparecem
function unionFiles(disks, order = []) {
  const seen = new Map()
  STRATEGIES.forEach((strategy) => {
    disks[strategy].directory.forEach((entry) => {
      if (!seen.has(entry.file.id)) seen.set(entry.file.id, entry.file)
    })
  })
  const ordered = order.filter((id) => seen.has(id)).map((id) => seen.get(id))
  const rest = [...seen.values()].filter((file) => !order.includes(file.id))
  return [...ordered, ...rest]
}

// monta os três discos de um cenário e guarda o erro de cada técnica
function buildScenario(scenarioId, size) {
  const scenario = DEMO_SCENARIOS.find((item) => item.id === scenarioId)
  const operations = scenario?.operations ?? []
  const disks = {}
  const status = {}
  STRATEGIES.forEach((strategy) => {
    const result = runOperations(size, strategy, operations)
    disks[strategy] = result.disk
    status[strategy] = result.failed.at(-1)?.message ?? null
  })
  const order = operations
    .filter((op) => op.type === 'create')
    .map((op) => op.file.id)
  return { disks, status, files: unionFiles(disks, order) }
}

export default function CompareView() {
  const [diskSize, setDiskSize] = useState(DEFAULT_DISK_SIZE)
  const [timingPreset, setTimingPreset] = useState('balanced')
  const timing = TIMING_PRESETS[timingPreset].values
  const [initial] = useState(() =>
    buildScenario(DEFAULT_SCENARIO, DEFAULT_DISK_SIZE),
  )
  const [disks, setDisks] = useState(initial.disks)
  const [status, setStatus] = useState(initial.status)
  const [files, setFiles] = useState(initial.files)
  const [selectedId, setSelectedId] = useState('')
  const [activePreset, setActivePreset] = useState(DEFAULT_SCENARIO)
  const [baseScenario, setBaseScenario] = useState(DEFAULT_SCENARIO)
  const [editorRevision, setEditorRevision] = useState(0)

  const animContiguous = useAccessAnimation(timing)
  const animChained = useAccessAnimation(timing)
  const animIndexed = useAccessAnimation(timing)

  const animations = {
    contiguous: animContiguous,
    chained: animChained,
    indexed: animIndexed,
  }

  const busy = STRATEGIES.some((strategy) => animations[strategy].playing)

  const views = useMemo(() => {
    const map = {}
    STRATEGIES.forEach((strategy) => {
      map[strategy] = {
        placements: getPlacements(disks[strategy]),
        stats: diskStats(disks[strategy]),
      }
    })
    return map
  }, [disks])

  const selectedFile = files.find((file) => file.id === selectedId) ?? files[0]

  const placementOf = (strategy) =>
    views[strategy].placements.find((item) => item.file.id === selectedFile?.id)

  const estimates = {}
  STRATEGIES.forEach((strategy) => {
    const placement = placementOf(strategy)
    estimates[strategy] = placement
      ? estimateAccessTime(strategy, placement.positions, timing)
      : null
  })
  const best = STRATEGIES.filter((s) => estimates[s]).sort(
    (a, b) => estimates[a].total - estimates[b].total,
  )[0]

  const clearAnimations = async () => {
    STRATEGIES.forEach((strategy) => animations[strategy].reset())
    await sleep(40)
  }

  const loadPreset = async (scenarioId) => {
    await clearAnimations()
    const next = buildScenario(scenarioId, diskSize)
    setDisks(next.disks)
    setStatus(next.status)
    setFiles(next.files)
    setSelectedId(next.files[0]?.id ?? '')
    setActivePreset(scenarioId)
    setBaseScenario(scenarioId)
    setEditorRevision((value) => value + 1)
  }

  // aplica a mesma operação nos três discos; cada um guarda seu resultado
  const applyToAll = (operation) => {
    const nextDisks = {}
    const nextStatus = {}
    let anyOk = false
    STRATEGIES.forEach((strategy) => {
      const result = operation(disks[strategy])
      nextDisks[strategy] = result.disk
      nextStatus[strategy] = result.ok ? null : result.message
      anyOk ||= result.ok
    })
    return { nextDisks, nextStatus, anyOk }
  }

  const handleCreate = (file) => {
    const { nextDisks, nextStatus, anyOk } = applyToAll((disk) =>
      allocateFile(disk, file),
    )
    if (!anyOk) return nextStatus.chained ?? 'Não foi possível criar.'
    clearAnimations()
    setDisks(nextDisks)
    setStatus(nextStatus)
    setFiles((current) => [...current, file])
    setSelectedId(file.id)
    setActivePreset('')
    return true
  }

  const handleUpdate = (file) => {
    const { nextDisks, nextStatus, anyOk } = applyToAll((disk) =>
      disk.directory.some((entry) => entry.file.id === file.id)
        ? updateFile(disk, file)
        : // se antes não coube nesse disco, tenta de novo com o tamanho novo
          allocateFile(disk, file),
    )
    if (!anyOk) return nextStatus.chained ?? 'Não foi possível realocar.'
    clearAnimations()
    setDisks(nextDisks)
    setStatus(nextStatus)
    setFiles((current) =>
      current.map((item) => (item.id === file.id ? file : item)),
    )
    setSelectedId(file.id)
    setActivePreset('')
    return true
  }

  const handleDelete = (fileId) => {
    clearAnimations()
    const next = {}
    STRATEGIES.forEach((strategy) => {
      next[strategy] = removeFile(disks[strategy], fileId)
    })
    const remaining = files.filter((file) => file.id !== fileId)
    setDisks(next)
    setStatus({})
    setFiles(remaining)
    setSelectedId(remaining[0]?.id ?? '')
    setActivePreset('')
    setEditorRevision((value) => value + 1)
  }

  const handleResize = (size) => {
    clearAnimations()
    const next = {}
    const nextStatus = {}
    STRATEGIES.forEach((strategy) => {
      const result = resizeDisk(disks[strategy], size)
      next[strategy] = result.disk
      nextStatus[strategy] = result.failed.at(-1)?.message ?? null
    })
    setDiskSize(size)
    setDisks(next)
    setStatus(nextStatus)
    setFiles(unionFiles(next, files.map((file) => file.id)))
  }

  const runCompareAccess = async () => {
    if (!selectedFile) return

    await Promise.all(
      STRATEGIES.map(async (strategy) => {
        const placement = placementOf(strategy)
        if (!placement) return
        await animations[strategy].play(
          strategy,
          placement.positions,
          placement.indexBlock,
        )
      }),
    )
  }

  const reset = () => loadPreset(baseScenario)

  return (
    <div className="compare-view lab-layout">
      <aside className="lab-sidebar">
        <div className="select-wrap preset-select">
          <select
            className="cursor-pointer"
            value={activePreset}
            disabled={busy}
            aria-label="Selecione um exemplo"
            onChange={(event) => {
              if (!event.target.value) return
              loadPreset(event.target.value)
            }}
          >
            <option value="" disabled>
              Selecione um exemplo
            </option>
            {DEMO_SCENARIOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>

        <FileEditor
          key={editorRevision}
          files={files}
          selectedId={selectedFile?.id}
          busy={busy}
          onSelect={(id) => {
            clearAnimations()
            setSelectedId(id)
          }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />

        <SettingsPanel
          diskSize={diskSize}
          timingPreset={timingPreset}
          busy={busy}
          onDiskSizeChange={handleResize}
          onTimingPresetChange={(presetId) => {
            clearAnimations()
            setTimingPreset(presetId)
          }}
        />
      </aside>

      <section className="lab-stage compare-stage">
        <div className="lab-stage-card">
          <div className="disk-heading stage-toolbar">
            <span className="disk-status">
              Comparando: <strong>{selectedFile?.name ?? '—'}</strong>
            </span>

            <div className="stage-actions">
              <button
                className="stage-btn stage-btn-primary"
                type="button"
                onClick={runCompareAccess}
                disabled={busy || !selectedFile}
              >
                <Play size={16} />
                Iniciar simulação
              </button>
              <button
                className="stage-btn"
                type="button"
                onClick={reset}
                disabled={busy}
              >
                <RotateCcw size={16} />
                Reiniciar
              </button>
            </div>
          </div>
        </div>

        <div className="compare-stack">
          {STRATEGIES.map((strategy) => {
            const detail = STRATEGY_DETAILS[strategy]
            const anim = animations[strategy]
            const estimate = estimates[strategy]
            const missing = selectedFile && !estimate

            return (
              <article
                key={strategy}
                className={`compare-card${best === strategy ? ' best' : ''}`}
              >
                <header className="compare-card-head">
                  <div>
                    <h3>{detail.title}</h3>
                    <p>{detail.short}</p>
                  </div>
                  <div className="compare-time">
                    <span>Tempo</span>
                    <strong>{estimate ? estimate.total : '—'}</strong>
                  </div>
                </header>

                <DiskStats strategy={strategy} stats={views[strategy].stats} />

                {(status[strategy] || missing) && (
                  <p className="compare-alert">
                    <AlertTriangle size={13} />
                    {status[strategy] ??
                      `${selectedFile.name} não está neste disco.`}
                  </p>
                )}

                <DiskGrid
                  fluid
                  columns={12}
                  blocks={disks[strategy].blocks}
                  activeBlocks={anim.activeBlocks}
                  trailBlocks={anim.trailBlocks}
                  label={`Disco ${detail.title}`}
                />
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
