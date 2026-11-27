/** Single-choice filter. `counts` is optional, keyed like the options. */
export default function FilterPills({ label, options, value, counts, onChange }) {
  return (
    <div className="pills" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="pill"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          {counts && <span className="pill-count num">{counts[option.value]}</span>}
        </button>
      ))}
    </div>
  );
}
