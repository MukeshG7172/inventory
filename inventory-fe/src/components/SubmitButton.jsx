import { LoaderCircle } from 'lucide-react';

/** Primary submit button that shows a spinner while the request is running. */
export default function SubmitButton({ busy, busyLabel, className = '', disabled, children }) {
  return (
    <button
      type="submit"
      className={`btn btn-primary ${className}`}
      disabled={busy || disabled}
      aria-busy={busy}
    >
      {busy && <LoaderCircle size={18} className="spinner" aria-hidden="true" />}
      {busy ? busyLabel : children}
    </button>
  );
}
