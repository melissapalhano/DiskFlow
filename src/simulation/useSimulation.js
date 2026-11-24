import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  countFreeBlocks,
  getFilePositions,
  hasContiguousSpace,
  planAllocation,
  sleep,
} from './allocation.js'
import {
  DEFAULT_DISK_SIZE,
  DEFAULT_TIMING,
  DEMO_SCENARIOS,
  STRATEGY_DETAILS,
} from './constants.js'
import {
  cloneInitialFiles,
  fitFilesToDisk,
  withFileIds,
} from './files.js'
import { buildTimedAccessSteps, estimateAccessTime } from './timing.js'
import { TIMING_PRESETS } from './timingPresets.js'

const ANIM_STEP_MS = 480

export function useSimulation(strategy) {
  const detail = STRATEGY_DETAILS[strategy]
  const [diskSize, setDiskSize] = useState(DEFAULT_DISK_SIZE)
  const [timingPreset, setTimingPreset] = useState('equilibrado')
  const timing =
    TIMING_PRESETS[timingPreset]?.values ?? DEFAULT_TIMING
  const [files, setFiles] = useState(() => cloneInitialFiles())
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState(
    'Configure o disco, adicione arquivos e inicie a simulação.',
  )
  const [allocating, setAllocating] = useState([])
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(null)
  const [lastEstimate, setLastEstimate] = useState(null)
  const [editorRevision, setEditorRevision] = useState(0)
  const [activePreset, setActivePreset] = useState('')
  const cancelRef = useRef(false)

  useEffect(() => {
    return () => {
      cancelRef.current = true
    }
  }, [])

  const { blocks, placements } = useMemo(
    () => planAllocation(files, strategy, diskSize),
    [files, strategy, diskSize],
  )

  const selectedPlacement =
    placements.find((item) => item.file.id === selectedId) ?? placements[0]

  const freeBlocks = countFreeBlocks(blocks)
  const occupied = diskSize - freeBlocks

  const previewEstimate = useMemo(() => {
    const positions = selectedPlacement?.positions ?? []
    return estimateAccessTime(strategy, positions, timing)
  }, [selectedPlacement, strategy, timing])

  const stop = useCallback(() => {
    cancelRef.current = true
    setPlaying(false)
  }, [])

  const resetAnimation = useCallback(() => {
    cancelRef.current = true
    setPlaying(false)
    setStep(null)
  }, [])

  const changeDiskSize = useCallback(
    (nextSize) => {
      resetAnimation()
      const size = Number(nextSize)
      setDiskSize(size)
      setFiles((current) => fitFilesToDisk(current, size))
      setAllocating([])
      setLastEstimate(null)
    },
    [resetAnimation],
  )

  const changeTimingPreset = useCallback(
    (presetId) => {
      resetAnimation()
      setTimingPreset(presetId)
    },
    [resetAnimation],
  )

  const animateAllocation = async (nextFiles, file) => {
    const planned = planAllocation(nextFiles, strategy, diskSize)
    const positions =
      planned.placements.find((item) => item.file.id === file.id)?.positions ??
      []

    setAllocating([])
    for (const block of positions) {
      setAllocating((current) => [...current, block])
      setMessage(`Alocando ${file.name}: bloco ${block + 1}…`)
      await sleep(220)
    }
    setFiles(nextFiles)
    setSelectedId(file.id)
    setAllocating([])
  }

  const createFile = async (file) => {
    resetAnimation()
    const canFit =
      strategy !== 'contigua' || hasContiguousSpace(blocks, file.blocks)

    if (file.blocks > freeBlocks || !canFit) {
      setMessage(
        strategy === 'contigua'
          ? 'Sem sequência contínua suficiente (fragmentação externa).'
          : 'Sem blocos livres o bastante.',
      )
      return false
    }

    await animateAllocation([...files, file], file)
    setMessage(`${file.name} criado (${file.blocks} blocos).`)
    setLastEstimate(null)
    return true
  }

  const updateFile = async (file) => {
    resetAnimation()
    const others = files.filter((item) => item.id !== file.id)
    const trial = planAllocation([...others, file], strategy, diskSize)
    const placed = trial.placements.find((item) => item.file.id === file.id)

    if (!placed || placed.positions.length !== file.blocks) {
      setMessage('Não foi possível realocar com esse tamanho.')
      return false
    }

    await animateAllocation(
      files.map((item) => (item.id === file.id ? file : item)),
      file,
    )
    setMessage(`${file.name} atualizado.`)
    setLastEstimate(null)
    return true
  }

  const deleteFile = (fileId) => {
    resetAnimation()
    const removed = files.find((file) => file.id === fileId)
    const next = files.filter((file) => file.id !== fileId)
    setFiles(next)
    setSelectedId(next[0]?.id ?? '')
    setLastEstimate(null)
    setMessage(
      next.length
        ? `${removed?.name ?? 'Arquivo'} removido.`
        : 'Disco vazio. Adicione um arquivo para simular.',
    )
  }

  const startSimulation = async () => {
    const target = selectedPlacement?.file
    if (!target) return

    const positions = getFilePositions(blocks, target.id)
    cancelRef.current = true
    await sleep(20)
    cancelRef.current = false

    const { steps, estimate } = buildTimedAccessSteps(
      strategy,
      positions,
      timing,
    )
    setLastEstimate(estimate)
    setMessage(`Iniciando acesso a ${target.name}…`)
    setPlaying(true)

    for (const current of steps) {
      if (cancelRef.current) break
      setStep(current)
      await sleep(ANIM_STEP_MS)
    }

    if (!cancelRef.current) {
      setPlaying(false)
      setMessage(
        `Simulação de ${target.name} concluída em ${estimate.total} unidades de tempo.`,
      )
    }
  }

  const loadPreset = (scenarioId) => {
    resetAnimation()
    const scenario = DEMO_SCENARIOS.find((item) => item.id === scenarioId)
    if (!scenario) return
    const next = fitFilesToDisk(
      withFileIds(scenario.files.map((file) => ({ ...file }))),
      diskSize,
    )
    setFiles(next)
    setSelectedId(next[0].id)
    setAllocating([])
    setLastEstimate(null)
    setActivePreset(scenarioId)
    setEditorRevision((value) => value + 1)
    setMessage(`Exemplo “${scenario.title}” carregado.`)
  }

  const reset = () => {
    resetAnimation()
    setFiles(fitFilesToDisk(cloneInitialFiles(), diskSize))
    setSelectedId('')
    setAllocating([])
    setLastEstimate(null)
    setActivePreset('')
    setEditorRevision((value) => value + 1)
    setMessage('')
  }

  return {
    detail,
    diskSize,
    timing,
    timingPreset,
    files,
    blocks,
    placements,
    selectedPlacement,
    freeBlocks,
    occupied,
    message,
    allocating,
    playing,
    step,
    lastEstimate,
    previewEstimate,
    busy: playing || allocating.length > 0,
    changeDiskSize,
    changeTimingPreset,
    selectFile: (id) => {
      resetAnimation()
      setSelectedId(id)
    },
    createFile,
    updateFile,
    deleteFile,
    startSimulation,
    stop,
    loadPreset,
    reset,
    activePreset,
    editorRevision,
  }
}
