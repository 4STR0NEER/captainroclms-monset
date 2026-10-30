import { Link, useParams } from 'react-router'
import { Check, Circle, CircleCheck, CircleDot, Compass, Lock } from 'lucide-react'
import { Loading, PlaceholderTag } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { getLessons, getProducts, getSongs, getStudentMap } from '../../services/courses'
import { getProgress } from '../../services/progress'
import NotFound from '../shared/NotFound'

const BADGES = {
  complete: { icon: Check, label: 'Complete', className: 'bg-doubloon/30 text-deep' },
  'in progress': { icon: Compass, label: 'In progress', className: 'bg-lagoon/10 text-lagoon' },
  'not started': { icon: Circle, label: 'Not started', className: 'bg-deep/5 text-deep-soft' },
  open: { icon: Compass, label: 'Open', className: 'bg-lagoon/10 text-lagoon' },
  locked: { icon: Lock, label: 'Locked', className: 'bg-buoy/10 text-buoy' },
  'locked-tier': { icon: Lock, label: 'Locked', className: 'bg-buoy/10 text-buoy' },
  'locked-path': { icon: Lock, label: 'Locked', className: 'bg-buoy/10 text-buoy' },
}

export function StateBadge({ state }) {
  const { icon: Icon, label, className } = BADGES[state]
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${className}`}>
      <Icon aria-hidden size={15} />
      {label}
    </span>
  )
}

const LESSON_ICON = { complete: CircleCheck, practised: CircleDot }
const LESSON_LABEL = { complete: 'Complete', practised: 'Practised' }

async function loadIsland(slug, studentId) {
  const [islands, lessons, progress, products] = await Promise.all([getStudentMap(studentId), getLessons(), getProgress(studentId), getProducts()])
  const island = islands.find((i) => i.slug === slug)
  if (!island) return null
  const tvThemes = slug === 'captains-tv-themes' ? await getSongs('tv-themes') : []
  return { island, islands, lessons, progress, products, tvThemes }
}

export default function IslandDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { data, loading } = useAsync(() => loadIsland(slug, user.id), [slug, user.id])
  if (loading) return <Loading />
  if (!data) return <NotFound />

  const { island, islands, lessons, progress, products, tvThemes } = data
  const statusOf = new Map(progress.map((p) => [p.lessonId, p.status]))
  const productFor = (tier) => products.find((p) => p.accessTier === tier)
  const moduleTitle = (id) => islands.flatMap((i) => i.modules).find((m) => m.id === id)?.title.split(':')[0]
  const books = [...new Set(island.modules.map((m) => m.book))]

  return (
    <div>
      <header style={{ '--island': island.state === 'locked' ? '#5b7088' : island.themeColour }} className="border-b border-line bg-[color-mix(in_srgb,var(--island)_14%,var(--color-foam))]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <Link to="/app" className="font-bold text-lagoon">
            Back to the map
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span aria-hidden className="size-5 rounded-full bg-[var(--island)]" />
            <h1 className="text-4xl sm:text-5xl">{island.name}</h1>
            <StateBadge state={island.state} />
          </div>
          <p className="mt-4 max-w-2xl text-lg text-deep-soft">{island.description}</p>
          {island.lessonCount > 0 && (
            <p className="mt-3 font-bold">
              {island.completeCount} of {island.lessonCount} lessons complete
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {island.state === 'locked' && (
          <LockNote>
            {island.name} is part of the {productFor(island.accessTier)?.name ?? 'next course'}.{' '}
            <Link to="/courses" className="font-bold text-lagoon">
              See what each course unlocks
            </Link>
          </LockNote>
        )}

        {slug === 'songbook-island' && island.state !== 'locked' && (
          <p className="text-lg">
            Every song on the island lives in the Songbook, where you can search by style and level.{' '}
            <Link to="/app/songbook" className="font-bold text-lagoon">
              Open the Songbook
            </Link>
          </p>
        )}

        {tvThemes.length > 0 && island.state !== 'locked' && (
          <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-key">
            {tvThemes.map((t) => (
              <li key={t.id} className="px-5 py-4">
                <h2 className="text-xl">{t.title}</h2>
                <p className="text-deep-soft">{t.description}</p>
              </li>
            ))}
          </ul>
        )}
        {tvThemes.length > 0 && (
          <p className="mt-3">
            <PlaceholderTag>Placeholder scores and videos</PlaceholderTag>
          </p>
        )}

        {books.map((book) => (
          <section key={book ?? 'none'} aria-label={book ? `Book ${book === 1 ? 'One' : 'Two'}` : undefined} className="mt-2 first:mt-0">
            {book && <h2 className="mb-4 mt-8 text-3xl">Book {book === 1 ? 'One' : 'Two'}</h2>}
            <ol className="space-y-4">
              {island.modules
                .filter((m) => m.book === book)
                .map((m) => {
                  const locked = m.state.startsWith('locked')
                  const ls = lessons.filter((l) => l.moduleId === m.id)
                  const pct = m.lessonCount ? (m.completeCount / m.lessonCount) * 100 : 0
                  return (
                    <li key={m.id} className={`rounded-[var(--radius-card)] border border-line bg-key p-5 sm:p-6 ${locked ? 'opacity-90' : ''}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-2xl">{m.title}</h3>
                        <div className="flex items-center gap-2">
                          {m.placeholder && <PlaceholderTag>Placeholder lessons</PlaceholderTag>}
                          <StateBadge state={m.state} />
                        </div>
                      </div>

                      {m.state === 'locked-tier' && (
                        <p className="mt-2 text-deep-soft">
                          Part of the {productFor(m.accessTier)?.name}.{' '}
                          <Link to="/courses" className="font-bold text-lagoon">
                            See courses
                          </Link>
                        </p>
                      )}
                      {m.state === 'locked-path' && (
                        <p className="mt-2 text-deep-soft">Complete {moduleTitle(m.unlockRule.moduleId)} to sail here.</p>
                      )}

                      {!locked && (
                        <>
                          <div className="mt-4 flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-deep/10" role="progressbar" aria-valuenow={m.completeCount} aria-valuemin={0} aria-valuemax={m.lessonCount} aria-label={`${m.title} progress`}>
                              <div className="h-full rounded-full bg-lagoon" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-sm tabular-nums text-deep-soft">
                              {m.completeCount} of {m.lessonCount}
                            </span>
                          </div>
                          <ol className="mt-4 divide-y divide-line border-t border-line">
                            {ls.map((l) => {
                              const status = statusOf.get(l.id)
                              const Icon = LESSON_ICON[status] ?? Circle
                              return (
                                <li key={l.id}>
                                  <Link to={`/app/lesson/${l.id}`} className="flex min-h-14 items-center gap-3 py-3 text-deep no-underline hover:text-lagoon">
                                    <Icon aria-hidden size={22} className={status === 'complete' ? 'text-lagoon' : status === 'practised' ? 'text-doubloon' : 'text-deep/30'} />
                                    <span className="flex-1">
                                      <span className="text-deep-soft tabular-nums">{l.order}.</span> {l.title}
                                    </span>
                                    {LESSON_LABEL[status] && <span className="text-sm text-deep-soft">{LESSON_LABEL[status]}</span>}
                                  </Link>
                                </li>
                              )
                            })}
                          </ol>
                          {m.closingNote && <p className="mt-4 rounded-2xl bg-foam px-4 py-3 font-bold">{m.closingNote}</p>}
                        </>
                      )}
                    </li>
                  )
                })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}

function LockNote({ children }) {
  return (
    <p className="mb-8 flex items-start gap-3 rounded-2xl bg-key p-5 text-lg shadow-[var(--shadow-lift)]">
      <Lock aria-hidden className="mt-1 shrink-0 text-buoy" size={20} />
      <span>{children}</span>
    </p>
  )
}
