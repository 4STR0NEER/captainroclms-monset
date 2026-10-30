import { useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Anchor, Lock, Telescope } from 'lucide-react'
import { Loading, PlaceholderTag } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { getSongs, getStudentMap } from '../../services/courses'

const COLLECTIONS = [
  { id: 'songbook', label: 'Songbook Island', slug: 'songbook-island' },
  { id: 'tv-themes', label: "Captain's TV Themes", slug: 'captains-tv-themes' },
]
const STYLES = ['all', 'jazz', 'pop', 'film', 'classical']
const LEVELS = [0, 1, 2, 3, 4]

async function loadSongbook(studentId) {
  const [songs, islands] = await Promise.all([getSongs(), getStudentMap(studentId)])
  const open = Object.fromEntries(COLLECTIONS.map((c) => [c.id, islands.find((i) => i.slug === c.slug)?.state !== 'locked']))
  return { songs, open }
}

export default function Songbook() {
  const { user } = useAuth()
  const { data, loading } = useAsync(() => loadSongbook(user.id), [user.id])
  const [collection, setCollection] = useState('songbook')
  const [query, setQuery] = useState('')
  const [style, setStyle] = useState('all')
  const [level, setLevel] = useState(0)
  const reduce = useReducedMotion()
  if (loading) return <Loading label="Polishing the spyglass…" />

  const { songs, open } = data
  const q = query.trim().toLowerCase()
  const shown = songs.filter(
    (s) =>
      s.collection === collection &&
      (!q || s.title.toLowerCase().includes(q)) &&
      (collection !== 'songbook' || style === 'all' || s.style === style) &&
      (!level || s.level === level),
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Songbook</h1>
      <p className="mt-3 text-lg text-deep-soft">Pop, jazz, film and classical pieces to play for fun. More songs wash ashore all the time.</p>

      <div role="tablist" aria-label="Collection" className="mt-8 inline-flex rounded-full bg-key p-1 shadow-[var(--shadow-lift)]">
        {COLLECTIONS.map((c) => (
          <button
            key={c.id}
            role="tab"
            type="button"
            aria-selected={collection === c.id}
            onClick={() => setCollection(c.id)}
            className={`relative min-h-12 rounded-full px-5 font-bold transition-colors ${collection === c.id ? 'text-key' : 'text-deep hover:bg-foam'}`}
          >
            {collection === c.id && (
              <motion.span layoutId="collection-pill" className="absolute inset-0 rounded-full bg-deep" transition={{ type: 'spring', duration: reduce ? 0 : 0.35, bounce: 0.2 }} />
            )}
            <span className="relative">{c.label}</span>
          </button>
        ))}
      </div>

      {!open[collection] ? (
        <p className="mt-8 flex items-start gap-3 rounded-2xl bg-key p-5 text-lg shadow-[var(--shadow-lift)]">
          <Lock aria-hidden className="mt-1 shrink-0 text-buoy" size={20} />
          <span>
            This treasure is still locked. It comes with the New Players Taster Course or a Lesson Membership.{' '}
            <Link to="/courses" className="font-bold text-lagoon">
              See courses
            </Link>
          </span>
        </p>
      ) : (
        <>
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label htmlFor="song-search" className="block font-bold">
                Search songs
              </label>
              <div className="relative mt-1.5">
                <Telescope aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-soft" size={20} />
                <input
                  id="song-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Spy a song, like Piano Man"
                  className="block min-h-12 w-full rounded-full border border-line bg-key pl-12 pr-4 text-deep placeholder:text-deep-soft"
                />
              </div>
            </div>
            {collection === 'songbook' && (
              <fieldset>
                <legend className="font-bold">Style</legend>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button key={s} type="button" aria-pressed={style === s} onClick={() => setStyle(s)} className={`btn min-h-11 capitalize ${style === s ? 'bg-deep text-key' : 'btn-quiet bg-key'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
            <fieldset>
              <legend className="font-bold">Level</legend>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {LEVELS.map((l) => (
                  <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={`btn min-h-11 min-w-11 px-3 ${level === l ? 'bg-deep text-key' : 'btn-quiet bg-key'}`}>
                    {l || 'All'}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <p aria-live="polite" className="mt-6 text-deep-soft">
            {shown.length} {shown.length === 1 ? 'song' : 'songs'}
          </p>

          {shown.length === 0 ? (
            <div className="mt-3 rounded-[var(--radius-card)] border-2 border-dashed border-deep/20 p-8 text-center">
              <p className="text-lg font-bold">No songs in sight, matey.</p>
              <p className="mt-1 text-deep-soft">Try a different style or level, or clear your search.</p>
              <button
                type="button"
                className="btn btn-quiet mt-4 bg-key"
                onClick={() => {
                  setQuery('')
                  setStyle('all')
                  setLevel(0)
                }}
              >
                Show all songs
              </button>
            </div>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {shown.map((s) => (
                  <motion.li
                    key={s.id}
                    layout={!reduce}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: reduce ? 0 : 0.18 }}
                    className="flex flex-col rounded-[var(--radius-card)] border border-line bg-key p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl">{s.title}</h2>
                      <span className="flex shrink-0 gap-0.5" aria-label={`Level ${s.level} of 4`} role="img">
                        {[1, 2, 3, 4].map((n) => (
                          <Anchor key={n} aria-hidden size={16} className={n <= s.level ? 'text-lagoon' : 'text-deep/15'} />
                        ))}
                      </span>
                    </div>
                    {s.description && <p className="mt-1 text-deep-soft">{s.description}</p>}
                    <p className="mt-1 text-sm capitalize text-deep-soft">
                      {s.style === 'tv' ? 'TV theme' : s.style}
                      {s.graduate && <span className="normal-case">, from JazzRoc graduate {s.graduate}</span>}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <PlaceholderTag>Score and video to come</PlaceholderTag>
                      <Link to={`/app/practice?song=${s.id}`} className="font-bold text-lagoon">
                        Log practice
                      </Link>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </>
      )}
    </div>
  )
}
