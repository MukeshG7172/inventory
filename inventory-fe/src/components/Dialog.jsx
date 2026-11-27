import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';

const EXIT_MS = 180;

/**
 * Modal or slide-over drawer built on <dialog>, which traps and restores focus.
 * `children` may be a function receiving close(), so inner buttons animate too.
 * Closing is ignored while a button inside is busy submitting.
 */
export default function Dialog({
  title,
  onClose,
  variant = 'modal',
  dismissOnBackdrop = false,
  children,
}) {
  const ref = useRef(null);
  const [closing, setClosing] = useState(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector('[data-autofocus]')?.focus();
    return () => dialog.close();
  }, []);

  /* A drawer closes once its exit animation has had time to play. */
  useEffect(() => {
    if (!closing) return undefined;
    const timer = setTimeout(onClose, EXIT_MS);
    return () => clearTimeout(timer);
  }, [closing, onClose]);

  const close = () => {
    /* Only the open modal dialog can hold a busy button the user is looking at. */
    if (document.querySelector('dialog[open] [aria-busy="true"]')) return;
    if (variant === 'drawer') setClosing(true);
    else onClose();
  };

  return (
    <dialog
      ref={ref}
      className={`dialog dialog-${variant} ${closing ? 'closing' : ''}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      /* The browser can close it without "cancel", e.g. on a repeated Escape. */
      onClose={() => {
        if (!ref.current?.open) onClose();
      }}
      /* The backdrop is the only area that targets the dialog element itself. */
      onClick={(event) => {
        if (dismissOnBackdrop && event.target === ref.current) close();
      }}
    >
      <div className="dialog-panel">
        <div className="card-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="btn btn-icon" onClick={close} aria-label="Close">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="dialog-body">
          {typeof children === 'function' ? children(close) : children}
        </div>
      </div>
    </dialog>
  );
}
