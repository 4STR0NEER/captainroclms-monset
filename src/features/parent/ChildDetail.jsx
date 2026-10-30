import { Link, useParams } from 'react-router'
import { ScrollText } from 'lucide-react'
import IslandMap from '../../components/IslandMap'
import PracticeChart from '../../components/PracticeChart'
import { Loading, formatDate } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { bestStreak, currentStreak, minutesByDay, totalMinutes } from '../../utils/practice'
import { getChildSummary } from '../../services/family'
import { findCurrent } from '../../services/access'
import NotFound from '../shared/NotFound'

export default function ChildDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data, loading } = useAsync(() => getChildSummary(id), [id])
  if (loading) return <Loading />
  // Parents can only see their own children
  if (!data?.child || data.child.parentId !== user.id) return <NotFound />

  const { child, islands, logs, notes } = data
  const { island } = findCurrent(islands)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/parent" className="font-bold text-lagoon">
        Back to your crew
      </Link>
      <h1 className="mt-4 text-4xl sm:text-5xl">{child.firstName}'s progress</h1>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ['Lessons complete', islands.reduce((n, i) => n + i.completeCount, 0)],
          ['Days at sea now', currentStreak(logs)],
          ['Best streak', `${bestStreak(logs)} days`],
          ['Minutes practised', totalMinutes(logs)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-key p-4 shadow-[var(--shadow-lift)]">
            <dt className="text-sm text-deep-soft">{label}</dt>
            <dd className="font-display text-3xl">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="map-title" className="mt-10">
        <h2 id="map-title" className="text-3xl">
          {child.firstName}'s map
        </h2>
        <div className="mt-4">
          <IslandMap islands={islands} currentSlug={island?.slug} linkTo={null} />
        </div>
      </section>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="chart-title" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
          <h2 id="chart-title" className="text-2xl">
            Practice, last 14 days
          </h2>
          <PracticeChart days={minutesByDay(logs, 14)} />
        </section>

        <section aria-labelledby="notes-title" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
          <h2 id="notes-title" className="flex items-center gap-2 text-2xl">
            <ScrollText aria-hidden className="text-lagoon" size={24} /> Notes from the crew
          </h2>
          {notes.length ? (
            <ul className="mt-3 divide-y divide-line">
              {notes.map((n) => (
                <li key={n.id} className="py-3">
                  <p>{n.body}</p>
                  <p className="mt-1 text-sm text-deep-soft">
                    {n.tutorName}, {formatDate(n.date)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-deep-soft">No notes yet.</p>
          )}
        </section>
      </div>

      <section aria-labelledby="log-title" className="mt-10">
        <h2 id="log-title" className="text-3xl">
          Recent practice
        </h2>
        {logs.length ? (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-key">
            {logs.slice(0, 10).map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span>
                  <span className="text-deep-soft">{formatDate(l.date)}</span>
                  {l.note && <span className="block">“{l.note}”</span>}
                </span>
                <span className="font-display text-lg tabular-nums">{l.minutes} min</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-deep-soft">No practice logged yet. Sit with {child.firstName} for ten minutes today and log it together.</p>
        )}
      </section>
    </div>
  )
}
