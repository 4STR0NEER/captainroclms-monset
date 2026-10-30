import { Link } from 'react-router'
import { Check, Minus } from 'lucide-react'
import { Loading, PageHeader, PlaceholderTag, formatAud } from '../../components/ui'
import { useAsync } from '../../utils/useAsync'
import { getIslands, getModules, getProducts } from '../../services/courses'
import { tierIncludes } from '../../services/access'

const BILLING = { once: 'one-off payment', term: 'per school term', monthly: 'per month' }

// "Module Two" + "Module Four" -> "Modules Two to Four"
const shortTitle = (t) => t.split(':')[0]
function rangeLabel(group) {
  if (group.length === 1) return shortTitle(group[0].title)
  const first = shortTitle(group[0].title).replace('Module ', '')
  const last = shortTitle(group.at(-1).title).replace('Module ', '')
  return `Modules ${first} to ${last}`
}

async function loadCourses() {
  const [products, islands, modules] = await Promise.all([getProducts(), getIslands(), getModules()])
  // One table row per island, split where modules inside it need different tiers
  const rows = islands.flatMap((island) => {
    const ims = modules.filter((m) => m.islandId === island.id)
    if (!ims.length) return [{ key: island.id, name: island.name, tier: island.accessTier }]
    const groups = []
    for (const m of ims) {
      const last = groups.at(-1)
      if (last && last[0].accessTier === m.accessTier) last.push(m)
      else groups.push([m])
    }
    return groups.map((g) => ({
      key: g[0].id,
      name: island.name,
      detail: groups.length > 1 ? rangeLabel(g) : null,
      tier: g[0].accessTier,
    }))
  })
  return { products, rows }
}

export default function Courses() {
  const { data, loading } = useAsync(loadCourses)
  if (loading) return <Loading />
  const { products, rows } = data

  const plans = [
    { id: 'free', name: 'Module One free', price: 0, accessTier: 'free', billing: null, description: 'Melody Island Module One with a free family account.' },
    ...products,
  ]

  return (
    <>
      <PageHeader title="Courses and pricing">
        <p>Start free, then choose how far you want to sail. One family account covers every child, and prices are in Australian dollars.</p>
      </PageHeader>

      <section aria-label="Plans" className="mx-auto max-w-6xl px-4">
        <ul className="grid overflow-hidden rounded-[var(--radius-card)] border border-line bg-key sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <li key={p.id} className="flex flex-col border-line p-6 not-last:border-b sm:[&:nth-child(odd)]:border-r lg:not-last:border-b-0 lg:not-last:border-r">
              <h2 className="text-2xl">{p.name}</h2>
              <p className="mt-3">
                <span className="font-display text-4xl">{p.price === 0 ? 'Free' : formatAud(p.price)}</span>
                {p.billing && p.price != null && <span className="block text-deep-soft">{BILLING[p.billing]}</span>}
                {p.billing && p.price == null && <span className="block text-deep-soft">Billed {BILLING[p.billing]}</span>}
              </p>
              <p className="mt-4 flex-1 text-deep-soft">{p.description}</p>
              {p.tbc && (
                <p className="mt-3">
                  <PlaceholderTag>Price TBC</PlaceholderTag>
                </p>
              )}
              <Link to={p.tbc ? '/contact' : '/login'} className={`btn mt-6 ${p.id === 'free' ? 'btn-primary' : 'btn-quiet'}`}>
                {p.id === 'free' ? 'Start free' : p.tbc ? 'Ask about membership' : 'Choose this course'}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="unlocks-title" className="mx-auto max-w-6xl px-4 py-20">
        <h2 id="unlocks-title" className="text-3xl sm:text-4xl">
          What each plan unlocks
        </h2>
        <div className="mt-8 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-key">
          <table className="w-full min-w-[640px] text-left">
            <caption className="sr-only">Islands and modules included in each plan</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="p-4">
                  Island
                </th>
                {plans.map((p) => (
                  <th key={p.id} scope="col" className="p-4 text-center">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key} className="border-b border-line last:border-b-0">
                  <th scope="row" className="p-4 font-normal">
                    <span className="font-bold">{r.name}</span>
                    {r.detail && <span className="block text-sm text-deep-soft">{r.detail}</span>}
                  </th>
                  {plans.map((p) => (
                    <td key={p.id} className="p-4 text-center">
                      {tierIncludes(p.accessTier, r.tier) ? (
                        <Check className="mx-auto text-lagoon" size={22} aria-label="Included" />
                      ) : (
                        <Minus className="mx-auto text-deep/30" size={22} aria-label="Not included" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-deep-soft">
          Which plan unlocks which island is a proposed structure for the demo, to be confirmed with Captain Roc.
        </p>
      </section>
    </>
  )
}
