import { Link } from 'react-router-dom';
import {
  CircleDollarSign,
  Inbox,
  Package,
  PackageCheck,
  PackageOpen,
  TriangleAlert,
  Warehouse,
} from 'lucide-react';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import { Skeleton, SkeletonRows } from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/useAuth';
import { useApiGet } from '../hooks/useApiGet';
import {
  formatCount,
  formatCurrency,
  formatDateTime,
  LOW_STOCK_THRESHOLD,
} from '../utils/format';
import { newestFirst } from '../utils/orders';

const RECENT_LIMIT = 8;

const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

function Kpi({ label, icon: Icon, loading, value, children }) {
  return (
    <section className="card kpi">
      <h2 className="kpi-label">
        {label}
        <Icon size={20} aria-hidden="true" />
      </h2>
      <div className="kpi-value num">
        {loading ? <Skeleton className="skeleton-value" /> : (value ?? '—')}
      </div>
      <div className="kpi-foot">{!loading && children}</div>
    </section>
  );
}

function KpiRow({ products, orders }) {
  const catalog = products.data;
  const out = catalog?.filter((p) => p.quantity === 0).length;
  const low = catalog?.filter((p) => p.quantity > 0 && p.quantity < LOW_STOCK_THRESHOLD).length;
  const productsLoading = !catalog && products.loading;
  /* Add in cents to avoid floating-point drift. */
  const volume =
    orders.data && sum(orders.data, (o) => Math.round(o.totalPrice * 100)) / 100;

  return (
    <div className="kpi-grid">
      <Kpi
        label="Total Catalog SKUs"
        icon={Package}
        loading={productsLoading}
        value={catalog && formatCount(catalog.length)}
      >
        Products in the catalog
      </Kpi>
      <Kpi
        label="Total Units in Stock"
        icon={Warehouse}
        loading={productsLoading}
        value={catalog && formatCount(sum(catalog, (p) => p.quantity))}
      >
        Across all products
      </Kpi>
      <Kpi
        label="Low / Out-of-Stock"
        icon={TriangleAlert}
        loading={productsLoading}
        value={catalog && formatCount(low + out)}
      >
        {catalog &&
          (low + out === 0 ? (
            <span className="badge badge-success">ALL STOCKED</span>
          ) : (
            <>
              {low > 0 && <span className="badge badge-warning">{low} LOW</span>}
              {out > 0 && <span className="badge badge-danger">{out} OUT</span>}
            </>
          ))}
      </Kpi>
      <Kpi
        label="Total Order Volume"
        icon={CircleDollarSign}
        loading={!orders.data && orders.loading}
        value={orders.data && formatCurrency(volume)}
      >
        {orders.data &&
          `${formatCount(orders.data.length)} ${orders.data.length === 1 ? 'order' : 'orders'}`}
      </Kpi>
    </div>
  );
}

function RecentOrders({ orders, canOrder }) {
  const { data, loading } = orders;
  const recent = newestFirst(data ?? []).slice(0, RECENT_LIMIT);

  let content;
  if (!data) {
    content = loading ? <SkeletonRows rows={5} /> : <p className="empty">Orders are unavailable.</p>;
  } else if (recent.length === 0) {
    content = (
      <EmptyState
        icon={Inbox}
        title="No orders yet"
        action={
          canOrder && (
            <Link to="?action=order" className="btn btn-secondary">
              Place the first order
            </Link>
          )
        }
      >
        Purchase orders will appear here as soon as they are placed.
      </EmptyState>
    );
  } else {
    content = (
      <div className="table-wrapper">
        <table className="table table-compact">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th className="num">Qty</th>
              <th className="num">Total</th>
              <th>Status</th>
              <th>Placed</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((order) => (
              <tr key={order.id}>
                <td className="order-id">#{order.id}</td>
                <td>{order.productName}</td>
                <td className="num">{formatCount(order.quantity)}</td>
                <td className="num">{formatCurrency(order.totalPrice)}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td className="timestamp">{formatDateTime(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Recent Orders</h2>
          <p>Latest activity from all accounts</p>
        </div>
        <Link to="/orders">View all</Link>
      </div>
      {content}
    </section>
  );
}

/* The one useful thing this user can do about a product that is running low. */
function WatchAction({ product, user }) {
  let to = '/products';
  let label = 'View';

  if (user.role === 'BUYER' && product.addedById === user.id) {
    to = `?action=restock&productId=${product.id}`;
    label = 'Restock';
  } else if (user.role === 'SELLER' && product.quantity > 0) {
    to = `?action=order&productId=${product.id}`;
    label = 'Order';
  }

  return (
    <Link to={to} className="btn btn-secondary btn-sm" aria-label={`${label} ${product.name}`}>
      {label}
    </Link>
  );
}

function Watchlist({ products }) {
  const { user } = useAuth();
  const { data, loading } = products;
  const running = (data ?? [])
    .filter((p) => p.quantity < LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.quantity - b.quantity || a.name.localeCompare(b.name));

  let content;
  if (!data) {
    content = loading ? (
      <SkeletonRows rows={4} />
    ) : (
      <p className="empty">Stock levels are unavailable.</p>
    );
  } else if (data.length === 0) {
    content = (
      <EmptyState
        icon={PackageOpen}
        title="Your catalog is empty"
        action={
          user.role === 'BUYER' && (
            <Link to="?action=add" className="btn btn-secondary">
              Add the first product
            </Link>
          )
        }
      >
        Stock levels are tracked once products are added.
      </EmptyState>
    );
  } else if (running.length === 0) {
    content = (
      <EmptyState icon={PackageCheck} title="Stock looks healthy">
        Every product has at least {LOW_STOCK_THRESHOLD} units.
      </EmptyState>
    );
  } else {
    content = (
      <ul className="watchlist">
        {running.map((product) => (
          <li key={product.id}>
            <span className="watchlist-name" title={product.name}>
              {product.name}
            </span>
            <span
              className={`badge num ${product.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}
            >
              {product.quantity === 0 ? 'OUT' : `${product.quantity} LEFT`}
            </span>
            <WatchAction product={product} user={user} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Low Stock Watchlist</h2>
          <p>Fewer than {LOW_STOCK_THRESHOLD} units</p>
        </div>
        <Link to="/products">Catalog</Link>
      </div>
      {content}
    </section>
  );
}

export default function Dashboard() {
  const { role } = useAuth();
  const products = useApiGet('/products');
  const orders = useApiGet('/orders');
  const error = products.error ?? orders.error;

  const retry = () => {
    products.reload();
    orders.reload();
  };

  return (
    <>
      {error && (
        <Alert>
          {error.message}{' '}
          <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
            Try again
          </button>
        </Alert>
      )}
      <KpiRow products={products} orders={orders} />
      <div className="dashboard-split">
        <RecentOrders orders={orders} canOrder={role === 'SELLER'} />
        <Watchlist products={products} />
      </div>
    </>
  );
}
