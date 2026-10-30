/**
 * Quote Deck, adapted from VengeanceUI's TestimonialsCard (MIT, github.com/Ashutoshx7/VengeanceUI).
 * Changes for JazzRoc: photos replaced by postcard-style quote cards (we have no family photos),
 * framer-motion swapped for motion/react, shorter motion, reduced-motion fallback, 48px controls,
 * screen readers get the active quote only.
 */
import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const ROTATIONS = [4, -2, -7, 6, -3]
const EASE_OUT = [0.22, 1, 0.36, 1]

export default function QuoteDeck({ items }) {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const reduce = useReducedMotion()
  if (!items?.length) return null
  const current = items[active]

  function go(step) {
    setDirection(step)
    setActive((i) => (i + step + items.length) % items.length)
  }

  return (
    <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="relative mx-auto aspect-[5/4] w-full max-w-md" style={{ perspective: '1400px' }} aria-hidden>
        {items.map((item, index) => {
          const offset = index - active
          const isActive = offset === 0
          const rest = {
            x: offset * 14,
            y: Math.abs(offset) * 6,
            scale: 0.9 - Math.abs(offset) * 0.03,
            rotateZ: ROTATIONS[index % ROTATIONS.length],
            opacity: 0.6,
            zIndex: 10 - Math.abs(offset),
          }
          return (
            <motion.div
              key={item.id}
              className="absolute inset-0 flex flex-col justify-between rounded-2xl border-[6px] border-key bg-[#fdf8ec] p-6 shadow-[var(--shadow-lift)] sm:p-8"
              initial={false}
              animate={
                isActive
                  ? reduce
                    ? { x: 0, y: 0, scale: 1, rotateZ: 0, opacity: 1, zIndex: 100 }
                    : { x: [rest.x, direction === 1 ? -120 : 120, 0], y: 0, scale: [0.9, 1.03, 1], rotateZ: [rest.rotateZ, -3, 0], opacity: 1, zIndex: 100 }
                  : rest
              }
              transition={{ duration: reduce ? 0 : 0.5, ease: EASE_OUT }}
            >
              <span className="font-display text-6xl leading-none text-lagoon">“</span>
              <p className="font-display text-xl leading-snug text-deep sm:text-2xl">{item.quote}</p>
              <span className="text-sm text-deep-soft">Postcard from the crew</span>
            </motion.div>
          )
        })}
      </div>

      <div>
        <div aria-live="polite" className="min-h-40">
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={current.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              <blockquote className="text-lg md:sr-only">“{current.quote}”</blockquote>
              <figcaption className="mt-4 md:mt-0">
                <span className="block font-display text-2xl">{current.name}</span>
                <span className="block text-deep-soft">{current.role}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button type="button" onClick={() => go(-1)} className="btn btn-quiet size-12 p-0" aria-label="Previous quote">
            <ChevronLeft aria-hidden size={22} />
          </button>
          <button type="button" onClick={() => go(1)} className="btn btn-quiet size-12 p-0" aria-label="Next quote">
            <ChevronRight aria-hidden size={22} />
          </button>
          <span className="ml-2 tabular-nums text-deep-soft">
            {active + 1} of {items.length}
          </span>
        </div>
      </div>
    </div>
  )
}
