import { useCallback, useRef, useState } from 'react';
import { CircleCheck, X } from 'lucide-react';
import { ToastContext } from './appContexts';

const TOAST_MS = 5000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current, { id, message }]);
      setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* Always mounted, so screen readers announce what is added to it. */}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <CircleCheck size={20} aria-hidden="true" />
            <span>{toast.message}</span>
            <button
              type="button"
              className="btn btn-icon"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
