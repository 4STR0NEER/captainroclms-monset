import { isoDaysAgo } from './dates.js'

const practisedDays = (logs) => new Set(logs.filter((l) => l.minutes > 0).map((l) => l.date))

// Days in a row up to today. Not practising yet today doesn't break the streak until tomorrow.
export function currentStreak(logs, today = new Date()) {
  const days = practisedDays(logs)
  let offset = days.has(isoDaysAgo(0, today)) ? 0 : 1
  let streak = 0
  while (days.has(isoDaysAgo(offset + streak, today))) streak++
  return streak
}

export function bestStreak(logs) {
  const sorted = [...practisedDays(logs)].sort()
  let best = 0
  let run = 0
  let prev = null
  for (const day of sorted) {
    const next = prev && isoDaysAgo(-1, new Date(prev + 'T12:00:00'))
    run = next === day ? run + 1 : 1
    best = Math.max(best, run)
    prev = day
  }
  return best
}

// Minutes per day for the last `count` days, oldest first, for the chart.
export function minutesByDay(logs, count, today = new Date()) {
  return Array.from({ length: count }, (_, i) => {
    const date = isoDaysAgo(count - 1 - i, today)
    const d = new Date(date + 'T12:00:00')
    return {
      date,
      label: d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' }),
      minutes: logs.filter((l) => l.date === date).reduce((n, l) => n + l.minutes, 0),
    }
  })
}

export const totalMinutes = (logs) => logs.reduce((n, l) => n + l.minutes, 0)
