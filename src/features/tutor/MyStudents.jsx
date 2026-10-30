import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, Flame, School, TriangleAlert } from 'lucide-react'
import { Loading, formatDate } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { isoDaysAgo } from '../../utils/dates'
import { currentStreak, minutesByDay } from '../../utils/practice'
import { getTutorStudents } from '../../services/tutor'
import { findCurrent } from '../../services/access'

// No practice for this many days flags a student so the tutor can check in
const QUIET_DAYS = 5

export default function MyStudents() {
  const { user } = useAuth()
  const { data: groups, loading } = useAsync(() => getTutorStudents(user.id), [user.id])
  const [onlyQuiet, setOnlyQuiet] = useState(false)
  if (loading) return <Loading label="Mustering the crew…" />

  const all = groups.flatMap((g) => g.students)
  const isQuiet = (r) => !r.logs.some((l) => l.date >= isoDaysAgo(QUIET_DAYS))
  const quietCount = all.filter(isQuiet).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">My crew</h1>
      <p className="mt-3 text-lg text-deep-soft">
        {all.length} {all.length === 1 ? 'student' : 'students'} across {groups.length} {groups.length === 1 ? 'location' : 'locations'}.
      </p>

      {quietCount > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl bg-key p-4 shadow-[var(--shadow-lift)]">
          <TriangleAlert aria-hidden className="text-buoy" size={22} />
          <p className="flex-1 font-bold">
            {quietCount} {quietCount === 1 ? "student hasn't" : "students haven't"} logged practice in {QUIET_DAYS} days.
          </p>
          <button type="button" aria-pressed={onlyQuiet} onClick={() => setOnlyQuiet((q) => !q)} className={`btn ${onlyQuiet ? 'bg-deep text-key' : 'btn-quiet'}`}>
            {onlyQuiet ? 'Show everyone' : 'Show only them'}
          </button>
        </div>
      )}

      {all.length === 0 && (
        <p className="mt-8 rounded-[var(--radius-card)] border-2 border-dashed border-deep/20 p-6 text-lg">
          No students assigned to you yet. Captain Roc assigns students from the admin area.
        </p>
      )}

      {groups.map(({ school, students }) => {
        const shown = onlyQuiet ? students.filter(isQuiet) : students
        if (!shown.length) return null
        return (
          <section key={school.id} aria-labelledby={`school-${school.id}`} className="mt-10">
            <h2 id={`school-${school.id}`} className="flex items-center gap-2 text-2xl sm:text-3xl">
              <School aria-hidden className="text-lagoon" size={26} /> {school.name}
            </h2>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-key">
              {shown.map((r) => {
                const { student, islands, logs } = r
                const { island, module } = findCurrent(islands)
                const week = minutesByDay(logs, 7).reduce((n, d) => n + d.minutes, 0)
                const streak = currentStreak(logs)
                const last = [...logs].sort((a, b) => b.date.localeCompare(a.date))[0]
                return (
                  <li key={student.id}>
                    <Link to={`/tutor/student/${student.id}`} className="grid gap-2 px-5 py-4 text-deep no-underline transition-colors hover:bg-foam sm:grid-cols-[12rem_1fr_9rem_auto] sm:items-center sm:gap-6">
                      <span>
                        <span className="block text-lg font-bold">{student.firstName}</span>
                        <span className="block text-sm text-deep-soft">{student.yearGroup}</span>
                      </span>
                      <span className="text-deep-soft">
                        {island ? (
                          <>
                            {island.name}
                            {module && `, ${module.title.split(':')[0]}`}
                          </>
                        ) : (
                          'All open islands explored'
                        )}
                      </span>
                      <span className="text-sm">
                        <span className="flex items-center gap-1 font-bold">
                          <Flame aria-hidden size={15} className={streak ? 'text-doubloon' : 'text-deep/25'} /> {week} min this week
                        </span>
                        <span className={`flex items-center gap-1 ${isQuiet(r) ? 'font-bold' : 'text-deep-soft'}`}>
                          {isQuiet(r) && <TriangleAlert aria-hidden size={14} className="text-buoy" />}
                          {last ? `Last: ${formatDate(last.date)}` : 'Never logged'}
                        </span>
                      </span>
                      <ChevronRight aria-hidden className="hidden text-deep-soft sm:block" size={20} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
