import { useState } from 'react'
import { ChevronRight, FileMusic, Image, MonitorPlay, PlayCircle, Plus, Trash2 } from 'lucide-react'
import { Field, Loading, PlaceholderTag } from '../../components/ui'
import { useAsync } from '../../utils/useAsync'
import { focusFirstError, validate } from '../../utils/forms'
import { deleteLesson, deleteResource, getContentTree, save } from '../../services/admin'

const TIERS = [
  ['free', 'Free (Module One)'],
  ['taster', 'New Players Taster Course'],
  ['home', 'Progress at Home Course'],
  ['member', 'Lesson Membership'],
]
const LESSON_TYPES = ['reading', 'mixed', 'song', 'exercise', 'exam']
const KIND_ICON = { pdf: FileMusic, video: PlayCircle, youtube: MonitorPlay, image: Image }
const TABLE = { island: 'islands', module: 'modules', lesson: 'lessons', resource: 'resources' }

export default function AdminContent() {
  const [version, setVersion] = useState(0)
  const { data: tree, loading } = useAsync(getContentTree, [version])
  // selected: { type, id } to edit, or { type, parentId } to add
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  if (loading && !tree) return <Loading />

  const find = ({ type, id }) => {
    for (const i of tree) {
      if (type === 'island' && i.id === id) return i
      for (const m of i.modules) {
        if (type === 'module' && m.id === id) return m
        for (const l of m.lessons) {
          if (type === 'lesson' && l.id === id) return l
          if (type === 'resource') {
            const r = l.resources.find((x) => x.id === id)
            if (r) return r
          }
        }
      }
    }
    return null
  }
  const current = selected?.id ? find(selected) : null

  async function handleSaved(row, label) {
    const saved = await save(TABLE[selected.type], row)
    setMessage(`${label} saved.`)
    setSelected({ type: selected.type, id: saved.id })
    setVersion((v) => v + 1)
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${current.title}"? Students' progress on it will be removed too.`)) return
    await (selected.type === 'lesson' ? deleteLesson(current.id) : deleteResource(current.id))
    setMessage(`"${current.title}" deleted.`)
    setSelected(null)
    setVersion((v) => v + 1)
  }

  const node = (type, item, label, depth, extra) => (
    <button
      type="button"
      onClick={() => setSelected({ type, id: item.id })}
      aria-current={selected?.id === item.id ? 'true' : undefined}
      className={`flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-sm ${selected?.id === item.id ? 'bg-deep text-key' : 'hover:bg-foam'}`}
      style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
    >
      {extra}
      <span className="flex-1">{label}</span>
      {item.placeholder && <span className="text-xs opacity-70">placeholder</span>}
    </button>
  )
  const addButton = (type, parentId, label, depth) => (
    <button
      type="button"
      onClick={() => setSelected({ type, parentId })}
      className="flex min-h-10 w-full items-center gap-1.5 rounded-lg px-2 text-left text-sm font-bold text-lagoon hover:bg-foam"
      style={{ paddingLeft: `${0.5 + depth * 1}rem` }}
    >
      <Plus aria-hidden size={15} /> {label}
    </button>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl sm:text-5xl">Content library</h1>
      <p className="mt-3 text-lg text-deep-soft">Islands, modules, lessons and their sheet music and videos. Pick anything to edit it.</p>
      <p aria-live="polite" className="mt-4 rounded-2xl bg-lagoon/10 px-4 py-3 font-bold empty:hidden">
        {message}
      </p>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <nav aria-label="Content tree" className="max-h-[75vh] overflow-y-auto rounded-[var(--radius-card)] bg-key p-3 shadow-[var(--shadow-lift)]">
          <ul>
            {tree.map((island) => (
              <li key={island.id}>
                <details open={island.slug === 'melody-island'} className="group/island">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-2 font-bold hover:bg-foam">
                    <ChevronRight aria-hidden size={16} className="shrink-0 transition-transform group-open/island:rotate-90" />
                    <span aria-hidden className="size-3 rounded-full" style={{ background: island.themeColour }} />
                    {island.name}
                  </summary>
                  {node('island', island, 'Island details', 1)}
                  {island.modules.map((m) => (
                    <details key={m.id} className="group/module ml-2">
                      <summary className="flex min-h-10 cursor-pointer list-none items-center rounded-lg px-2 text-sm font-bold hover:bg-foam" style={{ paddingLeft: '1.25rem' }}>
                        <ChevronRight aria-hidden size={15} className="mr-1.5 shrink-0 transition-transform group-open/module:rotate-90" />
                        {m.title}
                        <span className="ml-auto text-xs font-normal text-deep-soft">{m.lessons.length} lessons</span>
                      </summary>
                      {node('module', m, 'Module details', 2)}
                      {m.lessons.map((l) => (
                        <div key={l.id}>
                          {node('lesson', l, `${l.order}. ${l.title}`, 2)}
                          {selected && (selected.id === l.id || l.resources.some((r) => r.id === selected.id) || selected.parentId === l.id) && (
                            <>
                              {l.resources.map((r) => {
                                const Icon = KIND_ICON[r.kind] ?? FileMusic
                                return <div key={r.id}>{node('resource', r, r.title, 3, <Icon aria-hidden size={15} />)}</div>
                              })}
                              {addButton('resource', l.id, 'Add sheet music or video', 3)}
                            </>
                          )}
                        </div>
                      ))}
                      {addButton('lesson', m.id, 'Add a lesson', 2)}
                    </details>
                  ))}
                  {island.modules.length > 0 && addButton('module', island.id, 'Add a module', 1)}
                </details>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-label="Editor" className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)] sm:p-6 lg:sticky lg:top-40">
          {!selected ? (
            <div className="py-10 text-center">
              <p className="text-xl font-bold">Choose something to edit</p>
              <p className="mt-1 text-deep-soft">Open an island on the left, then pick a module, lesson or piece of sheet music.</p>
            </div>
          ) : (
            <Editor key={`${selected.type}-${selected.id ?? 'new-' + selected.parentId}`} selected={selected} current={current} tree={tree} onSave={handleSaved} onDelete={handleDelete} />
          )}
        </section>
      </div>
    </div>
  )
}

function Editor({ selected, current, tree, onSave, onDelete }) {
  const [errors, setErrors] = useState({})
  const { type } = selected
  const isNew = !current
  const parentModule = type === 'lesson' && tree.flatMap((i) => i.modules).find((m) => m.id === (current?.moduleId ?? selected.parentId))
  const parentIsland = type === 'module' && tree.find((i) => i.id === (current?.islandId ?? selected.parentId))
  const parentLesson = type === 'resource' && tree.flatMap((i) => i.modules.flatMap((m) => m.lessons)).find((l) => l.id === (current?.lessonId ?? selected.parentId))

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const v = Object.fromEntries(new FormData(form))
    const nameKey = type === 'island' ? 'name' : 'title'
    const found = validate(v, { [nameKey]: 'Give it a name.' })
    if (v.url && !/^https:\/\//.test(v.url)) found.url = 'Links must start with https://'
    setErrors(found)
    if (Object.keys(found).length) return focusFirstError(form, found)

    const placeholder = v.placeholder === 'on'
    const base = { id: current?.id, ...(placeholder ? { placeholder: true } : { placeholder: false }) }
    if (type === 'island') return onSave({ id: current.id, name: v.name, description: v.description, accessTier: v.accessTier }, v.name)
    if (type === 'module') {
      const order = current?.order ?? parentIsland.modules.length + 1
      return onSave(
        {
          ...base,
          islandId: parentIsland.id,
          title: v.title,
          order,
          book: v.book ? Number(v.book) : null,
          accessTier: v.accessTier,
          unlockRule: v.unlockAfter ? { type: 'completeModule', moduleId: v.unlockAfter } : null,
        },
        v.title,
      )
    }
    if (type === 'lesson') {
      const order = current?.order ?? parentModule.lessons.length + 1
      return onSave({ ...base, moduleId: parentModule.id, title: v.title, order, type: v.lessonType, notes: v.notes }, v.title)
    }
    return onSave({ ...base, lessonId: parentLesson.id, kind: v.kind, title: v.title, url: v.url || null, placeholder: placeholder || !v.url }, v.title)
  }

  const heading = { island: 'Island', module: 'Module', lesson: 'Lesson', resource: 'Sheet music or video' }[type]
  const where = (parentIsland && parentIsland.name) || (parentModule && parentModule.title) || (parentLesson && parentLesson.title)

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-2xl">
          {isNew ? `New ${heading.toLowerCase()}` : heading}
        </h2>
        {where && <p className="text-deep-soft">In {where}</p>}
      </div>

      {type === 'island' && (
        <>
          <Field label="Name" name="name" required defaultValue={current.name} error={errors.name} />
          <Field label="Description" name="description" as="textarea" rows={3} defaultValue={current.description} />
          <TierField defaultValue={current.accessTier} label="Who can open it (when it has no modules)" />
          <p className="text-sm text-deep-soft">New islands need a spot drawn on the map, so they're added by the developer.</p>
        </>
      )}

      {type === 'module' && (
        <>
          <Field label="Title" name="title" required defaultValue={current?.title} error={errors.title} />
          <div className="grid gap-4 sm:grid-cols-2">
            <TierField defaultValue={current?.accessTier ?? 'taster'} label="Included in" />
            <Field label="Book" name="book" as="select" defaultValue={current?.book ?? ''}>
              <option value="">No book</option>
              <option value="1">Book One</option>
              <option value="2">Book Two</option>
            </Field>
          </div>
          <Field label="Unlocks after" name="unlockAfter" as="select" defaultValue={current?.unlockRule?.moduleId ?? ''} hint="Students must complete this module first.">
            <option value="">Open straight away</option>
            {parentIsland.modules
              .filter((m) => m.id !== current?.id)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
          </Field>
          <PlaceholderBox defaultChecked={current ? current.placeholder : true} />
        </>
      )}

      {type === 'lesson' && (
        <>
          <Field label="Title" name="title" required defaultValue={current?.title} error={errors.title} />
          <Field label="Type" name="lessonType" as="select" defaultValue={current?.type ?? 'mixed'}>
            {LESSON_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Field>
          <Field label="Captain's orders (lesson notes)" name="notes" as="textarea" rows={3} defaultValue={current?.notes} />
          <PlaceholderBox defaultChecked={current ? current.placeholder : true} />
          {current && <p className="text-sm text-deep-soft">{current.resources.length} pieces of sheet music and video. Open them in the tree on the left.</p>}
        </>
      )}

      {type === 'resource' && (
        <>
          <Field label="Kind" name="kind" as="select" defaultValue={current?.kind ?? 'pdf'}>
            <option value="pdf">Sheet music (PDF)</option>
            <option value="video">Video (MP4)</option>
            <option value="youtube">YouTube video</option>
            <option value="image">Image</option>
          </Field>
          <Field label="Title" name="title" required defaultValue={current?.title} error={errors.title} />
          <Field label="Link" name="url" type="url" defaultValue={current?.url ?? ''} error={errors.url} hint="Leave empty while the file isn't ready; students will see “on its way”." />
          {current?.urlVerified === false && <PlaceholderTag>Page-to-file match to confirm</PlaceholderTag>}
        </>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" className="btn btn-primary">
          {isNew ? 'Add' : 'Save changes'}
        </button>
        {current && (type === 'lesson' || type === 'resource') && (
          <button type="button" onClick={onDelete} className="btn btn-quiet ml-auto">
            <Trash2 aria-hidden size={18} className="text-buoy" /> Delete
          </button>
        )}
      </div>
    </form>
  )
}

function TierField({ defaultValue, label }) {
  return (
    <Field label={label} name="accessTier" as="select" defaultValue={defaultValue}>
      {TIERS.map(([value, text]) => (
        <option key={value} value={value}>
          {text}
        </option>
      ))}
    </Field>
  )
}

function PlaceholderBox({ defaultChecked }) {
  return (
    <label className="flex min-h-11 items-center gap-3">
      <input type="checkbox" name="placeholder" defaultChecked={Boolean(defaultChecked)} className="size-5 accent-[#13716f]" />
      Placeholder content (not real JazzRoc material yet)
    </label>
  )
}
