import { select, selectOne } from './db'

const byOrder = (a, b) => a.order - b.order

export async function getIslands() {
  return (await select('islands')).sort(byOrder)
}

export function getIsland(slug) {
  return selectOne('islands', (i) => i.slug === slug)
}

export async function getModules(islandId) {
  const where = islandId ? (m) => m.islandId === islandId : undefined
  return (await select('modules', where)).sort(byOrder)
}

export async function getLessons(moduleId) {
  const where = moduleId ? (l) => l.moduleId === moduleId : undefined
  return (await select('lessons', where)).sort(byOrder)
}

// A lesson with its resources and module, ready for the lesson player.
export async function getLesson(id) {
  const lesson = await selectOne('lessons', (l) => l.id === id)
  if (!lesson) return null
  const [resources, module] = await Promise.all([
    select('resources', (r) => r.lessonId === id),
    selectOne('modules', (m) => m.id === lesson.moduleId),
  ])
  return { ...lesson, resources, module }
}

export function getSongs(collection) {
  return select('songs', collection ? (s) => s.collection === collection : undefined)
}

export function getProducts() {
  return select('products')
}

export function getBadges() {
  return select('badges')
}
