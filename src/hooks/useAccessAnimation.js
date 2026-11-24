import { useCallback, useEffect, useRef, useState } from 'react'
import {
  DEFAULT_TIMING,
  buildTimedAccessSteps,
  sleep,
} from '../simulation/index.js'

const STEP_MS = 480

export function useAccessAnimation(timing = DEFAULT_TIMING) {
  const [playing, setPlaying] = useState(false)
  const [step, setStep] = useState(null)
  const cancelRef = useRef(false)
  const timingRef = useRef(timing)

  useEffect(() => {
    timingRef.current = timing
  }, [timing])

  useEffect(() => {
    return () => {
      cancelRef.current = true
    }
  }, [])

  const stop = useCallback(() => {
    cancelRef.current = true
    setPlaying(false)
  }, [])

  const reset = useCallback(() => {
    cancelRef.current = true
    setPlaying(false)
    setStep(null)
  }, [])

  const play = useCallback(async (strategy, positions) => {
    cancelRef.current = true
    await sleep(30)
    cancelRef.current = false

    const { steps } = buildTimedAccessSteps(
      strategy,
      positions,
      timingRef.current,
    )
    if (!steps.length) {
      setStep(null)
      setPlaying(false)
      return
    }

    setPlaying(true)

    for (const current of steps) {
      if (cancelRef.current) break
      setStep(current)
      await sleep(STEP_MS)
    }

    if (!cancelRef.current) {
      setPlaying(false)
    }
  }, [])

  return {
    playing,
    step,
    play,
    stop,
    reset,
    activeBlocks: step?.active ?? [],
    trailBlocks: step?.trail ?? [],
    showIndex: Boolean(step?.showIndex),
  }
}
