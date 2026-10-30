import { useState } from 'react'
import { Search } from 'lucide-react'
import { Loading, formatDate } from '../../components/ui'
import { useAsync } from '../../utils/useAsync'
import { addEnrolment, assignTutor, getStudentsTable, setEnrolmentStatus } from '../../services/admin'

const STATUSES = ['active', 'pending', 'cancelled']
const tutorLabel = (t) => (t.id === 'u-roc' ? 'Captain Roc' : t.displayName)

export default function AdminStudents() {
  const [version, setVersion] = useState(0)
  const { data, loading } = useAsync(getStudentsTable, [version])
  const [query, setQuery] = useState('')
  const [school, setSchool] = useState('')
  const [tutor, setTutor] = useState('')
  const [message, setMessage] = useState('')
  if (loading && !data) return <Loading />

  const { students, tutors, schools, products } = data
  const done = (msg) => {
    setMessage(msg)
    setVersion((v) => v + 1)
  }
  const q = query.trim().toLowerCase()
  const shown = students.filter(
    (s) => (!q || s.firstName.toLowerCase().includes(q)) && (!school || s.schoolId === school) && (!tutor || (tutor === 'none' ? !s.tutorId : s.tutorId === tutor)),
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Students and enrolments</h1>
      <p className="mt-3 text-lg text-deep-soft">Assign tutors, add courses and change enrolment status. Changes save straight away.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="block font-bold">Search</span>
          <span className="relative mt-1.5 block">
            <Search aria-hidden className="absolute left-4 top-1/2 -translate-y-1/2 text-deep-soft" size={18} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="First name" className="block min-h-12 w-full rounded-xl border border-line bg-key pl-11 pr-4" />
          </span>
        </label>
        <label className="block">
          <span className="block font-bold">School</span>
          <select value={school} onChange={(e) => setSchool(e.target.value)} className="mt-1.5 block min-h-12 w-full rounded-xl border border-line bg-key px-4">
            <option value="">All schools</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block font-bold">Tutor</span>
          <select value={tutor} onChange={(e) => setTutor(e.target.value)} className="mt-1.5 block min-h-12 w-full rounded-xl border border-line bg-key px-4">
            <option value="">All tutors</option>
            <option value="none">No tutor yet</option>
            {tutors.map((t) => (
              <option key={t.id} value={t.id}>
                {tutorLabel(t)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p aria-live="polite" className="mt-4 rounded-2xl bg-lagoon/10 px-4 py-3 font-bold empty:hidden">
        {message}
      </p>
      <p className="mt-4 text-deep-soft">
        Showing {shown.length} of {students.length} students
      </p>

      <div className="mt-3 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-key">
        <table className="w-full min-w-[920px] text-left">
          <caption className="sr-only">Students, their tutor and courses</caption>
          <thead>
            <tr className="border-b border-line text-sm text-deep-soft">
              <th scope="col" className="px-4 py-3">Student</th>
              <th scope="col" className="px-4 py-3">Tutor</th>
              <th scope="col" className="px-4 py-3">Courses</th>
              <th scope="col" className="px-4 py-3">Progress</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => {
              const missing = products.filter((p) => !s.enrolments.some((e) => e.productId === p.id))
              return (
                <tr key={s.id} className="border-b border-line align-top last:border-b-0">
                  <th scope="row" className="px-4 py-4 font-normal">
                    <span className="block font-bold">{s.firstName}</span>
                    <span className="block text-sm text-deep-soft">
                      {s.yearGroup}, {s.school?.name}
                    </span>
                    <span className="block text-sm text-deep-soft">{s.parent ? `Family account: ${s.parent.displayName}` : s.isAdult ? 'Own account' : 'Family account'}</span>
                  </th>
                  <td className="px-4 py-4">
                    <select
                      aria-label={`Tutor for ${s.firstName}`}
                      value={s.tutorId ?? ''}
                      onChange={async (e) => {
                        await assignTutor(s.id, e.target.value)
                        done(`${s.firstName}'s tutor is updated.`)
                      }}
                      className="min-h-11 rounded-xl border border-line bg-key px-3"
                    >
                      <option value="">Not assigned</option>
                      {tutors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {tutorLabel(t)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-4">
                    <ul className="space-y-2">
                      {s.enrolments.map((e) => (
                        <li key={e.id} className="flex flex-wrap items-center gap-2">
                          <span className="min-w-44 text-sm font-bold">{e.product.name}</span>
                          <select
                            aria-label={`Status of ${e.product.name} for ${s.firstName}`}
                            value={e.status}
                            onChange={async (ev) => {
                              await setEnrolmentStatus(e.id, ev.target.value)
                              done(`${e.product.name} for ${s.firstName} is now ${ev.target.value}.`)
                            }}
                            className="min-h-10 rounded-lg border border-line bg-key px-2 text-sm capitalize"
                          >
                            {STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </li>
                      ))}
                      {s.enrolments.length === 0 && <li className="text-sm text-deep-soft">Free Module One only</li>}
                    </ul>
                    {missing.length > 0 && (
                      <select
                        aria-label={`Add a course for ${s.firstName}`}
                        value=""
                        onChange={async (e) => {
                          const product = products.find((p) => p.id === e.target.value)
                          await addEnrolment(s.id, product.id)
                          done(`${s.firstName} is enrolled in the ${product.name}.`)
                        }}
                        className="mt-2 min-h-10 rounded-lg border border-dashed border-deep/30 bg-key px-2 text-sm"
                      >
                        <option value="">Add a course…</option>
                        {missing.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <span className="block font-bold">{s.lessonsComplete} lessons complete</span>
                    <span className="block text-deep-soft">{s.lastPractice ? `Last practice ${formatDate(s.lastPractice)}` : 'No practice logged'}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
