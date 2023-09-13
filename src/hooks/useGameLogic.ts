import { useState, useRef, useCallback } from 'react'

interface ItemPos {
  x: number
  y: number
  w: number
  h: number
}

const useGameLogic = () => {
  const [state, setState] = useState<'play' | 'pause' | 'stop'>('stop')
  const [score, setScore] = useState(0)

  const minionRef = useRef<HTMLImageElement>(null)
  const bananaRef = useRef<HTMLImageElement>(null)
  const bananaSizeRef = useRef({ w: 0, h: 0 })

  const posRef = useRef<{
    bananas: ItemPos[]
    bananaAccel: number[]
    minion: ItemPos
  }>({
    bananas: [],
    bananaAccel: [],
    minion: { x: 0, y: 0, w: 0, h: 0 },
  })

  const keyRef = useRef({
    isLeft: false,
    isRight: false,
  })

  const createBanana = useCallback(() => {
    if (!bananaRef.current) return
    const size = bananaSizeRef.current
    posRef.current.bananas.push({
      x: Math.random() * (W - size.w),
      y: -size.h,
      ...size,
    })
    posRef.current.bananaAccel.push(1)
  }, [])

  const blockOverflowPos = useCallback((pos: ItemPos) => {
    pos.x = pos.x + pos.w >= W ? W - pos.w : pos.x < 0 ? 0 : pos.x
    pos.y = pos.y + pos.h >= H ? H - pos.h : pos.y < 0 ? 0 : pos.y
  }, [])

  const updateMinionPos = useCallback(
    (minionPos: ItemPos) => {
      const key = keyRef.current
      if (key.isLeft) minionPos.x -= VELOCITY.minion.left
      if (key.isRight) minionPos.x += VELOCITY.minion.right
      blockOverflowPos(minionPos)
    },
    [blockOverflowPos]
  )

  const updateBananaPos = useCallback((bananaPos: ItemPos, index: number) => {
    const y = bananaPos.y
    const accel = posRef.current.bananaAccel[index]
    posRef.current.bananaAccel[index] = accel + accel * VELOCITY.bananaAccel
    bananaPos.y = y + accel
  }, [])

  const deleteBanana = useCallback((index: number) => {
    posRef.current.bananas.splice(index, 1)
    posRef.current.bananaAccel.splice(index, 1)
  }, [])

  const catchBanana = useCallback(
    (bananaPos: ItemPos, index: number) => {
      const minionPos = posRef.current.minion
      if (
        minionPos.x + minionPos.w >= bananaPos.x &&
        minionPos.x <= bananaPos.x + bananaPos.w &&
        minionPos.y + minionPos.h >= bananaPos.y &&
        minionPos.y <= bananaPos.y + bananaPos.h
      ) {
        deleteBanana(index)
        setScore((prevScore) => prevScore + BANANA_SCORE)
      }
    },
    [deleteBanana]
  )

  const initialGame = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, W, H)
    const { w, h } = posRef.current.minion
    posRef.current.bananaAccel = []
    posRef.current.bananas = []
    posRef.current.minion = {
      x: W / 2 - w / 2,
      y: H - h,
      w,
      h,
    }
    keyRef.current.isLeft = false
    keyRef.current.isRight = false
    setScore(0)
  }, [])

  return {
    state,
    score,
    posRef,
    keyRef,
    minionRef,
    bananaRef,
    bananaSizeRef,
    setState,
    setScore,
    updateMinionPos,
    createBanana,
    updateBananaPos,
    deleteBanana,
    catchBanana,
    initialGame,
  }
}

export default useGameLogic

const W = 600
const H = 600
const VELOCITY = {
  minion: {
    left: 8,
    right: 8,
  },
  bananaAccel: 0.02,
}
const BANANA_SCORE = 50
