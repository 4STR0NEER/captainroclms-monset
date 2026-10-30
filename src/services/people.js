import { localIso } from '../utils/dates'
import { insert, select, selectOne } from './db'

export function getUser(id) {
  return selectOne('users', (u) => u.id === id)
}

export function getUsersByRole(role) {
  return select('users', (u) => u.roles.includes(role))
}

export function getChildren(parentId) {
  return select('users', (u) => u.parentId === parentId)
}

export function getStudentsForTutor(tutorId) {
  return select('users', (u) => u.roles.includes('student') && u.tutorId === tutorId)
}

export function getSchools() {
  return select('schools')
}

export function getTutorNotes(studentId) {
  return select('tutorNotes', (n) => n.studentId === studentId)
}

export function addTutorNote({ studentId, tutorId, body }) {
  return insert('tutorNotes', { studentId, tutorId, body, date: localIso() })
}
