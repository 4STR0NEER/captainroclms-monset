import { BookCheck, Clock, Flame, Map as MapIcon, Music2, NotebookPen, Sailboat, Shovel, Waves } from 'lucide-react'
import CoinFlip from '../../components/kokonut/CoinFlip'
import { Loading } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { earnedBadgeIds } from '../../utils/badges'
import { getBadges, getLessons } from '../../services/courses'
import { getPracticeLogs, getProgress } from '../../services/progress'

const ICONS = { sailboat: Sailboat, map: MapIcon, 'book-check': BookCheck, flame: Flame, waves: Waves, clock: Clock, 'notebook-pen': NotebookPen, 'music-2': Music2 }

async function loadTreasure(studentId) {
  const [badges, progress, logs, lessons] = await Promise.all([getBadges(), getProgress(studentId), getPracticeLogs(studentId), getLessons()])
  return { badges, earned: earnedBadgeIds({ badges, progress, logs, lessons }) }
}

export default function Badges() {
  const { user } = useAuth()
  const { data, loading } = useAsync(() => loadTreasure(user.id), [user.id])
  if (loading) return <Loading label="Digging up the treasure chest…" />
  const { badges, earned } = data

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Treasure chest</h1>
      <p className="mt-3 text-lg text-deep-soft">
        You've found <strong className="text-deep">{earned.size} of {badges.length}</strong> gold doubloons. Spin a coin to read how it's earned.
      </p>

      <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b) => {
          const got = earned.has(b.id)
          const Icon = got ? ICONS[b.icon] ?? Sailboat : Shovel
          return (
            <li key={b.id} className="flex flex-col items-center text-center">
              <CoinFlip
                label={`${b.name}, ${got ? 'earned' : 'not found yet'}`}
                className="w-36 sm:w-40"
                faceClassName={got ? '' : '!border-dashed !border-deep/25 !bg-key'}
                front={
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-5">
                    <span className={`grid size-14 place-items-center rounded-full ${got ? 'bg-key/40' : 'bg-foam'}`}>
                      <Icon aria-hidden size={28} className={got ? 'text-deep' : 'text-deep-soft'} />
                    </span>
                    <span className="text-xs font-bold leading-tight">{got ? 'Found!' : 'Still buried'}</span>
                  </div>
                }
                back={
                  <div className="flex h-full items-center justify-center p-6">
                    <p className="text-xs font-bold leading-snug">{b.description}</p>
                  </div>
                }
              />
              <h2 className="mt-8 text-lg">{b.name}</h2>
            </li>
          )
        })}
      </ul>

      {earned.size === 0 && (
        <p className="mt-12 rounded-[var(--radius-card)] border-2 border-dashed border-deep/20 p-6 text-lg">
          Your chest is empty for now. Finish your first lesson on Melody Island to find your first doubloon!
        </p>
      )}
    </div>
  )
}
