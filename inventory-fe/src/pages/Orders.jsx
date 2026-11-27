import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Inbox, Plus, SearchX } from 'lucide-react';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import FilterPills from '../components/FilterPills';
import OrderReceiptDrawer from '../components/OrderReceiptDrawer';
import SearchInput from '../components/SearchInput';
import { SkeletonRows } from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/useAuth';
import { useApiGet } from '../hooks/useApiGet';
import { formatCount, formatCurrency, formatDateTimeFull } from '../utils/format';
import { newestFirst } from '../utils/orders';

const TABS = [
  { value: 'all', label: 'All Orders', matches: () => true },
  { value: 'completed', label: 'Completed', matches: (o) => o.status === 'COMPLETED' },
  { value: 'pending', label: 'Pending', matches: (o) => o.status === 'PENDING' },
];

/* "#12" or "12" matches order IDs; anything else matches product names too. */
function matchesQuery(order, query) {
  const needle = query.trim().toLowerCase();
  if (needle.startsWith('#')) return String(order.id).startsWith(needle.slice(1));
  return String(order.id).includes(needle) || order.productName?.toLowerCase().includes(needle);
}

export default function Orders() {
  const { role } = useAuth();
  const { data, error, loading, reload } = useApiGet('/orders');
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const openId = params.get('order');

  const openReceipt = (id) => {
    setParams((current) => {
      current.set('order', id);
      return current;
    });
  };
  const closeReceipt = () => {
    setParams(
      (current) => {
        current.delete('order');
        return current;
      },
      { replace: true },
    );
  };

  const searched = newestFirst(data ?? []).filter((order) => matchesQuery(order, query));
  const counts = Object.fromEntries(
    TABS.map((t) => [t.value, searched.filter(t.matches).length]),
  );
  const visible = searched.filter(TABS.find((t) => t.value === tab).matches);

  let content = null;
  if (!data) {
    content = loading && <SkeletonRows rows={6} />;
  } else if (data.length === 0) {
    content = (
      <EmptyState icon={Inbox} title="No orders yet">
        {role === 'SELLER'
          ? 'Use Place Order to make the first purchase.'
          : 'Purchase orders will appear here as soon as they are placed.'}
      </EmptyState>
    );
  } else if (visible.length === 0) {
    content = (
      <EmptyState
        icon={SearchX}
        title="No matching orders"
        action={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setQuery('');
              setTab('all');
            }}
          >
            Clear filters
          </button>
        }
      >
        Try another order ID, product name or status.
      </EmptyState>
    );
  } else {
    content = (
      <div className="table-wrapper">
        <table className="table table-ledger">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th className="num">Quantity</th>
              <th className="num">Unit price</th>
              <th className="num">Total price</th>
              <th>Status</th>
              <th>Placed</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <tr key={order.id} className="clickable" onClick={() => openReceipt(order.id)}>
                <td>
                  {/* The keyboard target; its click bubbles to the row. */}
                  <button
                    type="button"
                    className="link-button order-id"
                    aria-label={`Open receipt for order ${order.id}`}
                  >
                    #{order.id}
                  </button>
                </td>
                <td>{order.productName}</td>
                <td className="num">{formatCount(order.quantity)}</td>
                <td className="num">{formatCurrency(order.unitPrice)}</td>
                <td className="num">{formatCurrency(order.totalPrice)}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td className="timestamp">{formatDateTimeFull(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar">
        <SearchInput
          label="Search orders"
          placeholder="Search order ID or product"
          value={query}
          onChange={setQuery}
        />
        <FilterPills
          label="Order status"
          options={TABS}
          value={tab}
          counts={data && counts}
          onChange={setTab}
        />
        {role === 'SELLER' && (
          <Link to="?action=order" className="btn btn-primary toolbar-end">
            <Plus size={16} aria-hidden="true" />
            Place Order
          </Link>
        )}
      </div>

      {error && (
        <Alert>
          {error.message}{' '}
          <button type="button" className="btn btn-secondary btn-sm" onClick={reload}>
            Try again
          </button>
        </Alert>
      )}
      {content && <section className="card">{content}</section>}

      {openId && <OrderReceiptDrawer key={openId} orderId={openId} onClose={closeReceipt} />}
    </>
  );
}
