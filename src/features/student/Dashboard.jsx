import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import IslandMap from '../../components/IslandMap'
import { Loading } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { getStudentMap } from '../../services/courses'
import { StateBadge } from './IslandDetail'

// Where the student should sail next: the island they're part way through, else the next open one.
export function findCurrent(islands) {
  const island = islands.find((i) => i.state === 'in progress') ?? islands.find((i) => i.state === 'not started')
  const module = island?.modules.find((m) => m.state === 'in progress') ?? island?.modules.find((m) => m.state === 'not started')
  return { island, module }
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: islands, loading } = useAsync(() => getStudentMap(user.id), [user.id])
  if (loading) return <Loading label="Unrolling the map…" />

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
                <span aria-hidden className="size-4 shrink-0 rounded-full" style={{ background: i.state === 'locked' ? '#5b7088' : i.themeColour }} />
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
