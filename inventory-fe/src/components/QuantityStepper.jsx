import { Minus, Plus } from 'lucide-react';

/**
 * Whole-number input with - and + buttons, held between 1 and max.
 * The value is a string so the field can be empty while the user retypes it.
 */
export default function QuantityStepper({ label, name, value, max, error, disabled, onChange }) {
  const amount = Number(value) || 0;
  const messageId = `${name}-message`;
  const set = (next) => onChange(String(Math.min(Math.max(next, 1), max)));

  return (
    <div className="field">
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <div className="stepper">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => set(amount - 1)}
          disabled={disabled || amount <= 1}
          aria-label="Decrease quantity"
        >
          <Minus size={16} aria-hidden="true" />
        </button>
        <input
          id={name}
          name={name}
          className="input num"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={value}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={messageId}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '');
            if (digits === '') onChange('');
            else set(Number(digits));
          }}
          onBlur={() => {
            if (!disabled && value === '') onChange('1');
          }}
          onKeyDown={(event) => {
            if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
            event.preventDefault();
            set(amount + (event.key === 'ArrowUp' ? 1 : -1));
          }}
        />
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => set(amount + 1)}
          disabled={disabled || amount >= max}
          aria-label="Increase quantity"
        >
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
      <p id={messageId} className={error ? 'field-error' : 'field-hint'}>
        {error || (disabled ? 'Choose a product first.' : `Maximum ${max} available.`)}
      </p>
    </div>
  );
}
