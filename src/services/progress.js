import { insert, select, upsertProgress } from './db'

export function getProgress(studentId) {
  return select('progress', (p) => p.studentId === studentId)
}

// status: 'not started' | 'practised' | 'complete'
export function setLessonStatus(studentId, lessonId, status) {
  return upsertProgress(studentId, lessonId, status)
}

export async function getPracticeLogs(studentId) {
  const logs = await select('practiceLogs', (l) => l.studentId === studentId)
  return logs.sort((a, b) => b.date.localeCompare(a.date))
}

export function addPracticeLog({ studentId, date, minutes, lessonId = null, note = '' }) {
  return insert('practiceLogs', { studentId, date, minutes, lessonId, note })
}

export function getEnrolments(studentId) {
  return select('enrolments', (e) => e.studentId === studentId)
}
