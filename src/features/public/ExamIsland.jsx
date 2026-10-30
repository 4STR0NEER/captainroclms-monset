import { useRef, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { Field, PageHeader } from '../../components/ui'
import { focusFirstError, validate } from '../../utils/forms'
import { submitExamInterest } from '../../services/site'

const SECTIONS = [
  { name: 'Scales', marks: 21, colour: 'bg-lagoon', detail: 'Scales, practised on Exam Island and in lessons.' },
  { name: 'Songs', marks: 90, colour: 'bg-deep', detail: 'Three songs, each marked out of 30.' },
  { name: 'Quick Studies', marks: 21, colour: 'bg-doubloon', detail: 'Sight reading or playing by ear, plus an improvised response.' },
  { name: 'Aural tests', marks: 18, colour: 'bg-buoy', detail: 'Listening and responding, see below.' },
]
const TOTAL = SECTIONS.reduce((n, s) => n + s.marks, 0)

const AURAL = ['Clap the pulse of a piece', 'Clap back rhythms', 'Sing back a short phrase', 'Question and answer playing']

const GRADES = ['None yet', 'Initial', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']

const REQUIRED = {
  parentFirstName: "Enter the parent's first name.",
  parentLastName: "Enter the parent's last name.",
  childFirstName: "Enter your child's first name.",
  lastGrade: 'Choose the grade of the last exam, or None yet.',
  email: 'Enter an email address so Captain Roc can reply.',
}

export default function ExamIsland() {
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(null)
  const doneRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const found = validate(values, REQUIRED)
    setErrors(found)
    if (Object.keys(found).length) return focusFirstError(form, found)
    setSending(true)
    await submitExamInterest({ ...values, lastExamDate: values.lastExamDate || null })
    setSending(false)
    setSent(values.childFirstName)
    requestAnimationFrame(() => doneRef.current?.focus())
  }

  return (
    <>
      <PageHeader title="Exam Island">
        <p>
          Exams are optional, and always an adventure. For students who want a challenge, Captain Roc prepares students for the ABRSM Jazz Piano
          and Jazz Ensemble exams, set by the Associated Board of the Royal Schools of Music in London.
        </p>
      </PageHeader>

      <section aria-labelledby="marks-title" className="mx-auto max-w-6xl px-4 pb-20">
        <h2 id="marks-title" className="text-3xl sm:text-4xl">
          Where the marks are
        </h2>
        <p className="mt-3 text-lg text-deep-soft">A Jazz Piano exam has four sections, worth {TOTAL} marks in total.</p>
        <div className="mt-8 flex h-6 overflow-hidden rounded-full" aria-hidden>
          {SECTIONS.map((s) => (
            <span key={s.name} className={s.colour} style={{ width: `${(s.marks / TOTAL) * 100}%` }} />
          ))}
        </div>
        <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {SECTIONS.map((s) => (
            <div key={s.name}>
              <dt className="flex items-center gap-2 text-xl font-bold">
                <span aria-hidden className={`size-3 rounded-full ${s.colour}`} />
                {s.name}
              </dt>
              <dd className="mt-1">
                <span className="font-display text-3xl">{s.marks}</span> <span className="text-deep-soft">marks</span>
              </dd>
              <dd className="mt-2 text-deep-soft">{s.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="aural-title" className="bg-key">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2">
          <div>
            <h2 id="aural-title" className="text-3xl sm:text-4xl">
              The aural tests
            </h2>
            <p className="mt-4 max-w-md text-lg text-deep-soft">
              Listening is a big part of jazz. These four tests are practised in lessons until they feel like games.
            </p>
          </div>
          <ol className="space-y-4">
            {AURAL.map((a, i) => (
              <li key={a} className="flex items-center gap-4 text-lg">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-foam font-display">{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="interest-title" className="mx-auto max-w-3xl px-4 py-20">
        <h2 id="interest-title" className="text-3xl sm:text-4xl">
          Register your interest
        </h2>
        <p className="mt-3 text-lg text-deep-soft">Tell us a little about your child and Captain Roc will be in touch about exam preparation.</p>

        {sent ? (
          <div ref={doneRef} tabIndex={-1} className="mt-8 rounded-[var(--radius-card)] bg-key p-8 shadow-[var(--shadow-lift)]">
            <CircleCheck aria-hidden className="text-lagoon" size={32} />
            <h3 className="mt-3 text-2xl">Thanks, we have your details</h3>
            <p className="mt-2 text-deep-soft">Captain Roc will email you about exam preparation for {sent}. In this demo the form is saved in your browser only.</p>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
            <Field label="Parent first name" name="parentFirstName" required error={errors.parentFirstName} autoComplete="given-name" />
            <Field label="Parent last name" name="parentLastName" required error={errors.parentLastName} autoComplete="family-name" />
            <Field label="Child first name" name="childFirstName" required error={errors.childFirstName} />
            <Field label="Grade of last exam" name="lastGrade" as="select" required error={errors.lastGrade} defaultValue="">
              <option value="" disabled>
                Choose a grade
              </option>
              {GRADES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Field>
            <Field label="Date of last exam" name="lastExamDate" type="date" />
            <Field label="Email" name="email" type="email" required error={errors.email} autoComplete="email" />
            <div className="sm:col-span-2">
              <Field label="Message" name="message" as="textarea" rows={4} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Sending…' : 'Register interest'}
              </button>
            </div>
          </form>
        )}
      </section>
    </>
  )
}
