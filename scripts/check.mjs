// Checks the unlock, practice and badge rules against the seed data. Run: npm run check
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildMapState, findCurrent, hasAccess, ownedTiers, tierIncludes } from '../src/services/access.js'
import { bestStreak, currentStreak, minutesByDay } from '../src/utils/practice.js'
import { earnedBadgeIds } from '../src/utils/badges.js'

const load = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)))
const [islands, modules, lessons, progress, enrolments, products] = ['islands', 'modules', 'lessons', 'progress', 'enrolments', 'products'].map(load)

function mapFor(studentId, extraProgress = []) {
  const owned = ownedTiers(enrolments.filter((e) => e.studentId === studentId), products)
  const map = buildMapState({ islands, modules, lessons, progress: [...progress.filter((p) => p.studentId === studentId), ...extraProgress], owned })
  const mod = (id) => map.flatMap((i) => i.modules).find((m) => m.id === id).state
  const isl = (slug) => map.find((i) => i.slug === slug).state
  return { mod, isl, map }
}

// Tier rules
assert.ok(tierIncludes('member', 'home'))
assert.ok(!tierIncludes('taster', 'home'))
assert.ok(hasAccess([], 'free'))
assert.ok(!hasAccess([], 'taster'))

// Oliver: member, Module One complete, Module Two started
let o = mapFor('u-oliver')
assert.equal(o.mod('mel-m1'), 'complete')
assert.equal(o.mod('mel-m2'), 'in progress')
assert.equal(o.mod('mel-m3'), 'locked-path')
assert.equal(o.isl('melody-island'), 'in progress')
assert.equal(o.isl('exam-island'), 'not started')

// Mia: taster only (her home course enrolment is pending), Module One part done
let m = mapFor('u-mia')
assert.equal(m.mod('mel-m1'), 'in progress')
assert.equal(m.mod('mel-m2'), 'locked-path')
assert.equal(m.mod('mel-m5'), 'locked-tier')
assert.equal(m.isl('harmony-island'), 'locked')
assert.equal(m.isl('songbook-island'), 'open')
assert.equal(m.isl('exam-island'), 'locked')

// Finishing Module One unlocks Module Two for Mia
const rest = lessons.filter((l) => l.moduleId === 'mel-m1').map((l) => ({ studentId: 'u-mia', lessonId: l.id, status: 'complete' }))
m = mapFor('u-mia', rest)
assert.equal(m.mod('mel-m1'), 'complete')
assert.equal(m.mod('mel-m2'), 'not started')

// Nobody enrolled: only the free module is open
const n = mapFor('u-nobody')
assert.equal(n.mod('mel-m1'), 'not started')
assert.equal(n.isl('songbook-island'), 'locked')

// Next stop: Sam finished the only Melody module she can open, so she's sent to Notation
const sam = findCurrent(mapFor('u-sam').map)
assert.equal(sam.island.slug, 'notation-island')
assert.equal(findCurrent(mapFor('u-oliver').map).module.id, 'mel-m2')

// Practice streaks (fixed "today" so the check never depends on the clock)
const today = new Date('2026-10-30T09:00:00')
const log = (date, minutes = 10) => ({ date, minutes })
assert.equal(currentStreak([log('2026-10-30'), log('2026-10-29'), log('2026-10-28')], today), 3)
assert.equal(currentStreak([log('2026-10-29'), log('2026-10-28')], today), 2, 'no practice yet today keeps the streak')
assert.equal(currentStreak([log('2026-10-27')], today), 0)
assert.equal(currentStreak([log('2026-10-30', 0)], today), 0, 'zero minutes is not practice')
assert.equal(bestStreak([log('2026-10-01'), log('2026-10-02'), log('2026-10-03'), log('2026-10-10')]), 3)
assert.equal(bestStreak([log('2026-10-31'), log('2026-11-01')]), 2, 'streak crosses a month end')
assert.deepEqual(minutesByDay([log('2026-10-30', 15), log('2026-10-30', 5)], 2, today).map((d) => d.minutes), [0, 20])

// Badges
const badges = load('badges')
const oliverDone = progress.filter((p) => p.studentId === 'u-oliver')
const earned = earnedBadgeIds({ badges, progress: oliverDone, logs: [log('2026-10-28'), log('2026-10-29'), log('2026-10-30')], lessons })
assert.ok(earned.has('bdg-set-sail') && earned.has('bdg-module-one') && earned.has('bdg-streak-3'))
assert.ok(!earned.has('bdg-book-one') && !earned.has('bdg-streak-7') && !earned.has('bdg-first-song'))

console.log('all checks passed')
