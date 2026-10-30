// The archipelago: an SVG sea chart with one island per course.
// Layout (positions, sizes, coastline seeds) lives here because it is presentation, not data.
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { animate, createScope, stagger, svg } from 'animejs'
import { PirateShip } from './PirateShip'
import { Award, BookOpen, Check, Compass, FileMusic, Layers, Lock, Mountain, Music, Sailboat, Tv } from 'lucide-react'

const W = 1000
const H = 620

const LAYOUT = {
  'melody-island': { x: 150, y: 430, r: 78, seed: 3 },
  'harmony-island': { x: 360, y: 320, r: 54, seed: 11 },
  'notation-island': { x: 225, y: 160, r: 50, seed: 7 },
  'fundamentals-island': { x: 470, y: 125, r: 58, seed: 19 },
  'songbook-island': { x: 645, y: 290, r: 56, seed: 5 },
  'captains-tv-themes': { x: 525, y: 480, r: 46, seed: 23 },
  'practice-cave': { x: 790, y: 470, r: 50, seed: 13 },
  'exam-island': { x: 850, y: 180, r: 64, seed: 29 },
}

const ICONS = { music: Music, layers: Layers, 'file-music': FileMusic, compass: Compass, 'book-open': BookOpen, tv: Tv, mountain: Mountain, award: Award }

// Palette only: tokens and their tints
const DEEP = '#0e2a47'
const LOCKED_LAND = '#46607a' // deep-soft
const LOCKED_RIM = '#8a9bad' // deep-soft tint
const SAND = '#f7dfa3' // doubloon tint

// Light islands get dark icons so the icon stays visible
function isLight(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 160
}

// Wave marks scattered on open water
const WAVES = [
  [120, 270], [600, 60], [700, 400], [930, 330], [400, 560], [290, 520], [960, 560], [80, 590],
]

// Deterministic random so coastlines look hand drawn but never change between renders
function seeded(seed) {
  let s = seed * 9301 + 49297
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280)
}

// Smooth closed curve through points (Catmull-Rom converted to cubic Béziers)
function smoothPath(pts, closed = true) {
  const n = pts.length
  const at = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))])
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return closed ? d + 'Z' : d
}

function coastline(x, y, r, seed) {
  const rand = seeded(seed)
  const count = 10
  const pts = Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + rand() * 0.35
    const rr = r * (0.82 + rand() * 0.3)
    return [x + Math.cos(a) * rr * 1.18, y + Math.sin(a) * rr * 0.86]
  })
  return smoothPath(pts)
}

// Depth soundings scattered across open water, like a real chart
const SOUNDINGS = Array.from({ length: 34 }, (_, i) => {
  const rand = seeded(i + 101)
  return { x: 30 + rand() * (W - 60), y: 30 + rand() * (H - 60), n: Math.round(8 + rand() * 40) }
}).filter((s) => Object.values(LAYOUT).every((l) => Math.hypot(s.x - l.x, s.y - l.y) > l.r * 1.9))

function stateLine(island) {
  switch (island.state) {
    case 'locked':
      return 'Locked'
    case 'complete':
      return 'Complete'
    case 'open':
      return 'Open to explore'
    case 'in progress':
      return `${island.completeCount} of ${island.lessonCount} lessons`
    default:
      return 'Not started'
  }
}

// linkTo(island) returns where an island goes when clicked; pass null for a read-only map (parents, tutors).
export default function IslandMap({ islands, currentSlug, linkTo = (island) => `/app/island/${island.slug}` }) {
  const rootRef = useRef(null)
  const scrollRef = useRef(null)
  const ordered = [...islands].sort((a, b) => a.order - b.order)
  const route = smoothPath(
    ordered.map((i) => [LAYOUT[i.slug].x, LAYOUT[i.slug].y]),
    false,
  )
  const ship = currentSlug && LAYOUT[currentSlug]

  // On narrow screens the chart scrolls sideways; start it with the ship in view
  useEffect(() => {
    const el = scrollRef.current
    if (!el || !ship || el.scrollWidth <= el.clientWidth) return
    el.scrollLeft = (ship.x / W) * el.scrollWidth - el.clientWidth / 2
  }, [ship])

  // Intro: the route draws itself and islands surface in voyage order.
  // Once per browser session; the map is visited often, so it shouldn't replay every time.
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem('jazzroc-map-intro') === '1'
      sessionStorage.setItem('jazzroc-map-intro', '1')
    } catch {
      // storage blocked: just play it
    }
    if (seen) return
    const scope = createScope({ root: rootRef, mediaQueries: { reduce: '(prefers-reduced-motion: reduce)' } }).add((self) => {
      if (self.matches.reduce) return
      animate(svg.createDrawable('.map-route'), { draw: ['0 0', '0 1'], duration: 1600, ease: 'inOut(3)' })
      animate('.island-pop', { opacity: [0, 1], scale: [0.85, 1], duration: 600, delay: stagger(110, { start: 150 }), ease: 'out(4)' })
      animate('.map-ship', { opacity: [0, 1], y: [-14, 0], duration: 500, delay: 1300, ease: 'out(3)' })
    })
    return () => scope.revert()
  }, [])

  return (
    <div ref={rootRef} className="overflow-hidden rounded-[var(--radius-card)] bg-deep shadow-[var(--shadow-lift)]">
      <div ref={scrollRef} className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="island-map block w-full min-w-[760px]" role="group" aria-label="Captain Roc's island map">
          <defs>
            <pattern id="chart-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M50 0H0V50" fill="none" stroke="#eaf4f2" strokeOpacity="0.07" />
            </pattern>
            <pattern id="fog" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <path d="M0 0V10" stroke="#eaf4f2" strokeOpacity="0.35" strokeWidth="3" />
            </pattern>
            <radialGradient id="sea-glow" cx="40%" cy="45%" r="70%">
              <stop offset="0" stopColor="#1b4a6e" /> {/* deep, lifted */}
              <stop offset="1" stopColor="#0e2a47" />
            </radialGradient>
          </defs>

          <rect width={W} height={H} fill="url(#sea-glow)" />
          <rect width={W} height={H} fill="url(#chart-grid)" />

          <g aria-hidden fill="#eaf4f2" fillOpacity="0.28" fontSize="13" fontFamily="var(--font-body)">
            {SOUNDINGS.map((s, i) => (
              <text key={i} x={s.x} y={s.y} textAnchor="middle">
                {s.n}
              </text>
            ))}
          </g>

          <g aria-hidden fill="none" stroke="#eaf4f2" strokeOpacity="0.3" strokeWidth="2.5" strokeLinecap="round">
            {WAVES.map(([wx, wy], i) => (
              <path key={i} d={`M${wx - 18} ${wy} q9 -8 18 0 t18 0`} />
            ))}
          </g>

          {/* Compass rose */}
          <g aria-hidden transform="translate(70 80)" stroke="#eaf4f2" strokeOpacity="0.5" fill="none">
            <circle r="34" />
            <circle r="26" strokeDasharray="2 4" />
            <path d="M0 -44 L7 0 L0 44 L-7 0Z" fill="#eaf4f2" fillOpacity="0.5" stroke="none" />
            <path d="M-44 0 L0 -6 L44 0 L0 6Z" fill="#eaf4f2" fillOpacity="0.25" stroke="none" />
            <text y="-50" textAnchor="middle" fill="#eaf4f2" fillOpacity="0.7" stroke="none" fontSize="14" fontFamily="var(--font-display)">
              N
            </text>
          </g>

          {/* The dotted route is revealed through a mask, so the draw-in animation can't overwrite its dots */}
          <mask id="route-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
            <path className="map-route" d={route} fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />
          </mask>
          <path d={route} mask="url(#route-reveal)" fill="none" stroke="#f2b53a" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" opacity="0.85" />

          {ordered.map((island) => {
            const { x, y, r, seed } = LAYOUT[island.slug]
            const locked = island.state === 'locked'
            const Icon = locked ? Lock : ICONS[island.icon] ?? Music
            const name = island.name
            const sub = stateLine(island)
            const labelW = Math.max(name.length * 9.6, sub.length * 7.4) + 32
            const labelY = y + r * 0.86 + 18
            return (
              <IslandWrap key={island.id} to={linkTo?.(island)} label={`${name}: ${sub}`}>
                <g className="island-pop">
                  <path d={coastline(x, y, r * 1.45, seed)} fill="#eaf4f2" fillOpacity="0.1" />
                  <g className="island-land">
                    <path d={coastline(x, y, r * 1.12, seed)} fill={locked ? LOCKED_RIM : SAND} />
                    <path d={coastline(x, y, r, seed)} fill={locked ? LOCKED_LAND : island.themeColour} />
                    <path d={coastline(x - r * 0.2, y - r * 0.15, r * 0.45, seed + 1)} fill="#ffffff" fillOpacity="0.16" />
                    {locked && <path d={coastline(x, y, r, seed)} fill="url(#fog)" />}
                    <Icon x={x - 16} y={y - 20} width={32} height={32} color={!locked && isLight(island.themeColour) ? DEEP : '#ffffff'} strokeWidth={2} aria-hidden />
                    {island.slug === 'exam-island' && !locked && <TreasureMark x={x + r * 0.5} y={y + r * 0.35} />}
                    {island.state === 'complete' && (
                      <g transform={`translate(${x + r * 0.55} ${y - r * 0.75})`} aria-hidden>
                        <path d="M0 0V-34" stroke="#0e2a47" strokeWidth="3" />
                        <path d="M0 -34L22 -27L0 -20Z" fill="#f2b53a" />
                      </g>
                    )}
                  </g>
                  <circle className="island-focus" cx={x} cy={y} r={r * 1.35} fill="none" stroke="#f2b53a" strokeWidth="4" />
                  <g transform={`translate(${x} ${labelY})`}>
                    <rect x={-labelW / 2} y="0" width={labelW} height="50" rx="12" fill="#ffffff" />
                    <text y="22" textAnchor="middle" fill="#0e2a47" fontSize="17" fontFamily="var(--font-display)">
                      {name}
                    </text>
                    <text y="40" textAnchor="middle" fill={locked ? DEEP : '#46607a'} fontSize="13" fontWeight="700" fontFamily="var(--font-body)">
                      {sub}
                    </text>
                  </g>
                </g>
              </IslandWrap>
            )
          })}

          {ship && (
            <g className="map-ship" aria-hidden>
              <g transform={`translate(${ship.x + ship.r * 0.95} ${ship.y - ship.r * 0.95})`}>
                <g className="ship-bob">
                  <PirateShip />
                </g>
              </g>
            </g>
          )}
        </svg>
      </div>
      <p className="on-deep flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-key/10 px-5 py-3 text-sm text-foam/85">
        <span className="flex items-center gap-2">
          <Sailboat aria-hidden size={16} /> Red ship: you are here
        </span>
        <span className="flex items-center gap-2">
          <Check aria-hidden size={16} /> Gold flag: island complete
        </span>
        <span className="flex items-center gap-2">
          <Lock aria-hidden size={16} /> Locked: needs a course or an earlier module
        </span>
      </p>
    </div>
  )
}

// "X marks the spot" with a little treasure chest, for Exam Island
function TreasureMark({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden>
      <path d="M-9 -9L9 9M9 -9L-9 9" stroke="#d93f4c" strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(18 -2)">
        <rect x="0" y="-6" width="20" height="14" rx="2" fill={DEEP} />
        <path d="M0 -6Q10 -16 20 -6Z" fill={DEEP} />
        <rect x="2" y="-3" width="16" height="9" rx="1" fill="#f2b53a" />
        <rect x="8.5" y="-5" width="3" height="5" fill={DEEP} />
      </g>
    </g>
  )
}

function IslandWrap({ to, label, children }) {
  if (!to) {
    return (
      <g role="img" aria-label={label}>
        {children}
      </g>
    )
  }
  return (
    <Link to={to} className="island-link" aria-label={label}>
      {children}
    </Link>
  )
}
