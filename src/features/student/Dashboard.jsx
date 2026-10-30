import { Link } from 'react-router'
import { ChevronRight, Compass } from 'lucide-react'
import IslandMap from '../../components/IslandMap'
import { Loading } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { getStudentMap } from '../../services/courses'
import { getAssignments } from '../../services/tutor'
import { findCurrent } from '../../services/access'
import { StateBadge } from './IslandDetail'


export default function Dashboard() {
  const { user } = useAuth()
  const { data, loading } = useAsync(() => Promise.all([getStudentMap(user.id), getAssignments(user.id)]), [user.id])
  if (loading) return <Loading label="Unrolling the map…" />
  const [islands, orders] = data

  const { island: current, module: nextModule } = findCurrent(islands)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl">Ahoy, {user.displayName}</h1>
          {current ? (
            <p className="mt-3 text-lg text-deep-soft">
              Next stop: <strong className="text-deep">{current.name}</strong>
              {nextModule && <>, {nextModule.title.split(':')[0]}</>}
            </p>
          ) : (
            <p className="mt-3 text-lg text-deep-soft">You have explored every island you can reach. Ask Captain Roc about the next course.</p>
          )}
        </div>
        {current && (
          <Link to={`/app/island/${current.slug}`} className="btn btn-primary">
            Continue the voyage
          </Link>
        )}
      </div>

      {orders.length > 0 && (
        <section aria-labelledby="orders-title" className="mt-8 rounded-[var(--radius-card)] bg-lagoon/10 p-5">
          <h2 id="orders-title" className="flex items-center gap-2 text-2xl">
            <Compass aria-hidden size={24} /> Orders from your tutor
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {orders.map((o) => (
              <li key={o.id}>
                <Link to={o.href} className="flex min-h-14 items-center gap-3 rounded-2xl bg-key px-4 py-3 text-deep no-underline shadow-[var(--shadow-lift)] hover:bg-foam">
                  <span className="flex-1">
                    <span className="block font-bold">{o.title}</span>
                    <span className="block text-sm text-deep-soft">
                      {o.kind === 'lesson' ? 'Lesson' : 'Song'}
                      {o.note && `: ${o.note}`}
                    </span>
                  </span>
                  <ChevronRight aria-hidden size={20} className="text-deep-soft" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8">
        <IslandMap islands={islands} currentSlug={current?.slug} />
      </div>

      <section aria-labelledby="all-islands" className="mt-14">
        <h2 id="all-islands" className="text-3xl">
          All islands
        </h2>
        <ul className="mt-6 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-key">
          {islands.map((i) => (
            <li key={i.id}>
              <Link to={`/app/island/${i.slug}`} className="flex min-h-16 items-center gap-4 px-5 py-4 text-deep no-underline transition-colors hover:bg-foam">
                <span aria-hidden className="size-4 shrink-0 rounded-full" style={{ background: i.state === 'locked' ? '#46607a' : i.themeColour }} />
                <span className="flex-1">
                  <span className="block font-bold">{i.name}</span>
                  {i.lessonCount > 0 && (
                    <span className="block text-sm text-deep-soft">
                      {i.completeCount} of {i.lessonCount} lessons complete
                    </span>
                  )}
                </span>
                <StateBadge state={i.state} />
                <ChevronRight aria-hidden className="text-deep-soft" size={20} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
