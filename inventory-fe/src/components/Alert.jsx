import { CircleAlert, CircleCheck, X } from 'lucide-react';

/** Banner. Pass onDismiss to show a close button. */
export default function Alert({ variant = 'danger', onDismiss, children }) {
  const Icon = variant === 'success' ? CircleCheck : CircleAlert;

  return (
    <div className={`alert alert-${variant}`} role={variant === 'danger' ? 'alert' : 'status'}>
      <Icon size={20} aria-hidden="true" />
      <span className="alert-text">{children}</span>
      {onDismiss && (
        <button type="button" className="btn btn-icon" onClick={onDismiss} aria-label="Dismiss">
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
