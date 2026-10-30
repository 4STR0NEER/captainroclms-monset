// required: { fieldName: 'Message shown when it is empty' }
export function validate(values, required) {
  const errors = {}
  for (const [name, message] of Object.entries(required)) {
    if (!String(values[name] ?? '').trim()) errors[name] = message
  }
  if (values.email && !errors.email && !/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter an email address like name@example.com.'
  }
  return errors
}

// Moves focus to the first field with an error so keyboard and screen reader users land on it.
export function focusFirstError(form, errors) {
  const first = Object.keys(errors)[0]
  if (first) form.elements[first]?.focus()
}
