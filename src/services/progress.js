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

// What was practised: a lesson, a song, or neither (free practice)
export function addPracticeLog({ studentId, date, minutes, lessonId = null, songId = null, note = '' }) {
  return insert('practiceLogs', { studentId, date, minutes, lessonId, songId, note })
}

export function getEnrolments(studentId) {
  return select('enrolments', (e) => e.studentId === studentId)
}
