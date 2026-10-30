// Admin (Captain Roc as owner): everything across the school.
import { localIso, isoDaysAgo } from '../utils/dates'
import { insert, remove, removeWhere, select, update } from './db'

const byOrder = (a, b) => a.order - b.order

// Insert when there's no id yet, otherwise update
export function save(table, row) {
  const { id, ...rest } = row
  return id ? update(table, id, rest) : insert(table, rest)
}

export async function getOverview() {
  const [users, enrolments, products, logs, interest, contacts, progress] = await Promise.all([
    select('users'),
    select('enrolments'),
    select('products'),
    select('practiceLogs'),
    select('examInterest'),
    select('contactMessages'),
    select('progress', (p) => p.status === 'complete'),
  ])
  const students = users.filter((u) => u.roles.includes('student'))
  const weekStart = isoDaysAgo(6)
  const active = enrolments.filter((e) => e.status === 'active')
  const quiet = students.filter((s) => !logs.some((l) => l.studentId === s.id && l.date >= isoDaysAgo(5)))
  return {
    studentCount: students.length,
    activeEnrolments: active.length,
    pendingEnrolments: enrolments.filter((e) => e.status === 'pending').length,
    oneOffRevenue: active.reduce((n, e) => n + (products.find((p) => p.id === e.productId)?.price ?? 0), 0),
    weekMinutes: logs.filter((l) => l.date >= weekStart).reduce((n, l) => n + l.minutes, 0),
    lessonsCompleted: progress.length,
    newInterest: interest.filter((i) => i.status === 'new').length,
    contactCount: contacts.length,
    quiet,
    logs,
    contacts: contacts.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  }
}

export async function getStudentsTable() {
  const [users, schools, enrolments, products, progress, logs] = await Promise.all([
    select('users'),
    select('schools'),
    select('enrolments'),
    select('products'),
    select('progress', (p) => p.status === 'complete'),
    select('practiceLogs'),
  ])
  const tutors = users.filter((u) => u.roles.includes('tutor'))
  const students = users
    .filter((u) => u.roles.includes('student'))
    .map((s) => ({
      ...s,
      school: schools.find((x) => x.id === s.schoolId),
      parent: users.find((u) => u.id === s.parentId),
      enrolments: enrolments.filter((e) => e.studentId === s.id).map((e) => ({ ...e, product: products.find((p) => p.id === e.productId) })),
      lessonsComplete: progress.filter((p) => p.studentId === s.id).length,
      lastPractice: logs.filter((l) => l.studentId === s.id).map((l) => l.date).sort().at(-1) ?? null,
    }))
  return { students, tutors, schools, products }
}

export function assignTutor(studentId, tutorId) {
  return update('users', studentId, { tutorId: tutorId || null })
}

export function addEnrolment(studentId, productId) {
  return insert('enrolments', { studentId, productId, status: 'active', startDate: localIso() })
}

export function setEnrolmentStatus(id, status) {
  return update('enrolments', id, { status })
}

// The whole library as a tree: islands > modules > lessons > resources
export async function getContentTree() {
  const [islands, modules, lessons, resources] = await Promise.all([select('islands'), select('modules'), select('lessons'), select('resources')])
  return islands.sort(byOrder).map((i) => ({
    ...i,
    modules: modules
      .filter((m) => m.islandId === i.id)
      .sort(byOrder)
      .map((m) => ({
        ...m,
        lessons: lessons
          .filter((l) => l.moduleId === m.id)
          .sort(byOrder)
          .map((l) => ({ ...l, resources: resources.filter((r) => r.lessonId === l.id) })),
      })),
  }))
}

export async function deleteLesson(id) {
  await removeWhere('resources', (r) => r.lessonId === id)
  await removeWhere('progress', (p) => p.lessonId === id)
  return remove('lessons', id)
}

export function deleteResource(id) {
  return remove('resources', id)
}

export async function getExamInterest() {
  return (await select('examInterest')).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function setInterestStatus(id, status) {
  return update('examInterest', id, { status })
}

export async function getAllPosts() {
  return (await select('posts')).sort((a, b) => b.date.localeCompare(a.date))
}

export function deletePost(id) {
  return remove('posts', id)
}
