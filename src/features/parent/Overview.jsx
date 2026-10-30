import { Link, useNavigate } from 'react-router'
import { Anchor, Flame, GraduationCap, ScrollText, UserPlus } from 'lucide-react'
import SmoothTab from '../../components/kokonut/SmoothTab'
import { Loading, formatDate } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { currentStreak, minutesByDay } from '../../utils/practice'
import { getFamily } from '../../services/family'
import { findCurrent } from '../student/Dashboard'

export default function Overview() {
  const { user } = useAuth()
  const { data: family, loading } = useAsync(() => getFamily(user.id), [user.id])
  if (loading) return <Loading label="Gathering the crew…" />

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Ahoy, {user.displayName}</h1>
      <p className="mt-3 text-lg text-deep-soft">How your crew is sailing this week.</p>

      {family.length === 0 ? (
        <div className="mt-8 rounded-[var(--radius-card)] border-2 border-dashed border-deep/20 p-8">
          <p className="text-xl font-bold">No crew aboard yet</p>
          <p className="mt-1 text-deep-soft">Add a profile for each child who'll be learning. All we need is a first name, school year and school.</p>
          <Link to="/parent/profiles" className="btn btn-primary mt-5">
            <UserPlus aria-hidden size={18} /> Add a child
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <SmoothTab
            label="Your children"
            items={family.map((f) => ({ id: f.child.id, title: f.child.firstName, icon: GraduationCap, content: <ChildPanel summary={f} /> }))}
          />
          {family.length > 1 && <p className="mt-3 text-sm text-deep-soft">Tip: swipe the panel sideways to switch between children.</p>}
        </div>
      )}
    </div>
  )
}

function ChildPanel({ summary }) {
  const { child, islands, logs, notes, enrolments, tutorName, school } = summary
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { island, module } = findCurrent(islands)
  const week = minutesByDay(logs, 7)
  const weekMinutes = week.reduce((n, d) => n + d.minutes, 0)
  const streak = currentStreak(logs)
  const voyage = islands.filter((i) => i.lessonCount > 0 && i.state !== 'locked')
  const active = enrolments.filter((e) => e.status === 'active')
  const pending = enrolments.filter((e) => e.status === 'pending')

  function practiseAs() {
    signIn(child.id, 'student', child.parentId)
    navigate('/app')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
        <div>
          <h2 className="text-3xl">{child.firstName}</h2>
          <p className="text-deep-soft">
            {child.yearGroup}, {school?.name ?? 'school not set'}. Tutor: {tutorName ?? 'to be assigned'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/parent/child/${child.id}`} className="btn btn-quiet">
            Full progress
          </Link>
          <button type="button" onClick={practiseAs} className="btn btn-primary">
            Practise as {child.firstName}
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section aria-label={`${child.firstName}'s voyage`} className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)] lg:col-span-2">
          <h3 className="text-2xl">The voyage</h3>
          <p className="mt-1 text-deep-soft">
            {island ? (
              <>
                Sailing for <strong className="text-deep">{island.name}</strong>
                {module && <>, {module.title.split(':')[0]}</>}
              </>
            ) : (
              'Every open island explored.'
            )}
          </p>
          <ul className="mt-4 space-y-3">
            {voyage.map((i) => (
              <li key={i.id} className="grid grid-cols-[minmax(0,11rem)_1fr_4.5rem] items-center gap-3">
                <span className="font-bold leading-tight">{i.name}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-deep/10" aria-hidden>
                  <span className="block h-full rounded-full" style={{ width: `${(i.completeCount / i.lessonCount) * 100}%`, background: i.themeColour }} />
                </span>
                <span className="text-right text-sm tabular-nums text-deep-soft">
                  {i.completeCount} of {i.lessonCount}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label={`${child.firstName}'s practice this week`} className="on-deep rounded-[var(--radius-card)] bg-deep p-5 text-key">
          <h3 className="text-2xl">This week</h3>
          <p className="mt-1 flex items-center gap-2 text-foam/85">
            <Flame aria-hidden size={18} className="text-doubloon" /> {streak} {streak === 1 ? 'day' : 'days'} at sea, {weekMinutes} minutes
          </p>
          <ol className="mt-4 grid grid-cols-7 gap-1.5">
            {week.map((d) => (
              <li key={d.date} className="flex flex-col items-center gap-1">
                <span className={`grid aspect-square w-full place-items-center rounded-full border-[3px] ${d.minutes ? 'border-doubloon bg-doubloon text-deep' : 'border-foam/30'}`}>
                  {d.minutes > 0 && <Anchor aria-hidden size={14} />}
                </span>
                <span className="text-xs text-foam/85">{d.label.slice(0, 2)}</span>
                <span className="sr-only">{d.minutes ? `${d.minutes} minutes` : 'no practice'}</span>
              </li>
            ))}
          </ol>
          {logs[0] && (
            <p className="mt-5 border-t border-key/15 pt-4 text-foam/85">
              Last practice: {formatDate(logs[0].date)}, {logs[0].minutes} minutes
              {logs[0].note && <span className="mt-1 block text-key">“{logs[0].note}”</span>}
            </p>
          )}
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section aria-label="Latest tutor note" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)] lg:col-span-2">
          <h3 className="flex items-center gap-2 text-2xl">
            <ScrollText aria-hidden className="text-lagoon" size={24} /> Notes from the crew
          </h3>
          {notes[0] ? (
            <figure className="mt-3">
              <blockquote className="text-lg">“{notes[0].body}”</blockquote>
              <figcaption className="mt-2 text-sm text-deep-soft">
                {notes[0].tutorName}, {formatDate(notes[0].date)}
              </figcaption>
            </figure>
          ) : (
            <p className="mt-3 text-deep-soft">No notes yet. {child.firstName}'s tutor will leave notes here after lessons.</p>
          )}
        </section>

        <section aria-label="Courses" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
          <h3 className="text-2xl">Courses</h3>
          {active.length ? (
            <ul className="mt-3 space-y-1">
              {active.map((e) => (
                <li key={e.id} className="font-bold">
                  {e.product.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-deep-soft">Melody Island Module One (free)</p>
          )}
          {pending.length > 0 && (
            <p className="mt-3 rounded-xl bg-doubloon/25 px-3 py-2 text-sm font-bold">
              {pending.length} awaiting payment.{' '}
              <Link to="/parent/billing" className="text-deep underline">
                Go to billing
              </Link>
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
