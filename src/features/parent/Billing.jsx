import { useState } from 'react'
import { Link } from 'react-router'
import { CircleCheck, Clock, CreditCard } from 'lucide-react'
import CoinBurst from '../../components/CoinBurst'
import { Loading, PlaceholderTag, formatAud, formatDate } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { getFamily, payEnrolment } from '../../services/family'

const BILLING = { once: 'One-off', term: 'Per school term', monthly: 'Monthly' }

export default function Billing() {
  const { user } = useAuth()
  const [version, setVersion] = useState(0)
  const [burst, setBurst] = useState(0)
  const [message, setMessage] = useState('')
  const { data: family, loading } = useAsync(() => getFamily(user.id), [user.id, version])
  if (loading && !family) return <Loading />

  const rows = family.flatMap((f) => f.enrolments.map((e) => ({ ...e, child: f.child })))
  const paid = rows.filter((r) => r.status === 'active' && r.product.price != null)

  async function pay(row) {
    await payEnrolment(row.id)
    setBurst((n) => n + 1)
    setMessage(`Paid! ${row.child.firstName} can now sail into everything in the ${row.product.name}.`)
    setVersion((v) => v + 1)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Billing</h1>
      <p className="mt-3 max-w-2xl text-lg text-deep-soft">Courses for each child, and what you've paid. Prices in Australian dollars.</p>
      <p className="mt-3">
        <PlaceholderTag>Demo billing: no real payments are taken</PlaceholderTag>
      </p>

      <div className="relative">
        <CoinBurst trigger={burst} />
        <p aria-live="polite" className="mt-6 rounded-2xl bg-doubloon/25 px-4 py-3 font-bold empty:hidden">
          {message}
        </p>
      </div>

      <section aria-labelledby="courses-title" className="mt-8">
        <h2 id="courses-title" className="text-3xl">
          Courses
        </h2>
        {rows.length === 0 ? (
          <p className="mt-4 text-deep-soft">
            No paid courses yet. Every child starts free on Melody Island Module One.{' '}
            <Link to="/courses" className="font-bold text-lagoon">
              See courses
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-key">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="flex-1">
                  <span className="block font-bold">{r.product.name}</span>
                  <span className="block text-sm text-deep-soft">
                    For {r.child.firstName}. {BILLING[r.product.billing]}
                    {r.status === 'active' && `, started ${formatDate(r.startDate)}`}
                  </span>
                </span>
                <span className="font-display text-xl">{formatAud(r.product.price)}</span>
                {r.status === 'active' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-lagoon/10 px-3 py-1 text-sm font-bold text-lagoon">
                    <CircleCheck aria-hidden size={15} /> Active
                  </span>
                ) : (
                  <button type="button" onClick={() => pay(r)} className="btn bg-doubloon text-deep hover:bg-doubloon/80">
                    <CreditCard aria-hidden size={18} /> Pay {formatAud(r.product.price)}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="history-title" className="mt-12">
        <h2 id="history-title" className="flex items-center gap-2 text-3xl">
          <Clock aria-hidden className="text-lagoon" size={26} /> Payment history
        </h2>
        {paid.length ? (
          <table className="mt-4 w-full overflow-hidden rounded-[var(--radius-card)] bg-key text-left">
            <thead>
              <tr className="border-b border-line text-sm text-deep-soft">
                <th scope="col" className="px-5 py-3 font-bold">
                  Date
                </th>
                <th scope="col" className="px-5 py-3 font-bold">
                  Item
                </th>
                <th scope="col" className="px-5 py-3 text-right font-bold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {paid.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-3">{formatDate(r.startDate)}</td>
                  <td className="px-5 py-3">
                    {r.product.name} for {r.child.firstName}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatAud(r.product.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-4 text-deep-soft">No payments yet. Lesson Membership is billed each school term once its price is confirmed.</p>
        )}
      </section>
    </div>
  )
}
