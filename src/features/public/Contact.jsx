import { useRef, useState } from 'react'
import { CircleCheck, Mail, Phone } from 'lucide-react'
import { Field, PageHeader } from '../../components/ui'
import { focusFirstError, validate } from '../../utils/forms'
import { submitContact } from '../../services/site'

const REQUIRED = {
  firstName: 'Enter your first name.',
  lastName: 'Enter your last name.',
  email: 'Enter an email address so we can reply.',
  message: 'Tell us how we can help.',
}

export default function Contact() {
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const doneRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const values = Object.fromEntries(new FormData(form))
    const found = validate(values, REQUIRED)
    setErrors(found)
    if (Object.keys(found).length) return focusFirstError(form, found)
    setSending(true)
    await submitContact(values)
    setSending(false)
    setSent(true)
    requestAnimationFrame(() => doneRef.current?.focus())
  }

  return (
    <>
      <PageHeader title="Contact Captain Roc">
        <p>Questions about lessons, courses or exams? Send a message and Roc will get back to you.</p>
      </PageHeader>

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-20 md:grid-cols-[1.5fr_1fr]">
        {sent ? (
          <div ref={doneRef} tabIndex={-1} className="self-start rounded-[var(--radius-card)] bg-key p-8 shadow-[var(--shadow-lift)]">
            <CircleCheck aria-hidden className="text-lagoon" size={32} />
            <h2 className="mt-3 text-2xl">Message received</h2>
            <p className="mt-2 text-deep-soft">Thanks for getting in touch. In this demo your message is saved in your browser only.</p>
          </div>
        ) : (
          <form noValidate onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <Field label="First name" name="firstName" required error={errors.firstName} autoComplete="given-name" />
            <Field label="Last name" name="lastName" required error={errors.lastName} autoComplete="family-name" />
            <Field label="School" name="school" as="select" defaultValue="">
              <option value="">Not at either school</option>
              <option>Newport Public School</option>
              <option>St Lukes Grammar School</option>
            </Field>
            <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
            <div className="sm:col-span-2">
              <Field label="Email" name="email" type="email" required error={errors.email} autoComplete="email" />
            </div>
            <div className="sm:col-span-2">
              <Field label="Message" name="message" as="textarea" rows={5} required error={errors.message} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </form>
        )}

        <aside aria-label="Contact details" className="space-y-8">
          <div>
            <h2 className="text-2xl">Direct</h2>
            <ul className="mt-3 space-y-3">
              <li className="flex items-center gap-3">
                <Mail aria-hidden className="text-lagoon" size={20} />
                <a href="mailto:captainroc@jazzroc.com" className="font-bold text-deep">
                  captainroc@jazzroc.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone aria-hidden className="text-lagoon" size={20} />
                <a href="tel:+61408220780" className="font-bold text-deep">
                  0408 220 780
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl">Lessons at</h2>
            <p className="mt-3">
              Newport Public School
              <br />
              <span className="text-deep-soft">Stuart St, Newport NSW 2106</span>
            </p>
            <p className="mt-3">
              St Lukes Grammar School
              <br />
              <span className="text-deep-soft">210 Headland Rd, Dee Why NSW 2099</span>
            </p>
          </div>
          <div>
            <h2 className="text-2xl">Follow along</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a href="https://www.youtube.com/@jazzrocinc.3084" target="_blank" rel="noreferrer" className="font-bold text-lagoon">
                  YouTube<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/newportschoolofmusic" target="_blank" rel="noreferrer" className="font-bold text-lagoon">
                  Facebook<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  )
}
