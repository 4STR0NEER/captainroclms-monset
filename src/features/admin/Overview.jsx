import { Link } from 'react-router'
import { Award, CreditCard, Mail, TriangleAlert } from 'lucide-react'
import PracticeChart from '../../components/PracticeChart'
import { Loading, formatAud, formatDate } from '../../components/ui'
import { useAsync } from '../../utils/useAsync'
import { minutesByDay } from '../../utils/practice'
import { getOverview } from '../../services/admin'

export default function AdminOverview() {
  const { data: o, loading } = useAsync(getOverview)
  if (loading) return <Loading label="Climbing to the bridge…" />

  const stats = [
    ['Students', o.studentCount],
    ['Active courses', o.activeEnrolments],
    ['Practice this week', `${o.weekMinutes} min`],
    ['Lessons completed', o.lessonsCompleted],
  ]
  const attention = [
    o.newInterest > 0 && { icon: Award, text: `${o.newInterest} new exam ${o.newInterest === 1 ? 'enquiry' : 'enquiries'}`, to: '/admin/exam-interest' },
    o.pendingEnrolments > 0 && { icon: CreditCard, text: `${o.pendingEnrolments} ${o.pendingEnrolments === 1 ? 'course' : 'courses'} awaiting payment`, to: '/admin/students' },
    o.quiet.length > 0 && { icon: TriangleAlert, text: `${o.quiet.length} students quiet for 5 days or more`, to: '/admin/students' },
  ].filter(Boolean)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">The bridge</h1>
      <p className="mt-3 text-lg text-deep-soft">Everything happening across JazzRoc this week.</p>

      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-key p-5 shadow-[var(--shadow-lift)]">
            <dt className="text-deep-soft">{label}</dt>
            <dd className="mt-1 font-display text-4xl tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-sm text-deep-soft">One-off course sales to date: {formatAud(o.oneOffRevenue)} (demo figures; membership not included until its price is set).</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section aria-labelledby="attention-title" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
          <h2 id="attention-title" className="text-2xl">
            Needs attention
          </h2>
          {attention.length ? (
            <ul className="mt-3 space-y-2">
              {attention.map(({ icon: Icon, text, to }) => (
                <li key={text}>
                  <Link to={to} className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 font-bold text-deep no-underline hover:bg-foam">
                    <Icon aria-hidden size={20} className="shrink-0 text-buoy" /> {text}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-deep-soft">All calm on deck. Nothing needs you right now.</p>
          )}
          {o.quiet.length > 0 && (
            <p className="mt-3 text-sm text-deep-soft">Quiet: {o.quiet.map((s) => s.firstName).join(', ')}</p>
          )}
        </section>

        <section aria-labelledby="practice-title" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
          <h2 id="practice-title" className="text-2xl">
            School-wide practice, last 14 days
          </h2>
          <PracticeChart days={minutesByDay(o.logs, 14)} />
        </section>
      </div>

      <section aria-labelledby="messages-title" className="mt-8">
        <h2 id="messages-title" className="flex items-center gap-2 text-3xl">
          <Mail aria-hidden className="text-lagoon" size={26} /> Contact messages
        </h2>
        {o.contacts.length ? (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-key">
            {o.contacts.map((c) => (
              <li key={c.id} className="px-5 py-4">
                <p className="font-bold">
                  {c.firstName} {c.lastName}{' '}
                  <span className="font-normal text-deep-soft">
                    {c.email}
                    {c.phone && `, ${c.phone}`}
                    {c.school && `, ${c.school}`}, {formatDate(c.createdAt)}
                  </span>
                </p>
                <p className="mt-1">{c.message}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-deep-soft">No messages yet. Messages sent from the Contact page land here.</p>
        )}
      </section>
    </div>
  )
}
