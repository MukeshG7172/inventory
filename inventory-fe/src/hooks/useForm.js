import { useState } from 'react';

/**
 * Form state with inline validation.
 *
 * `validate(values)` returns { field: message } for client-side problems.
 * A field's message appears after the user edits and leaves it, or on submit.
 * The backend's per-field errors show until that field is edited again.
 */
export function useForm(initialValues, onSubmit, validate) {
  const [values, setValues] = useState(initialValues);
  const [edited, setEdited] = useState({});
  const [touched, setTouched] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState(null);
  const [serverErrors, setServerErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const clientErrors = validate?.(values) ?? {};

  const fieldErrors = { ...serverErrors };
  for (const [name, message] of Object.entries(clientErrors)) {
    if (attempted || touched[name]) fieldErrors[name] = message;
  }

  const setValue = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
    setEdited((current) => ({ ...current, [name]: true }));
    setServerErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleChange = (event) => setValue(event.target.name, event.target.value);

  /* Leaving an untouched field is not an error yet. */
  const handleBlur = (event) => {
    const { name } = event.target;
    if (edited[name]) setTouched((current) => ({ ...current, [name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    setError(null);
    setServerErrors({});

    const invalid = Object.keys(clientErrors);
    if (invalid.length > 0) {
      event.currentTarget.elements.namedItem(invalid[0])?.focus?.();
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err);
      setServerErrors(err.fieldErrors ?? {});
    } finally {
      setSubmitting(false);
    }
  };

  return {
    values,
    error,
    attempted,
    dismissError: () => setError(null),
    fieldErrors,
    submitting,
    handleSubmit,
    /** Spread onto a control: {...form.field('username')} */
    field: (name) => ({
      name,
      value: values[name],
      error: fieldErrors[name],
      onChange: handleChange,
      onBlur: handleBlur,
    }),
    handleChange,
    setValue,
  };
}
