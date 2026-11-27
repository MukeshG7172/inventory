import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, PackageOpen, Plus, SearchX, Table2 } from 'lucide-react';
import Alert from '../components/Alert';
import DeleteProductModal from '../components/DeleteProductModal';
import EmptyState from '../components/EmptyState';
import FilterPills from '../components/FilterPills';
import ProductActions from '../components/ProductActions';
import SearchInput from '../components/SearchInput';
import { SkeletonRows } from '../components/Skeleton';
import StockBadge from '../components/StockBadge';
import { useAuth } from '../context/useAuth';
import { useApiGet } from '../hooks/useApiGet';
import { formatCount, formatCurrency, formatDate } from '../utils/format';
import { stockStatus } from '../utils/stock';

const STOCK_FILTERS = [
  { value: 'all', label: 'All', matches: () => true },
  { value: 'in', label: 'In Stock', matches: (p) => p.quantity > 0 },
  { value: 'low', label: 'Low Stock (<10)', matches: (p) => stockStatus(p.quantity) === 'low' },
  { value: 'out', label: 'Out of Stock', matches: (p) => p.quantity === 0 },
];

const VIEW_KEY = 'inventory_products_view';

/* The chosen view is a per-browser convenience; ignore storage failures. */
function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'grid' ? 'grid' : 'table';
  } catch {
    return 'table';
  }
}

function Creator({ product, user }) {
  return (
    <span className="creator">
      <span>{product.addedById === user.id ? 'You' : product.addedByUsername}</span>
      <small>Added {formatDate(product.createdAt)}</small>
    </span>
  );
}

function ProductTable({ products, user, onDelete }) {
  return (
    <section className="card product-card-surface table-wrapper">
      <table className="table table-products">
        <thead>
          <tr>
            <th>Product</th>
            <th className="num">Unit price</th>
            <th className="num">Available stock</th>
            <th>Status</th>
            <th>Created by</th>
            <th className="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="product-cell">
                <strong title={product.name}>{product.name}</strong>
                <small title={product.description}>{product.description || 'No description'}</small>
              </td>
              <td className="num">{formatCurrency(product.price)}</td>
              <td className="num">{formatCount(product.quantity)}</td>
              <td>
                <StockBadge quantity={product.quantity} />
              </td>
              <td>
                <Creator product={product} user={user} />
              </td>
              <td className="actions">
                <ProductActions product={product} user={user} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ProductGrid({ products, user, onDelete }) {
  return (
    <ul className="product-grid">
      {products.map((product) => (
        <li key={product.id} className="card product-card-surface product-tile">
          <div className="product-tile-head">
            <h2>{product.name}</h2>
            <StockBadge quantity={product.quantity} />
          </div>
          <p className="product-description">{product.description || 'No description'}</p>
          <dl className="product-figures">
            <div>
              <dt>Unit price</dt>
              <dd className="num">{formatCurrency(product.price)}</dd>
            </div>
            <div>
              <dt>Available stock</dt>
              <dd className="num">{formatCount(product.quantity)}</dd>
            </div>
          </dl>
          <div className="product-tile-foot">
            <Creator product={product} user={user} />
            <ProductActions product={product} user={user} onDelete={onDelete} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Products() {
  const { user, role } = useAuth();
  const { data, error, loading, reload } = useApiGet('/products');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState(readView);
  const [deleting, setDeleting] = useState(null);

  const changeView = (next) => {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {
      /* The view still changes for this visit. */
    }
  };

  const needle = query.trim().toLowerCase();
  const searched = (data ?? []).filter((p) =>
    `${p.name}\n${p.description ?? ''}`.toLowerCase().includes(needle),
  );
  /* Counts follow the search, so each pill shows what choosing it would list. */
  const counts = Object.fromEntries(
    STOCK_FILTERS.map((f) => [f.value, searched.filter(f.matches).length]),
  );
  const visible = searched.filter(STOCK_FILTERS.find((f) => f.value === filter).matches);

  const addButton = role === 'BUYER' && (
    <Link to="?action=add" className="btn btn-primary toolbar-end">
      <Plus size={16} aria-hidden="true" />
      Add Product
    </Link>
  );

  let content;
  if (!data) {
    content = loading ? (
      <section className="card">
        <SkeletonRows rows={6} />
      </section>
    ) : null;
  } else if (data.length === 0) {
    content = (
      <section className="card">
        <EmptyState icon={PackageOpen} title="No products yet">
          {role === 'BUYER'
            ? 'Use Add Product to create the first catalog entry.'
            : 'Products added by inventory managers will appear here.'}
        </EmptyState>
      </section>
    );
  } else if (visible.length === 0) {
    content = (
      <section className="card">
        <EmptyState
          icon={SearchX}
          title="No matching products"
          action={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setQuery('');
                setFilter('all');
              }}
            >
              Clear filters
            </button>
          }
        >
          Try another search term or stock filter.
        </EmptyState>
      </section>
    );
  } else {
    const View = view === 'grid' ? ProductGrid : ProductTable;
    content = <View products={visible} user={user} onDelete={setDeleting} />;
  }

  return (
    <>
      <div className="toolbar">
        <SearchInput
          label="Search products"
          placeholder="Search name or description"
          value={query}
          onChange={setQuery}
        />
        <FilterPills
          label="Stock status"
          options={STOCK_FILTERS}
          value={filter}
          counts={data && counts}
          onChange={setFilter}
        />
        <div className="segmented" role="group" aria-label="View">
          <button
            type="button"
            className="btn btn-icon"
            aria-pressed={view === 'table'}
            onClick={() => changeView('table')}
            aria-label="Table view"
            title="Table view"
          >
            <Table2 size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn btn-icon"
            aria-pressed={view === 'grid'}
            onClick={() => changeView('grid')}
            aria-label="Card grid view"
            title="Card grid view"
          >
            <LayoutGrid size={18} aria-hidden="true" />
          </button>
        </div>
        {addButton}
      </div>

      {error && (
        <Alert>
          {error.message}{' '}
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>
            Try again
          </button>
        </Alert>
      )}
      {content}

      {deleting && <DeleteProductModal product={deleting} onClose={() => setDeleting(null)} />}
    </>
  );
}
