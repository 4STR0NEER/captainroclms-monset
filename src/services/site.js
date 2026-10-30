import { insert, select, selectOne } from './db'

export async function getPosts() {
  return (await select('posts')).sort((a, b) => b.date.localeCompare(a.date))
}

export function getPost(slug) {
  return selectOne('posts', (p) => p.slug === slug)
}

export function getTestimonials() {
  return select('testimonials')
}

export function submitExamInterest(form) {
  return insert('examInterest', { ...form, status: 'new', createdAt: new Date().toISOString().slice(0, 10) })
}

export function submitContact(form) {
  return insert('contactMessages', { ...form, createdAt: new Date().toISOString().slice(0, 10) })
}
