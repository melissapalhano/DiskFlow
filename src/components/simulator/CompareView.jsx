import { useMemo, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import {
  DEMO_SCENARIOS,
  DEFAULT_DISK_SIZE,
  STRATEGY_DETAILS,
  cloneInitialFiles,
  countFreeBlocks,
  estimateAccessTime,
  fitFilesToDisk,
  getFilePositions,
  planAllocation,
  sleep,
  withFileIds,
} from '../../simulation/index.js'
import { TIMING_PRESETS } from '../../simulation/timingPresets.js'
import { useAccessAnimation } from '../../hooks/useAccessAnimation.js'
import DiskGrid from './DiskGrid.jsx'
import FileEditor from './FileEditor.jsx'
import SettingsPanel from './SettingsPanel.jsx'

const STRATEGIES = ['contiguous', 'chained', 'indexed']

export default function CompareView() {
  const [diskSize, setDiskSize] = useState(DEFAULT_DISK_SIZE)
  const [timingPreset, setTimingPreset] = useState('balanced')
  const timing = TIMING_PRESETS[timingPreset].values
  const [files, setFiles] = useState(() => cloneInitialFiles())
  const [selectedId, setSelectedId] = useState('')
  const [activePreset, setActivePreset] = useState('basic')
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

  const plans = useMemo(() => {
    const map = {}
    STRATEGIES.forEach((strategy) => {
      map[strategy] = planAllocation(files, strategy, diskSize)
    })
    return map
  }, [files, diskSize])

  const freeBlocks = countFreeBlocks(plans.contiguous.blocks)
  const selectedFile = files.find((file) => file.id === selectedId) ?? files[0]

  const rankings = useMemo(() => {
    return STRATEGIES.map((strategy) => {
      const positions = getFilePositions(
        plans[strategy].blocks,
        selectedFile?.id,
      )
      return {
        strategy,
        title: STRATEGY_DETAILS[strategy].title,
        total: estimateAccessTime(strategy, positions, timing).total,
      }
    }).sort((a, b) => a.total - b.total)
  }, [plans, selectedFile, timing])

  const clearAnimations = async () => {
    STRATEGIES.forEach((strategy) => animations[strategy].reset())
    await sleep(40)
  }

  const loadPreset = async (scenarioId) => {
    await clearAnimations()
    const scenario = DEMO_SCENARIOS.find((item) => item.id === scenarioId)
    if (!scenario) return
    const next = fitFilesToDisk(
      withFileIds(scenario.files.map((file) => ({ ...file }))),
      diskSize,
    )
    setFiles(next)
    setSelectedId(next[0].id)
    setActivePreset(scenarioId)
    setEditorRevision((value) => value + 1)
  }

  const handleCreate = (file) => {
    if (file.blocks > freeBlocks) return false
    clearAnimations()
    setFiles((current) => [...current, file])
    setSelectedId(file.id)
    setActivePreset('custom')
    return true
  }

  const handleUpdate = (file) => {
    const others = files.filter((item) => item.id !== file.id)
    const used = others.reduce((sum, item) => sum + item.blocks, 0)
    if (used + file.blocks > diskSize) return false
    clearAnimations()
    setFiles((current) =>
      current.map((item) => (item.id === file.id ? file : item)),
    )
    setSelectedId(file.id)
    setActivePreset('custom')
    return true
  }

  const handleDelete = (fileId) => {
    clearAnimations()
    const next = files.filter((file) => file.id !== fileId)
    setFiles(next)
    setSelectedId(next[0]?.id ?? '')
    setActivePreset('custom')
    setEditorRevision((value) => value + 1)
  }

  const runCompareAccess = async () => {
    if (!selectedFile) return

    await Promise.all(
      STRATEGIES.map(async (strategy) => {
        const positions = getFilePositions(
          plans[strategy].blocks,
          selectedFile.id,
        )
        await animations[strategy].play(strategy, positions)
      }),
    )
  }

  const reset = async () => {
    await loadPreset('basic')
    setEditorRevision((value) => value + 1)
  }

  const gridColumns = diskSize <= 24 ? 12 : 12

  return (
    <div className="compare-view lab-layout">
      <aside className="lab-sidebar">
        <div className="select-wrap preset-select">
          <select
            className="cursor-pointer"
            value={activePreset === 'custom' ? '' : activePreset}
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
          freeBlocks={freeBlocks}
          busy={busy}
          onSelect={(id) => {
            clearAnimations()
            setSelectedId(id)
            setActivePreset('custom')
          }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />

        <SettingsPanel
          diskSize={diskSize}
          timingPreset={timingPreset}
          busy={busy}
          onDiskSizeChange={(size) => {
            clearAnimations()
            setDiskSize(size)
            setFiles((current) => fitFilesToDisk(current, size))
          }}
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
            const plan = plans[strategy]
            const anim = animations[strategy]
            const placement = plan.placements.find(
              (item) => item.file.id === selectedFile?.id,
            )
            const estimate = estimateAccessTime(
              strategy,
              placement?.positions ?? [],
              timing,
            )
            const isBest = rankings[0]?.strategy === strategy

            return (
              <article
                key={strategy}
                className={`compare-card${isBest ? ' best' : ''}`}
              >
                <header className="compare-card-head">
                  <div>
                    <h3>{detail.title}</h3>
                    <p>{detail.short}</p>
                  </div>
                  <div className="compare-time">
                    <span>Tempo</span>
                    <strong>{estimate.total}</strong>
                  </div>
                </header>

                <DiskGrid
                  fluid
                  columns={gridColumns}
                  blocks={plan.blocks}
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
