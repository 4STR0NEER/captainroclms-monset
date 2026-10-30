// Tutor-facing data: a tutor's students, assignments ("orders") and exam readiness.
import { localIso } from '../utils/dates'
import { insert, remove, select, selectOne, update } from './db'
import { getStudentMap } from './courses'

export async function getTutorStudents(tutorId) {
  const [students, schools] = await Promise.all([
    select('users', (u) => u.roles.includes('student') && u.tutorId === tutorId),
    select('schools'),
  ])
  const rows = await Promise.all(
    students.map(async (s) => ({
      student: s,
      islands: await getStudentMap(s.id),
      logs: await select('practiceLogs', (l) => l.studentId === s.id),
    })),
  )
  // Group by school, in the schools' own order
  return schools.map((school) => ({ school, students: rows.filter((r) => r.student.schoolId === school.id) })).filter((g) => g.students.length)
}

// Assignments come back with a title and a link, whatever they point at.
export async function getAssignments(studentId) {
  const [rows, lessons, songs] = await Promise.all([
    select('assignments', (a) => a.studentId === studentId),
    select('lessons'),
    select('songs'),
  ])
  return rows
    .map((a) => {
      const item = a.kind === 'lesson' ? lessons.find((l) => l.id === a.itemId) : songs.find((s) => s.id === a.itemId)
      return { ...a, title: item?.title ?? 'Removed item', href: a.kind === 'lesson' ? `/app/lesson/${a.itemId}` : `/app/practice?song=${a.itemId}` }
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function addAssignment({ studentId, tutorId, kind, itemId, note }) {
  return insert('assignments', { studentId, tutorId, kind, itemId, note, date: localIso() })
}

export function removeAssignment(id) {
  return remove('assignments', id)
}

export function getExamReadiness(studentId) {
  return selectOne('examReadiness', (r) => r.studentId === studentId)
}

export async function saveExamReadiness(studentId, patch) {
  const existing = await getExamReadiness(studentId)
  const row = { ...patch, date: localIso() }
  return existing ? update('examReadiness', existing.id, row) : insert('examReadiness', { studentId, items: {}, ...row })
}
