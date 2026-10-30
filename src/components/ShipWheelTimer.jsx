// Practice timer drawn as a ship's wheel that turns while the clock runs.
import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'

const SPOKES = Array.from({ length: 8 }, (_, i) => (i * Math.PI) / 4)
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

export default function ShipWheelTimer({ onLog }) {
  const [running, setRunning] = useState(false)
  const [startedAt, setStartedAt] = useState(null)
  const [banked, setBanked] = useState(0) // seconds from earlier runs
  const [, tick] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => tick((n) => n + 1), 250)
    return () => clearInterval(id)
  }, [running])

  const seconds = banked + (running ? Math.floor((Date.now() - startedAt) / 1000) : 0)
  const minutes = Math.max(1, Math.round(seconds / 60))

  function toggle() {
    if (running) {
      setBanked(seconds)
      setRunning(false)
    } else {
      setStartedAt(Date.now())
      setRunning(true)
    }
  }

  function reset() {
    setRunning(false)
    setBanked(0)
  }

  async function log() {
    await onLog(minutes)
    reset()
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <svg viewBox="-60 -60 120 120" className={`ship-wheel size-32 shrink-0 ${running ? 'is-turning' : ''}`} aria-hidden>
        {SPOKES.map((a) => (
          <g key={a} stroke="#0e2a47" strokeLinecap="round">
            <line x1="0" y1="0" x2={Math.cos(a) * 46} y2={Math.sin(a) * 46} strokeWidth="5" />
            <line x1={Math.cos(a) * 46} y1={Math.sin(a) * 46} x2={Math.cos(a) * 56} y2={Math.sin(a) * 56} strokeWidth="9" />
          </g>
        ))}
        <circle r="36" fill="none" stroke="#0e2a47" strokeWidth="7" />
        <circle r="36" fill="none" stroke="#f2b53a" strokeWidth="2.5" />
        <circle r="11" fill="#f2b53a" stroke="#0e2a47" strokeWidth="4" />
      </svg>
      <div className="text-center sm:text-left">
        <p className="font-display text-5xl tabular-nums" role="timer" aria-live="off">
          {fmt(seconds)}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          <button type="button" onClick={toggle} className="btn btn-primary">
            {running ? <Pause aria-hidden size={18} /> : <Play aria-hidden size={18} />}
            {running ? 'Pause' : seconds ? 'Keep going' : 'Start practising'}
          </button>
          {seconds > 0 && (
            <>
              <button type="button" onClick={log} className="btn bg-doubloon text-deep hover:bg-doubloon/80">
                Log {minutes} {minutes === 1 ? 'minute' : 'minutes'}
              </button>
              <button type="button" onClick={reset} className="btn btn-quiet px-3" aria-label="Reset timer">
                <RotateCcw aria-hidden size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
