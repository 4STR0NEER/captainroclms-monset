// Dates as local YYYY-MM-DD strings. toISOString() would use UTC, which is "yesterday"
// every Sydney morning, so streaks would break.
const pad = (n) => String(n).padStart(2, '0')

export function localIso(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function isoDaysAgo(days, from = new Date()) {
  const d = new Date(from)
  d.setDate(d.getDate() - days)
  return localIso(d)
}
