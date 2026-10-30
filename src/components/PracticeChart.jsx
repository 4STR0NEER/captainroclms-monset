// Minutes practised per day as bars, with a screen-reader table of the same numbers.
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function PracticeChart({ days }) {
  return (
    <>
      <div className="mt-4 h-64" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={days} margin={{ top: 8, right: 4, left: -20, bottom: 0 }} barCategoryGap={4}>
            <CartesianGrid vertical={false} stroke="#0e2a47" strokeOpacity={0.08} />
            <XAxis dataKey="label" tickFormatter={(l) => l.split(' ')[1]} tick={{ fill: '#46607a', fontSize: 12 }} axisLine={false} tickLine={false} interval={0} />
            <YAxis allowDecimals={false} tick={{ fill: '#46607a', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: '#0e2a47', fillOpacity: 0.05 }}
              formatter={(v) => [`${v} min`, 'Practice']}
              contentStyle={{ borderRadius: 12, border: '1px solid rgb(14 42 71 / 0.14)', color: '#0e2a47' }}
            />
            <Bar dataKey="minutes" fill="#13716f" radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Minutes practised per day</caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.date}>
              <th scope="row">{d.label}</th>
              <td>{d.minutes} minutes</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
