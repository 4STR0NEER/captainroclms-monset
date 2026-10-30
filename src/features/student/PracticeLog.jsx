import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Anchor, Flame, Hourglass, NotebookPen } from 'lucide-react'
import { Field, Loading, formatDate } from '../../components/ui'
import CoinBurst from '../../components/CoinBurst'
import PracticeChart from '../../components/PracticeChart'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { isoDaysAgo, localIso } from '../../utils/dates'
import { bestStreak, currentStreak, minutesByDay, totalMinutes } from '../../utils/practice'
import { focusFirstError, validate } from '../../utils/forms'
import { getLessons, getSongs } from '../../services/courses'
import { addPracticeLog, getPracticeLogs } from '../../services/progress'

async function loadLog(studentId) {
  const [logs, lessons, songs] = await Promise.all([getPracticeLogs(studentId), getLessons(), getSongs()])
  return { logs, lessons, songs }
}

export default function PracticeLog() {
  const { user } = useAuth()
  const [version, setVersion] = useState(0)
  const { data, loading } = useAsync(() => loadLog(user.id), [user.id, version])
  if (loading && !data) return <Loading label="Opening the Captain's log…" />
  return <LogView {...data} studentId={user.id} onSaved={() => setVersion((v) => v + 1)} />
}

function LogView({ logs, lessons, songs, studentId, onSaved }) {
  const [params] = useSearchParams()
  const [errors, setErrors] = useState({})
  const [burst, setBurst] = useState(0)
  const [saved, setSaved] = useState('')

  const streak = currentStreak(logs)
  const week = minutesByDay(logs, 7)
  const fortnight = minutesByDay(logs, 14)
  const weekMinutes = week.reduce((n, d) => n + d.minutes, 0)
  const nameOf = (log) =>
    (log.songId && songs.find((s) => s.id === log.songId)?.title) || (log.lessonId && lessons.find((l) => l.id === log.lessonId)?.title) || 'Free practice'

  // Lessons the student has logged before, so the picker stays short
  const recentLessons = [...new Set(logs.map((l) => l.lessonId).filter(Boolean))].map((id) => lessons.find((l) => l.id === id)).filter(Boolean)

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const found = validate(values, { date: 'Choose the day you practised.', minutes: 'How many minutes did you practise?' })
    const minutes = Number(values.minutes)
    if (!found.minutes && (!Number.isInteger(minutes) || minutes < 1 || minutes > 240)) found.minutes = 'Enter whole minutes between 1 and 240.'
    if (!found.date && values.date > localIso()) found.date = "You can't log practice in the future, matey!"
    setErrors(found)
    if (Object.keys(found).length) return focusFirstError(form, found)

    const [kind, id] = (values.what || ':').split(':')
    await addPracticeLog({ studentId, date: values.date, minutes, note: values.note, lessonId: kind === 'lesson' ? id : null, songId: kind === 'song' ? id : null })
    form.reset()
    setBurst((n) => n + 1)
    setSaved(`Logged ${minutes} minutes. Arrr, the Captain is proud!`)
    onSaved()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Captain's log</h1>
      <p className="mt-3 text-lg text-deep-soft">Every day you practise is a day at sea. Keep the streak going!</p>

      {/* This week as seven portholes */}
      <section aria-labelledby="week-title" className="on-deep mt-8 rounded-[var(--radius-card)] bg-deep p-6 text-key sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="week-title" className="flex items-center gap-2 text-2xl">
              <Flame aria-hidden className="text-doubloon" size={26} />
              {streak} {streak === 1 ? 'day' : 'days'} at sea
            </h2>
            <p className="mt-1 text-foam/80">
              {streak ? 'Your current practice streak.' : 'Practise today to start a new streak.'} Best ever: {bestStreak(logs)} days.
            </p>
          </div>
          <dl className="flex gap-8">
            <div>
              <dt className="text-sm text-foam/80">This week</dt>
              <dd className="font-display text-3xl">{weekMinutes} min</dd>
            </div>
            <div>
              <dt className="text-sm text-foam/80">All time</dt>
              <dd className="font-display text-3xl">{totalMinutes(logs)} min</dd>
            </div>
          </dl>
        </div>
        <ol className="mt-6 grid grid-cols-7 gap-2 sm:gap-4">
          {week.map((d) => (
            <li key={d.date} className="flex flex-col items-center gap-2 text-center">
              <span
                className={`grid aspect-square w-full max-w-16 place-items-center rounded-full border-4 ${
                  d.minutes ? 'border-doubloon bg-doubloon text-deep' : 'border-foam/30 text-foam/40'
                }`}
              >
                {d.minutes ? <Anchor aria-hidden size={20} /> : null}
              </span>
              <span className="text-xs text-foam/85 sm:text-sm">{d.label.split(' ')[0]}</span>
              <span className="sr-only">{d.minutes ? `${d.minutes} minutes practised` : 'no practice'}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="chart-title" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)] sm:p-6">
          <h2 id="chart-title" className="text-2xl">
            Minutes practised, last 14 days
          </h2>
          <PracticeChart days={fortnight} />
        </section>

        <section aria-labelledby="add-title" className="relative rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)] sm:p-6">
          <CoinBurst trigger={burst} />
          <h2 id="add-title" className="flex items-center gap-2 text-2xl">
            <NotebookPen aria-hidden className="text-lagoon" size={24} /> Add to the log
          </h2>
          <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Day" name="date" type="date" required defaultValue={localIso()} max={localIso()} min={isoDaysAgo(60)} error={errors.date} />
              <Field label="Minutes" name="minutes" type="number" inputMode="numeric" min="1" max="240" required error={errors.minutes} />
            </div>
            <Field label="What did you practise?" name="what" as="select" defaultValue={params.get('song') ? `song:${params.get('song')}` : ''}>
              <option value="">Free practice</option>
              {recentLessons.length > 0 && (
                <optgroup label="Lessons">
                  {recentLessons.map((l) => (
                    <option key={l.id} value={`lesson:${l.id}`}>
                      {l.title}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Songbook and TV themes">
                {songs.map((s) => (
                  <option key={s.id} value={`song:${s.id}`}>
                    {s.title}
                  </option>
                ))}
              </optgroup>
            </Field>
            <Field label="Note" name="note" as="textarea" rows={2} hint="Anything tricky? Your tutor can read this." />
            <button type="submit" className="btn btn-primary w-full">
              Log practice
            </button>
            <p aria-live="polite" className="text-center font-bold empty:hidden">
              {saved}
            </p>
          </form>
        </section>
      </div>

      <section aria-labelledby="entries-title" className="mt-10">
        <h2 id="entries-title" className="flex items-center gap-2 text-3xl">
          <Hourglass aria-hidden className="text-lagoon" size={26} /> Past voyages
        </h2>
        {logs.length === 0 ? (
          <p className="mt-4 rounded-[var(--radius-card)] border-2 border-dashed border-deep/20 p-6 text-lg">
            Your log is empty, matey. Use the timer in any lesson, or add your first practice above.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-key">
            {logs.slice(0, 20).map((l) => (
              <li key={l.id} className="grid gap-1 px-5 py-4 sm:grid-cols-[12rem_1fr_auto] sm:items-center sm:gap-6">
                <span className="text-deep-soft">{formatDate(l.date)}</span>
                <span>
                  <span className="font-bold">{nameOf(l)}</span>
                  {l.note && <span className="block text-deep-soft">{l.note}</span>}
                </span>
                <span className="font-display text-xl tabular-nums">{l.minutes} min</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
