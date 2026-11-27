import { useState } from 'react';
import { LoaderCircle, Trash2, TriangleAlert } from 'lucide-react';
import { client } from '../api/client';
import { useRefresh, useToast } from '../context/appContexts';
import { formatCount } from '../utils/format';
import Alert from './Alert';
import Dialog from './Dialog';

/* Orders keep a required reference to their product, so the database refuses. */
function describe(error) {
  if (/constraint|foreign key/i.test(error.message)) {
    return 'This product has order history, so it cannot be deleted. Set its stock to 0 to stop further purchases.';
  }
  return error.message;
}

export default function DeleteProductModal({ product, onClose }) {
  const { refresh } = useRefresh();
  const toast = useToast();
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);
    try {
      await client.delete(`/products/${product.id}`);
      toast(`"${product.name}" deleted`);
      refresh();
      onClose();
    } catch (err) {
      setError(describe(err));
      setDeleting(false);
    }
  };

  return (
    <Dialog title="Delete product?" onClose={onClose}>
      {(close) => (
        <div className="form">
          {error && <Alert>{error}</Alert>}
          <div className="warning-box">
            <TriangleAlert size={20} aria-hidden="true" />
            <p>
              <strong>{product.name}</strong> and its{' '}
              <span className="num">{formatCount(product.quantity)}</span> units of stock will be
              permanently removed from the catalog. This cannot be undone.
            </p>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={close}
              disabled={deleting}
              data-autofocus
            >
              Keep product
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
              aria-busy={deleting}
            >
              {deleting ? (
                <LoaderCircle size={16} className="spinner" aria-hidden="true" />
              ) : (
                <Trash2 size={16} aria-hidden="true" />
              )}
              {deleting ? 'Deleting…' : 'Delete product'}
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
