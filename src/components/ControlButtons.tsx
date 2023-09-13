import React from 'react'

interface Props {
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  score: number
}

const ControlButtons: React.FC<Props> = ({
  onPlay,
  onPause,
  onStop,
  score,
}) => {
  return (
    <div style={{ margin: '10px auto', textAlign: 'center' }}>
      <button type="button" onClick={onPause}>
        PAUSE
      </button>
      <button type="button" onClick={onPlay}>
        PLAY
      </button>
      <button type="button" onClick={onStop}>
        STOP
      </button>
      <p>현재 점수: {score}</p>
    </div>
  )
}

export default ControlButtons
