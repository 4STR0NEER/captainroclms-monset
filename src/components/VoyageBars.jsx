// One progress bar per island the student can reach, in the island's colour.
export default function VoyageBars({ islands }) {
  const voyage = islands.filter((i) => i.lessonCount > 0 && i.state !== 'locked')
  return (
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
  )
}
