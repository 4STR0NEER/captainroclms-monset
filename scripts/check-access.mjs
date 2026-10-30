// Checks the unlock rules against the seed data. Run: npm run check
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildMapState, hasAccess, ownedTiers, tierIncludes } from '../src/services/access.js'

const load = (name) => JSON.parse(readFileSync(new URL(`../src/data/${name}.json`, import.meta.url)))
const [islands, modules, lessons, progress, enrolments, products] = ['islands', 'modules', 'lessons', 'progress', 'enrolments', 'products'].map(load)

function mapFor(studentId, extraProgress = []) {
  const owned = ownedTiers(enrolments.filter((e) => e.studentId === studentId), products)
  const map = buildMapState({ islands, modules, lessons, progress: [...progress.filter((p) => p.studentId === studentId), ...extraProgress], owned })
  const mod = (id) => map.flatMap((i) => i.modules).find((m) => m.id === id).state
  const isl = (slug) => map.find((i) => i.slug === slug).state
  return { mod, isl }
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

console.log('access checks passed')
