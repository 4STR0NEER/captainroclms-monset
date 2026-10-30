// Small shared pieces used across pages.

export function PageHeader({ title, children }) {
  return (
    <header className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:pt-16">
      <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
      {children && <div className="mt-5 max-w-2xl text-lg text-deep-soft">{children}</div>}
    </header>
  )
}

// Marks invented content so it is never presented to the client as real.
export function PlaceholderTag({ children = 'Placeholder' }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-deep-soft px-2.5 py-0.5 text-xs font-bold text-deep-soft">
      {children}
    </span>
  )
}

export function Field({ label, name, type = 'text', required, error, hint, as = 'input', children, ...props }) {
  const id = `field-${name}`
  const Tag = as
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <label htmlFor={id} className="block font-bold">
        {label}
        {!required && <span className="font-normal text-deep-soft"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-deep-soft">
          {hint}
        </p>
      )}
      <Tag
        id={id}
        name={name}
        type={as === 'input' ? type : undefined}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`mt-1.5 block w-full rounded-xl border bg-key px-4 py-3 text-deep placeholder:text-deep-soft ${
          error ? 'border-buoy' : 'border-line'
        } ${as === 'textarea' ? 'min-h-32' : 'min-h-12'}`}
        {...props}
      >
        {children}
      </Tag>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-bold text-buoy">
          {error}
        </p>
      )}
    </div>
  )
}

export function Loading({ label = 'Loading…' }) {
  return <p className="mx-auto max-w-6xl px-4 py-16 text-deep-soft">{label}</p>
}

export const formatAud = (n) => (n == null ? 'Price to be confirmed' : `A$${n}`)

export const formatDate = (iso) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
