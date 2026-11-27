/**
 * Labelled control with a hint or a validation message.
 * `adornment` is rendered inside the input's right edge.
 */
export default function FormField({
  label,
  name,
  error,
  hint,
  adornment,
  as: Control = 'input',
  ...props
}) {
  const messageId = `${name}-message`;

  return (
    <div className="field">
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <div className={adornment ? 'input-wrap' : undefined}>
        <Control
          id={name}
          name={name}
          className="input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          {...props}
        />
        {adornment}
      </div>
      {(error || hint) && (
        <p id={messageId} className={error ? 'field-error' : 'field-hint'}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
