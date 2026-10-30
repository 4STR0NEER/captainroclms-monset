import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Award, Compass, ScrollText, Trash2 } from 'lucide-react'
import PracticeChart from '../../components/PracticeChart'
import VoyageBars from '../../components/VoyageBars'
import { Field, Loading, PlaceholderTag, formatDate } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { minutesByDay } from '../../utils/practice'
import { focusFirstError, validate } from '../../utils/forms'
import { getLessons, getSongs } from '../../services/courses'
import { addTutorNote } from '../../services/people'
import { getChildSummary } from '../../services/family'
import { addAssignment, getAssignments, getExamReadiness, removeAssignment, saveExamReadiness } from '../../services/tutor'
import NotFound from '../shared/NotFound'

// Checklist wording follows the four ABRSM Jazz Piano sections; to confirm with Captain Roc.
const CHECKLIST = [
  { section: 'Scales', marks: 21, items: [{ key: 'scales', label: 'Scales secure' }] },
  {
    section: 'Songs',
    marks: 90,
    items: [
      { key: 'song1', label: 'Song 1 ready' },
      { key: 'song2', label: 'Song 2 ready' },
      { key: 'song3', label: 'Song 3 ready' },
    ],
  },
  {
    section: 'Quick Studies',
    marks: 21,
    items: [
      { key: 'sightOrEar', label: 'Sight reading or playing by ear' },
      { key: 'improvise', label: 'Improvised response' },
    ],
  },
  {
    section: 'Aural tests',
    marks: 18,
    items: [
      { key: 'pulse', label: 'Clap the pulse' },
      { key: 'rhythms', label: 'Clap back rhythms' },
      { key: 'singBack', label: 'Sing back' },
      { key: 'questionAnswer', label: 'Question and answer playing' },
    ],
  },
]
const ALL_ITEMS = CHECKLIST.flatMap((s) => s.items)
const GRADES = ['Initial', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']

function readinessLabel(done) {
  if (done === ALL_ITEMS.length) return 'Ready for Exam Island'
  if (done >= ALL_ITEMS.length - 2) return 'Land ho, nearly there'
  if (done >= ALL_ITEMS.length / 2) return 'Halfway across'
  return 'Setting sail'
}

async function loadStudent(id) {
  const [summary, assignments, readiness, lessons, songs] = await Promise.all([getChildSummary(id), getAssignments(id), getExamReadiness(id), getLessons(), getSongs()])
  return { ...summary, assignments, readiness, lessons, songs }
}

export default function StudentDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [version, setVersion] = useState(0)
  const { data, loading } = useAsync(() => loadStudent(id), [id, version])
  if (loading && !data) return <Loading />
  // Tutors only see their own students
  if (!data?.child || data.child.tutorId !== user.id) return <NotFound />
  const refresh = () => setVersion((v) => v + 1)
  const { child, islands, logs, notes, school, assignments, readiness, lessons, songs } = data

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/tutor" className="font-bold text-lagoon">
        Back to my crew
      </Link>
      <h1 className="mt-4 text-4xl sm:text-5xl">{child.firstName}</h1>
      <p className="mt-2 text-lg text-deep-soft">
        {child.yearGroup}, {school?.name}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="voyage-title" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
          <h2 id="voyage-title" className="text-2xl">
            Progress
          </h2>
          <VoyageBars islands={islands} />
        </section>
        <section aria-labelledby="chart-title" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
          <h2 id="chart-title" className="text-2xl">
            Practice, last 14 days
          </h2>
          <PracticeChart days={minutesByDay(logs, 14)} />
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Assignments child={child} tutorId={user.id} islands={islands} lessons={lessons} songs={songs} assignments={assignments} onChange={refresh} />
        <Notes child={child} tutorId={user.id} notes={notes} onChange={refresh} />
      </div>

      <ExamReadiness child={child} readiness={readiness} />

      <section aria-labelledby="practice-title" className="mt-10">
        <h2 id="practice-title" className="text-3xl">
          Recent practice
        </h2>
        {logs.length ? (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-key">
            {logs.slice(0, 8).map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <span>
                  <span className="text-deep-soft">{formatDate(l.date)}</span>
                  {l.note && <span className="block font-bold">“{l.note}”</span>}
                </span>
                <span className="font-display text-lg tabular-nums">{l.minutes} min</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-deep-soft">{child.firstName} hasn't logged any practice yet.</p>
        )}
      </section>
    </div>
  )
}

function Assignments({ child, tutorId, islands, lessons, songs, assignments, onChange }) {
  const [kind, setKind] = useState('lesson')
  const [errors, setErrors] = useState({})
  const openModules = islands.flatMap((i) => i.modules.filter((m) => !m.state.startsWith('locked')).map((m) => ({ ...m, islandName: i.name })))

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const found = validate(values, { itemId: `Choose a ${kind} to set.` })
    setErrors(found)
    if (Object.keys(found).length) return focusFirstError(form, found)
    await addAssignment({ studentId: child.id, tutorId, kind, itemId: values.itemId, note: values.note })
    form.reset()
    onChange()
  }

  return (
    <section aria-labelledby="orders-title" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
      <h2 id="orders-title" className="flex items-center gap-2 text-2xl">
        <Compass aria-hidden className="text-lagoon" size={24} /> Set a course
      </h2>
      <p className="mt-1 text-deep-soft">{child.firstName} sees these on their island map.</p>

      {assignments.length > 0 && (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {assignments.map((a) => (
            <li key={a.id} className="flex items-start gap-3 py-3">
              <span className="flex-1">
                <span className="block font-bold">{a.title}</span>
                <span className="block text-sm text-deep-soft">
                  {a.kind === 'lesson' ? 'Lesson' : 'Song'}, set {formatDate(a.date)}
                  {a.note && `. ${a.note}`}
                </span>
              </span>
              <button
                type="button"
                onClick={async () => {
                  await removeAssignment(a.id)
                  onChange()
                }}
                className="btn btn-quiet size-11 p-0"
                aria-label={`Remove ${a.title}`}
              >
                <Trash2 aria-hidden size={18} className="text-buoy" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-4">
        <fieldset>
          <legend className="font-bold">Set a</legend>
          <div className="mt-1.5 flex gap-2">
            {['lesson', 'song'].map((k) => (
              <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={`btn min-h-11 capitalize ${kind === k ? 'bg-deep text-key' : 'btn-quiet'}`}>
                {k}
              </button>
            ))}
          </div>
        </fieldset>
        <Field key={kind} label={kind === 'lesson' ? 'Lesson' : 'Song'} name="itemId" as="select" required defaultValue="" error={errors.itemId}>
          <option value="" disabled>
            Choose a {kind}
          </option>
          {kind === 'lesson'
            ? openModules.map((m) => (
                <optgroup key={m.id} label={`${m.islandName}, ${m.title.split(':')[0]}`}>
                  {lessons
                    .filter((l) => l.moduleId === m.id)
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title}
                      </option>
                    ))}
                </optgroup>
              ))
            : songs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
        </Field>
        <Field label="Note for the student" name="note" placeholder="For example: hands separately first" />
        <button type="submit" className="btn btn-primary">
          Set the course
        </button>
      </form>
    </section>
  )
}

function Notes({ child, tutorId, notes, onChange }) {
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const body = new FormData(form).get('body').trim()
    if (!body) {
      setError('Write a note before saving.')
      form.elements.body.focus()
      return
    }
    setError('')
    await addTutorNote({ studentId: child.id, tutorId, body })
    form.reset()
    onChange()
  }

  return (
    <section aria-labelledby="notes-title" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
      <h2 id="notes-title" className="flex items-center gap-2 text-2xl">
        <ScrollText aria-hidden className="text-lagoon" size={24} /> Notes for the family
      </h2>
      <p className="mt-1 text-deep-soft">Parents see these on their dashboard.</p>
      <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-3">
        <Field label="New note" name="body" as="textarea" rows={3} required error={error} />
        <button type="submit" className="btn btn-primary">
          Save note
        </button>
      </form>
      {notes.length > 0 && (
        <ul className="mt-5 divide-y divide-line border-t border-line">
          {notes.map((n) => (
            <li key={n.id} className="py-3">
              <p>{n.body}</p>
              <p className="mt-1 text-sm text-deep-soft">
                {n.tutorName}, {formatDate(n.date)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ExamReadiness({ child, readiness }) {
  const [items, setItems] = useState(readiness?.items ?? {})
  const [grade, setGrade] = useState(readiness?.targetGrade ?? '')
  const done = ALL_ITEMS.filter((i) => items[i.key]).length

  function toggle(key) {
    const next = { ...items, [key]: !items[key] }
    setItems(next)
    saveExamReadiness(child.id, { items: next, targetGrade: grade })
  }

  function changeGrade(value) {
    setGrade(value)
    saveExamReadiness(child.id, { items, targetGrade: value })
  }

  return (
    <section aria-labelledby="exam-title" className="mt-6 rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="exam-title" className="flex items-center gap-2 text-2xl">
            <Award aria-hidden className="text-lagoon" size={24} /> Exam readiness
          </h2>
          <p className="mt-1 text-deep-soft">ABRSM Jazz Piano. Exams are optional; tick each part when it's secure.</p>
        </div>
        <label className="block">
          <span className="block font-bold">Target grade</span>
          <select value={grade} onChange={(e) => changeGrade(e.target.value)} className="mt-1.5 min-h-12 rounded-xl border border-line bg-key px-4">
            <option value="">Not planning an exam</option>
            {GRADES.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-deep/10" role="progressbar" aria-valuemin={0} aria-valuemax={ALL_ITEMS.length} aria-valuenow={done} aria-label="Exam readiness">
          <div className="h-full rounded-full bg-doubloon transition-[width] duration-300" style={{ width: `${(done / ALL_ITEMS.length) * 100}%` }} />
        </div>
        <p className="font-bold">
          {done} of {ALL_ITEMS.length}: {readinessLabel(done)}
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CHECKLIST.map((s) => (
          <fieldset key={s.section}>
            <legend className="text-lg font-bold">
              {s.section} <span className="font-normal text-deep-soft">({s.marks} marks)</span>
            </legend>
            <ul className="mt-2 space-y-1">
              {s.items.map((i) => (
                <li key={i.key}>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-foam">
                    <input type="checkbox" checked={Boolean(items[i.key])} onChange={() => toggle(i.key)} className="size-5 accent-[#13716f]" />
                    {i.label}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        ))}
      </div>
      <p className="mt-4">
        <PlaceholderTag>Checklist wording to confirm with Captain Roc</PlaceholderTag>
      </p>
    </section>
  )
}
