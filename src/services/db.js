// The only file that touches seed data and localStorage.
// Every service imports from here; when Supabase arrives, the services swap these helpers
// for supabase.from(table) calls and components never notice.
import islands from '../data/islands.json'
import modules from '../data/modules.json'
import lessons from '../data/lessons.json'
import resources from '../data/resources.json'
import songs from '../data/songs.json'
import schools from '../data/schools.json'
import users from '../data/users.json'
import products from '../data/products.json'
import enrolments from '../data/enrolments.json'
import progress from '../data/progress.json'
import practiceLogs from '../data/practiceLogs.json'
import tutorNotes from '../data/tutorNotes.json'
import examInterest from '../data/examInterest.json'
import badges from '../data/badges.json'
import posts from '../data/posts.json'
import testimonials from '../data/testimonials.json'
import { isoDaysAgo, localIso } from '../utils/dates'

// Bump the version whenever seed data changes, so browsers drop their old saved copy
const STORAGE_KEY = 'jazzroc-demo-db-v2'
const SEED = { islands, modules, lessons, resources, songs, schools, users, products, enrolments, progress, practiceLogs, tutorNotes, examInterest, badges, posts, testimonials, contactMessages: [] }

// Seed dates are stored as "days ago" so the demo always looks current.
const RELATIVE_DATES = { daysAgo: 'date', startDaysAgo: 'startDate', updatedDaysAgo: 'updatedAt', createdDaysAgo: 'createdAt' }


function freshDb() {
  const db = structuredClone(SEED)
  for (const rows of Object.values(db)) {
    for (const row of rows) {
      for (const [from, to] of Object.entries(RELATIVE_DATES)) {
        if (from in row) {
          row[to] = isoDaysAgo(row[from])
          delete row[from]
        }
      }
    }
  }
  return db
}

function loadDb() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // Private mode or corrupt data: fall back to fresh seed
  }
  return freshDb()
}

let db = loadDb()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Storage full or blocked: the demo keeps working in memory
  }
}

// Fake network latency so loading states are real. Returns copies so components can't mutate the db.
const respond = (value) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), 120))

export function select(table, where = () => true) {
  return respond(db[table].filter(where))
}

export function selectOne(table, where) {
  return respond(db[table].find(where) ?? null)
}

export function insert(table, row) {
  const newRow = { id: `${table}-${crypto.randomUUID().slice(0, 8)}`, ...row }
  db[table].push(newRow)
  persist()
  return respond(newRow)
}

export function update(table, id, patch) {
  const row = db[table].find((r) => r.id === id)
  if (!row) return Promise.reject(new Error(`${table} ${id} not found`))
  Object.assign(row, patch)
  persist()
  return respond(row)
}

export function remove(table, id) {
  db[table] = db[table].filter((r) => r.id !== id)
  persist()
  return respond(true)
}

// Progress has no id: one row per student + lesson (a composite key in Supabase).
export function upsertProgress(studentId, lessonId, status) {
  const row = db.progress.find((p) => p.studentId === studentId && p.lessonId === lessonId)
  const updatedAt = localIso()
  if (row) Object.assign(row, { status, updatedAt })
  else db.progress.push({ studentId, lessonId, status, updatedAt })
  persist()
  return respond({ studentId, lessonId, status, updatedAt })
}

export function resetDemo() {
  db = freshDb()
  persist()
}
