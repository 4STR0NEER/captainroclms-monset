import { useState } from 'react'
import { ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import { Field, Loading } from '../../components/ui'
import { useAuth } from '../../app/AuthContext'
import { useAsync } from '../../utils/useAsync'
import { focusFirstError, validate } from '../../utils/forms'
import { getChildren, getSchools } from '../../services/people'
import { addChild, deleteChild, updateChild } from '../../services/family'

const YEARS = ['Kindergarten', ...Array.from({ length: 12 }, (_, i) => `Year ${i + 1}`)]
const REQUIRED = { firstName: 'Enter a first name.', yearGroup: 'Choose a school year.', schoolId: 'Choose a school.' }

async function loadProfiles(parentId) {
  const [children, schools] = await Promise.all([getChildren(parentId), getSchools()])
  return { children, schools }
}

export default function Profiles() {
  const { user } = useAuth()
  const [version, setVersion] = useState(0)
  const [message, setMessage] = useState('')
  const { data, loading } = useAsync(() => loadProfiles(user.id), [user.id, version])
  if (loading && !data) return <Loading />
  const { children, schools } = data
  const refresh = (msg) => {
    setMessage(msg)
    setVersion((v) => v + 1)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 [&>*]:max-w-4xl">
      <h1 className="text-4xl sm:text-5xl">Child profiles</h1>
      <p className="mt-4 flex items-start gap-3 rounded-2xl bg-key p-4 shadow-[var(--shadow-lift)]">
        <ShieldCheck aria-hidden className="mt-0.5 shrink-0 text-lagoon" size={22} />
        <span>
          We only keep your child's first name, school year and school. No surnames, photos, birthdays or emails. You can delete a profile, and
          everything about it, at any time.
        </span>
      </p>
      <p aria-live="polite" className="mt-6 rounded-2xl bg-lagoon/10 px-4 py-3 font-bold empty:hidden">
        {message}
      </p>

      <ul className="mt-8 space-y-6">
        {children.map((c) => (
          <li key={c.id}>
            <ChildForm
              child={c}
              schools={schools}
              onSave={async (values) => {
                await updateChild(c.id, values)
                refresh(`${values.firstName}'s profile is saved.`)
              }}
              onDelete={async () => {
                if (!window.confirm(`Delete ${c.firstName}'s profile? Their progress, practice log, tutor notes and courses will be deleted too. This can't be undone.`)) return
                await deleteChild(c.id)
                refresh(`${c.firstName}'s profile and all their information have been deleted.`)
              }}
            />
          </li>
        ))}
      </ul>

      <section aria-labelledby="add-title" className="mt-12">
        <h2 id="add-title" className="flex items-center gap-2 text-3xl">
          <UserPlus aria-hidden className="text-lagoon" size={26} /> Add a child
        </h2>
        <div className="mt-4">
          <ChildForm
            key={version}
            schools={schools}
            onSave={async (values) => {
              await addChild(user.id, values)
              refresh(`Welcome aboard, ${values.firstName}! They can start on Melody Island Module One straight away.`)
            }}
          />
        </div>
      </section>
    </div>
  )
}

function ChildForm({ child, schools, onSave, onDelete }) {
  const [errors, setErrors] = useState({})
  const prefix = child?.id ?? 'new'

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const raw = Object.fromEntries(new FormData(form))
    // Field names are prefixed so several forms on one page keep unique ids
    const values = { firstName: raw[`${prefix}-firstName`]?.trim(), yearGroup: raw[`${prefix}-yearGroup`], schoolId: raw[`${prefix}-schoolId`] }
    const found = validate(values, REQUIRED)
    setErrors(found)
    if (Object.keys(found).length) return focusFirstError(form, Object.fromEntries(Object.entries(found).map(([k, v]) => [`${prefix}-${k}`, v])))
    await onSave(values)
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="rounded-[var(--radius-card)] bg-key p-5 shadow-[var(--shadow-lift)]">
      {child && <h3 className="mb-4 text-2xl">{child.firstName}</h3>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="First name" name={`${prefix}-firstName`} required defaultValue={child?.firstName} error={errors.firstName} autoComplete="off" />
        <Field label="School year" name={`${prefix}-yearGroup`} as="select" required defaultValue={child?.yearGroup ?? ''} error={errors.yearGroup}>
          <option value="" disabled>
            Choose
          </option>
          {YEARS.map((y) => (
            <option key={y}>{y}</option>
          ))}
        </Field>
        <Field label="School" name={`${prefix}-schoolId`} as="select" required defaultValue={child?.schoolId ?? ''} error={errors.schoolId}>
          <option value="" disabled>
            Choose
          </option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Field>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary">
          {child ? 'Save changes' : 'Add child'}
        </button>
        {onDelete && (
          <button type="button" onClick={onDelete} className="btn btn-quiet ml-auto">
            <Trash2 aria-hidden size={18} className="text-buoy" /> Delete profile
          </button>
        )}
      </div>
    </form>
  )
}
