// A shower of gold doubloons for big moments (finishing a lesson, earning treasure).
// Bump `trigger` to fire it. Decorative only; the words that go with it carry the meaning.
import { useEffect, useRef } from 'react'
import { animate, createScope, random } from 'animejs'
import { Music } from 'lucide-react'

const COINS = 16

export default function CoinBurst({ trigger }) {
  const root = useRef(null)

  useEffect(() => {
    if (!trigger) return
    const scope = createScope({ root, mediaQueries: { reduce: '(prefers-reduced-motion: reduce)' } }).add((self) => {
      if (self.matches.reduce) return
      animate('.burst-coin', {
        opacity: [{ to: 1, duration: 80 }, { to: 0, delay: 650, duration: 300 }],
        x: () => [0, random(-170, 170)],
        y: () => [0, random(-200, -70)],
        rotate: () => [0, random(-360, 360)],
        scale: () => [0.4, random(0.8, 1.3, 2)],
        duration: 1000,
        ease: 'out(3)',
      })
    })
    return () => scope.revert()
  }, [trigger])

  return (
    <div ref={root} aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible">
      {Array.from({ length: COINS }, (_, i) => (
        <span
          key={i}
          className="burst-coin col-start-1 row-start-1 grid size-7 place-items-center rounded-full border-2 border-[#c58a1f] bg-doubloon text-deep opacity-0"
        >
          <Music size={13} strokeWidth={2.5} />
        </span>
      ))}
    </div>
  )
}
