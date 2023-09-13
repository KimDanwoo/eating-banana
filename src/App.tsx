import { useCallback, useEffect, useRef } from 'react'
import ControlButtons from './components/ControlButtons'
import useGameLogic from './hooks/useGameLogic'

interface ItemPos {
  x: number
  y: number
  w: number
  h: number
}

export default function CanvasGame() {
  const {
    state,
    setState,
    score,
    posRef,
    keyRef,
    minionRef,
    bananaRef,
    bananaSizeRef,
    updateMinionPos,
    createBanana,
    updateBananaPos,
    deleteBanana,
    catchBanana,
    initialGame,
  } = useGameLogic()

  const ref = useRef<HTMLCanvasElement>(null)

  const drawImage = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      { x, y, w, h }: ItemPos
    ) => {
      ctx.drawImage(img, x, y, w, h)
    },
    []
  )

  const loadImage = useCallback(
    (src: string) =>
      new Promise<HTMLImageElement>((resolve) => {
        const img = new Image()
        img.src = src
        img.onload = () => resolve(img)
      }),
    []
  )

  useEffect(() => {
    const cvs = ref.current
    const ctx = cvs?.getContext('2d')
    state === 'stop' && ctx && initialGame(ctx)
    if (!cvs || !ctx || state !== 'play') return
    !minionRef.current &&
      loadImage(require('./images/Pikachu.png')).then((img) => {
        ;(minionRef as any).current = img
        const w = img.width
        const h = img.height
        posRef.current.minion = {
          x: W / 2 - w / 2,
          y: H - h,
          w,
          h,
        }
      })
    !bananaRef.current &&
      loadImage(require('./images/banana.png')).then((img) => {
        ;(bananaRef as any).current = img
        bananaSizeRef.current.w = img.width
        bananaSizeRef.current.h = img.height
      })
    let timer: number | undefined
    let rafTimer: number | undefined
    const pos = posRef.current
    const animate = () => {
      const minion = minionRef.current
      const banana = bananaRef.current
      ctx.clearRect(0, 0, W, H)
      if (minion) {
        updateMinionPos(pos.minion)
        drawImage(ctx, minion, pos.minion)
      }
      if (banana) {
        pos.bananas.forEach((bananaPos, index) => {
          updateBananaPos(bananaPos, index)
          drawImage(ctx, banana, bananaPos)
        })
        pos.bananas.forEach((bananaPos, index) => {
          if (bananaPos.y >= H) {
            deleteBanana(index)
          } else {
            catchBanana(bananaPos, index)
          }
        })
      }
      rafTimer = requestAnimationFrame(animate)
    }
    rafTimer = requestAnimationFrame(animate)
    timer = window.setInterval(createBanana, CREATE_BANANA_TIME)
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      keyRef.current.isLeft = key === 'a' || key === 'arrowleft'
      keyRef.current.isRight = key === 'd' || key === 'arrowright'
    }
    const onKeyUp = () => {
      keyRef.current.isLeft = false
      keyRef.current.isRight = false
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      timer && window.clearInterval(timer)
      timer = undefined
      rafTimer && cancelAnimationFrame(rafTimer)
      rafTimer = undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state,
    drawImage,
    loadImage,
    updateMinionPos,
    createBanana,
    updateBananaPos,
    deleteBanana,
    catchBanana,
    initialGame,
  ])

  return (
    <>
      <ControlButtons
        onPlay={() => setState('play')}
        onPause={() => setState('pause')}
        onStop={() => setState('stop')}
        score={score}
      />
      <canvas
        ref={ref}
        width={W}
        height={H}
        style={{
          display: 'block',
          margin: '0 auto',
          border: 'solid 1px black',
        }}
      />
    </>
  )
}

const W = 600
const H = 600
const CREATE_BANANA_TIME = 500
