// Parent-facing data: a family's children with progress, practice, tutor notes and billing.
import { insert, remove, removeWhere, select, selectOne, update } from './db'
import { getProducts, getStudentMap } from './courses'

export async function getChildSummary(childId) {
  const [child, islands, logs, notes, enrolments, products, users, schools] = await Promise.all([
    selectOne('users', (u) => u.id === childId),
    getStudentMap(childId),
    select('practiceLogs', (l) => l.studentId === childId),
    select('tutorNotes', (n) => n.studentId === childId),
    select('enrolments', (e) => e.studentId === childId),
    getProducts(),
    select('users', (u) => u.roles.includes('tutor')),
    select('schools'),
  ])
  const tutorName = (id) => {
    const t = users.find((u) => u.id === id)
    return t?.id === 'u-roc' ? 'Captain Roc' : t?.displayName
  }
  return {
    child,
    islands,
    logs: logs.sort((a, b) => b.date.localeCompare(a.date)),
    notes: notes.sort((a, b) => b.date.localeCompare(a.date)).map((n) => ({ ...n, tutorName: tutorName(n.tutorId) })),
    enrolments: enrolments.map((e) => ({ ...e, product: products.find((p) => p.id === e.productId) })),
    tutorName: tutorName(child.tutorId),
    school: schools.find((s) => s.id === child.schoolId),
  }
}

export async function getFamily(parentId) {
  const children = await select('users', (u) => u.parentId === parentId)
  return Promise.all(children.map((c) => getChildSummary(c.id)))
}

// Child profiles hold the minimum: first name, year group and school.
export function addChild(parentId, { firstName, yearGroup, schoolId }) {
  return insert('users', { roles: ['student'], displayName: firstName, firstName, yearGroup, schoolId, tutorId: null, parentId, isAdult: false })
}

export function updateChild(childId, { firstName, yearGroup, schoolId }) {
  return update('users', childId, { displayName: firstName, firstName, yearGroup, schoolId })
}

// Deleting a profile deletes everything about that child, as the privacy policy promises.
export async function deleteChild(childId) {
  for (const table of ['progress', 'practiceLogs', 'tutorNotes', 'enrolments']) {
    await removeWhere(table, (r) => r.studentId === childId)
  }
  return remove('users', childId)
}

// Demo stand-in for a real checkout: marks a pending enrolment as paid.
export function payEnrolment(enrolmentId) {
  return update('enrolments', enrolmentId, { status: 'active' })
}
