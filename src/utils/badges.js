import { bestStreak, totalMinutes } from './practice.js'

// Which badges a student has earned, from their progress and practice logs.
export function earnedBadgeIds({ badges, progress, logs, lessons }) {
  const complete = new Set(progress.filter((p) => p.status === 'complete').map((p) => p.lessonId))
  const moduleDone = (id) => {
    const ls = lessons.filter((l) => l.moduleId === id)
    return ls.length > 0 && ls.every((l) => complete.has(l.id))
  }
  const rules = {
    lessonsComplete: (r) => complete.size >= r.count,
    moduleComplete: (r) => moduleDone(r.moduleId),
    modulesComplete: (r) => r.moduleIds.every(moduleDone),
    streak: (r) => bestStreak(logs) >= r.days,
    totalMinutes: (r) => totalMinutes(logs) >= r.minutes,
    logCount: (r) => logs.length >= r.count,
    songPractised: () => logs.some((l) => l.songId),
  }
  return new Set(badges.filter((b) => rules[b.rule.type]?.(b.rule)).map((b) => b.id))
}
