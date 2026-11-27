import { Link } from 'react-router-dom';
import { Pencil, ShoppingCart, Trash2 } from 'lucide-react';

/* PUT and DELETE are limited by the backend to the product's creator. */
export default function ProductActions({ product, user, onDelete }) {
  if (user.role === 'SELLER') {
    if (product.quantity === 0) {
      /* Disabled buttons get no hover, so the wrapper carries the tooltip. */
      return (
        <span className="tooltip-host" title="Out of stock: nothing to buy" tabIndex={0}>
          <button type="button" className="btn btn-primary btn-sm" disabled>
            <ShoppingCart size={14} aria-hidden="true" />
            Buy Stock
          </button>
        </span>
      );
    }
    return (
      <Link
        to={`?action=order&productId=${product.id}`}
        className="btn btn-primary btn-sm"
        aria-label={`Buy stock of ${product.name}`}
      >
        <ShoppingCart size={14} aria-hidden="true" />
        Buy Stock
      </Link>
    );
  }

  if (product.addedById !== user.id) {
    return (
      <span className="text-secondary view-only" title="Only its creator can change this product">
        View only
      </span>
    );
  }

  return (
    <span className="row-actions">
      <Link
        to={`?action=edit&productId=${product.id}`}
        className="btn btn-secondary btn-sm"
        aria-label={`Edit ${product.name}`}
      >
        <Pencil size={14} aria-hidden="true" />
        Edit
      </Link>
      <button
        type="button"
        className="btn btn-secondary btn-sm btn-danger-text"
        onClick={() => onDelete(product)}
        aria-label={`Delete ${product.name}`}
      >
        <Trash2 size={14} aria-hidden="true" />
        Delete
      </button>
    </span>
  );
}
