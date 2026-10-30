import { useState } from 'react'
import { Loading, PlaceholderTag, formatDate } from '../../components/ui'
import { useAsync } from '../../utils/useAsync'
import { getExamInterest, setInterestStatus } from '../../services/admin'

const STATUSES = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['booked', 'Booked in'],
  ['closed', 'Closed'],
]

export default function AdminExamInterest() {
  const [version, setVersion] = useState(0)
  const [filter, setFilter] = useState('all')
  const { data: rows, loading } = useAsync(getExamInterest, [version])
  if (loading && !rows) return <Loading />

  const shown = filter === 'all' ? rows : rows.filter((r) => r.status === filter)
  const count = (s) => rows.filter((r) => r.status === s).length

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Exam interest</h1>
      <p className="mt-3 text-lg text-deep-soft">Families who registered on the Exam Island page.</p>

      <div role="group" aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
        {[['all', 'All'], ...STATUSES].map(([value, label]) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`btn min-h-11 ${filter === value ? 'bg-deep text-key' : 'btn-quiet bg-key'}`}>
            {label} <span className="tabular-nums opacity-75">{value === 'all' ? rows.length : count(value)}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-[var(--radius-card)] border-2 border-dashed border-deep/20 p-6 text-lg">
          {rows.length ? 'No enquiries with this status.' : 'No enquiries yet. They arrive from the form on the Exam Island page.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {shown.map((r) => (
            <li key={r.id} className="grid gap-4 rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)] sm:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-2xl">
                  {r.childFirstName}{' '}
                  <span className="font-body text-base text-deep-soft">
                    parent {r.parentFirstName} {r.parentLastName}
                  </span>
                </h2>
                <p className="mt-1">
                  Last exam: <strong>{r.lastGrade}</strong>
                  {r.lastExamDate && `, ${formatDate(r.lastExamDate)}`}. Received {formatDate(r.createdAt)}.
                </p>
                <p className="mt-1">
                  <a href={`mailto:${r.email}`} className="font-bold text-lagoon">
                    {r.email}
                  </a>
                </p>
                {r.message && <p className="mt-2 text-deep-soft">“{r.message}”</p>}
                {r.placeholder && (
                  <p className="mt-2">
                    <PlaceholderTag>Sample enquiry</PlaceholderTag>
                  </p>
                )}
              </div>
              <label className="block">
                <span className="block font-bold">Status</span>
                <select
                  value={r.status}
                  onChange={async (e) => {
                    await setInterestStatus(r.id, e.target.value)
                    setVersion((v) => v + 1)
                  }}
                  className="mt-1.5 min-h-12 rounded-xl border border-line bg-key px-4"
                >
                  {STATUSES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
