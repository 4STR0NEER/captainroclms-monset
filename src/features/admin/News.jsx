import { useState } from 'react'
import { Link } from 'react-router'
import { PenLine, Plus, Trash2 } from 'lucide-react'
import { Field, Loading, PlaceholderTag, formatDate } from '../../components/ui'
import { useAsync } from '../../utils/useAsync'
import { localIso } from '../../utils/dates'
import { focusFirstError, validate } from '../../utils/forms'
import { deletePost, getAllPosts, save } from '../../services/admin'

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export default function AdminNews() {
  const [version, setVersion] = useState(0)
  const [editing, setEditing] = useState(null) // a post, or {} for a new one
  const [message, setMessage] = useState('')
  const { data: posts, loading } = useAsync(getAllPosts, [version])
  if (loading && !posts) return <Loading />

  const done = (msg) => {
    setMessage(msg)
    setEditing(null)
    setVersion((v) => v + 1)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl sm:text-5xl">News editor</h1>
          <p className="mt-3 text-lg text-deep-soft">Posts appear on the public News page, newest first.</p>
        </div>
        <button type="button" onClick={() => setEditing({})} className="btn btn-primary">
          <Plus aria-hidden size={18} /> New post
        </button>
      </div>
      <p aria-live="polite" className="mt-4 rounded-2xl bg-lagoon/10 px-4 py-3 font-bold empty:hidden">
        {message}
      </p>

      {editing && <PostForm key={editing.id ?? 'new'} post={editing} onCancel={() => setEditing(null)} onSaved={(title) => done(`"${title}" is published.`)} />}

      <ul className="mt-8 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-key">
        {posts.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <span className="flex-1">
              <span className="block font-bold">{p.title}</span>
              <span className="block text-sm text-deep-soft">
                {formatDate(p.date)}{' '}
                <Link to={`/news/${p.slug}`} className="text-lagoon">
                  View
                </Link>
              </span>
            </span>
            {p.placeholder && <PlaceholderTag>Placeholder</PlaceholderTag>}
            <button type="button" onClick={() => setEditing(p)} className="btn btn-quiet min-h-11">
              <PenLine aria-hidden size={17} /> Edit
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm(`Delete "${p.title}"? It will disappear from the News page.`)) return
                await deletePost(p.id)
                done(`"${p.title}" is deleted.`)
              }}
              className="btn btn-quiet size-11 p-0"
              aria-label={`Delete ${p.title}`}
            >
              <Trash2 aria-hidden size={18} className="text-buoy" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PostForm({ post, onCancel, onSaved }) {
  const [errors, setErrors] = useState({})

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const v = Object.fromEntries(new FormData(form))
    const found = validate(v, { title: 'Give the post a title.', date: 'Choose a date.', body: 'Write the post.' })
    setErrors(found)
    if (Object.keys(found).length) return focusFirstError(form, found)
    await save('posts', {
      id: post.id,
      slug: post.slug ?? slugify(v.title),
      title: v.title,
      date: v.date,
      excerpt: v.excerpt || v.body.split('\n')[0].slice(0, 160),
      body: v.body,
      placeholder: false,
    })
    onSaved(v.title)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)] sm:p-6">
      <h2 className="text-2xl">{post.id ? 'Edit post' : 'New post'}</h2>
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <Field label="Title" name="title" required defaultValue={post.title} error={errors.title} />
        <Field label="Date" name="date" type="date" required defaultValue={post.date ?? localIso()} error={errors.date} />
      </div>
      <Field label="Summary" name="excerpt" defaultValue={post.excerpt} hint="One line shown on the News page. Leave empty to use the start of the post." />
      <Field label="Post" name="body" as="textarea" rows={8} required defaultValue={post.body} error={errors.body} hint="Leave a blank line between paragraphs." />
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn btn-primary">
          {post.id ? 'Save changes' : 'Publish'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-quiet">
          Cancel
        </button>
      </div>
    </form>
  )
}
