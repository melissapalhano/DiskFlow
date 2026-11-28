import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  allocateFile,
  diskStats,
  getPlacements,
  removeFile,
  resizeDisk,
  runOperations,
  sleep,
  updateFile as updateFileOnDisk,
} from './allocation.js'
import {
  DEFAULT_DISK_SIZE,
  DEFAULT_TIMING,
  DEMO_SCENARIOS,
  STRATEGY_DETAILS,
} from './constants.js'
import { buildTimedAccessSteps, estimateAccessTime } from './timing.js'
import { TIMING_PRESETS } from './timingPresets.js'

const ANIM_STEP_MS = 480
const DEFAULT_SCENARIO = 'basic'

/**
 * monta o disco de um cenário de exemplo.
 * @param {string} scenarioId id do cenário
 * @param {string} strategy técnica de alocação
 * @param {number} size tamanho do disco
 * @returns {{ disk: object, log: string[], failed: object[] }}
 */
function buildScenario(scenarioId, strategy, size) {
  const scenario = DEMO_SCENARIOS.find((item) => item.id === scenarioId)
  return runOperations(size, strategy, scenario?.operations ?? [])
}

/**
 * estado e ações do simulador de uma técnica só. o disco é persistente:
 * criar, editar ou remover parte sempre do estado atual.
 * @param {'contiguous' | 'chained' | 'indexed'} strategy técnica da aba
 * @returns {object} dados do disco, do arquivo selecionado e as ações da tela
 */
export function useSimulation(strategy) {
  const detail = STRATEGY_DETAILS[strategy]
  const [diskSize, setDiskSize] = useState(DEFAULT_DISK_SIZE)
  const [timingPreset, setTimingPreset] = useState('balanced')
  const timing = TIMING_PRESETS[timingPreset]?.values ?? DEFAULT_TIMING
  const [disk, setDisk] = useState(
    () => buildScenario(DEFAULT_SCENARIO, strategy, DEFAULT_DISK_SIZE).disk,
  )
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState(
    'Configure o disco, adicione arquivos e inicie a simulação.',
  )
  const [allocating, setAllocating] = useState([])
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(null)
  const [lastEstimate, setLastEstimate] = useState(null)
  const [editorRevision, setEditorRevision] = useState(0)
  const [activePreset, setActivePreset] = useState(DEFAULT_SCENARIO)
  // cenário de onde o disco partiu; é para ele que o reiniciar volta
  const [baseScenario, setBaseScenario] = useState(DEFAULT_SCENARIO)
  const cancelRef = useRef(false)

  useEffect(() => {
    return () => {
      cancelRef.current = true
    }
  }, [])

  const placements = useMemo(() => getPlacements(disk), [disk])
  const files = useMemo(() => placements.map((item) => item.file), [placements])
  const stats = useMemo(() => diskStats(disk), [disk])

  const selectedPlacement =
    placements.find((item) => item.file.id === selectedId) ?? placements[0]

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

  // carrega um cenário do zero; o resultado da última operação vira a mensagem
  const applyScenario = (scenarioId, size) => {
    resetAnimation()
    const { disk: next, log } = buildScenario(scenarioId, strategy, size)
    setDisk(next)
    setSelectedId(next.directory[0]?.file.id ?? '')
    setAllocating([])
    setLastEstimate(null)
    setActivePreset(scenarioId)
    setBaseScenario(scenarioId)
    setEditorRevision((value) => value + 1)
    setMessage(log.at(-1) ?? '')
  }

  const changeDiskSize = (nextSize) => {
    resetAnimation()
    const size = Number(nextSize)
    const { disk: next, failed } = resizeDisk(disk, size)
    setDiskSize(size)
    setDisk(next)
    setAllocating([])
    setLastEstimate(null)
    setMessage(
      failed.length
        ? `Disco com ${size} blocos. Ficaram de fora: ${failed.map((f) => f.file.name).join(', ')}.`
        : `Disco com ${size} blocos.`,
    )
  }

  const changeTimingPreset = useCallback(
    (presetId) => {
      resetAnimation()
      setTimingPreset(presetId)
    },
    [resetAnimation],
  )

  // mostra os blocos novos acendendo um a um e só depois grava o disco
  const animateAllocation = async (nextDisk, file) => {
    const positions = nextDisk.blocks.flatMap((cell, index) =>
      cell?.file.id === file.id && cell !== disk.blocks[index] ? [index] : [],
    )
    setAllocating([])
    for (const block of positions) {
      setAllocating((current) => [...current, block])
      setMessage(`Alocando ${file.name}: bloco ${block + 1}…`)
      await sleep(220)
    }
    setDisk(nextDisk)
    setSelectedId(file.id)
    setAllocating([])
  }

  // devolve true ou o texto do erro, que o formulário exibe
  const createFile = async (file) => {
    resetAnimation()
    const result = allocateFile(disk, file)
    if (!result.ok) {
      setMessage(result.message)
      return result.message
    }
    await animateAllocation(result.disk, file)
    setMessage(result.message)
    setLastEstimate(null)
    setActivePreset('')
    return true
  }

  const updateFile = async (file) => {
    resetAnimation()
    const result = updateFileOnDisk(disk, file)
    if (!result.ok) {
      setMessage(result.message)
      return result.message
    }
    await animateAllocation(result.disk, file)
    setMessage(result.message)
    setLastEstimate(null)
    setActivePreset('')
    return true
  }

  const deleteFile = (fileId) => {
    resetAnimation()
    const removed = files.find((file) => file.id === fileId)
    const next = removeFile(disk, fileId)
    setDisk(next)
    setSelectedId(next.directory[0]?.file.id ?? '')
    setLastEstimate(null)
    setActivePreset('')
    setMessage(
      next.directory.length
        ? `${removed?.name ?? 'Arquivo'} removido.`
        : 'Disco vazio. Adicione um arquivo para simular.',
    )
  }

  const startSimulation = async () => {
    const target = selectedPlacement
    if (!target) return

    cancelRef.current = true
    await sleep(20)
    cancelRef.current = false

    const { steps, estimate } = buildTimedAccessSteps(
      strategy,
      target.positions,
      timing,
      target.indexBlock,
    )
    setLastEstimate(estimate)
    setMessage(`Iniciando acesso a ${target.file.name}…`)
    setPlaying(true)

    for (const current of steps) {
      if (cancelRef.current) break
      setStep(current)
      await sleep(ANIM_STEP_MS)
    }

    if (!cancelRef.current) {
      setPlaying(false)
      setMessage(
        `Simulação de ${target.file.name} concluída em ${estimate.total} unidades de tempo.`,
      )
    }
  }

  return {
    detail,
    diskSize,
    timing,
    timingPreset,
    files,
    blocks: disk.blocks,
    placements,
    selectedPlacement,
    stats,
    freeBlocks: stats.freeBlocks,
    occupied: diskSize - stats.freeBlocks,
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
    loadPreset: (scenarioId) => applyScenario(scenarioId, diskSize),
    reset: () => applyScenario(baseScenario, diskSize),
    activePreset,
    editorRevision,
  }
}
