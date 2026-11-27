import { CircleCheck, CircleDashed, CircleX, Lock, ReceiptText } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useApiGet } from '../hooks/useApiGet';
import { formatCount, formatCurrency, formatDateTimeFull } from '../utils/format';
import Alert from './Alert';
import Dialog from './Dialog';
import EmptyState from './EmptyState';
import { SkeletonRows } from './Skeleton';
import StatusBadge from './StatusBadge';

const FINAL_STEPS = {
  COMPLETED: { icon: CircleCheck, tone: 'success', title: 'Completed' },
  PENDING: { icon: CircleDashed, tone: 'warning', title: 'Awaiting completion' },
  CANCELLED: { icon: CircleX, tone: 'danger', title: 'Cancelled' },
};

/* The backend records only the creation time and the current status. */
function Timeline({ order }) {
  const final = FINAL_STEPS[order.status] ?? FINAL_STEPS.PENDING;
  const steps = [
    {
      icon: ReceiptText,
      tone: 'primary',
      title: 'Order placed',
      detail: formatDateTimeFull(order.createdAt),
    },
    { ...final, detail: 'Current status. No separate time is recorded.' },
  ];

  return (
    <ol className="timeline">
      {steps.map(({ icon: Icon, tone, title, detail }) => (
        <li key={title}>
          <span className={`timeline-icon tone-${tone}`}>
            <Icon size={16} aria-hidden="true" />
          </span>
          <div>
            <strong>{title}</strong>
            <p>{detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Receipt({ order }) {
  const { user } = useAuth();

  return (
    <div className="receipt">
      <div className="receipt-total">
        <span className="num">{formatCurrency(order.totalPrice)}</span>
        <StatusBadge status={order.status} />
      </div>

      <section>
        <h3>Items</h3>
        <dl className="summary">
          <div>
            <dt>Product</dt>
            <dd>{order.productName}</dd>
          </div>
          <div>
            <dt>Product ID</dt>
            <dd className="num">{order.productId}</dd>
          </div>
          <div>
            <dt>Unit price</dt>
            <dd className="num">{formatCurrency(order.unitPrice)}</dd>
          </div>
          <div>
            <dt>Quantity</dt>
            <dd className="num">{formatCount(order.quantity)}</dd>
          </div>
          <div className="summary-total">
            <dt>Total</dt>
            <dd className="num">{formatCurrency(order.totalPrice)}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3>Buyer</h3>
        <dl className="summary">
          <div>
            <dt>Username</dt>
            <dd>
              {order.buyerUsername}
              {order.buyerId === user.id && ' (you)'}
            </dd>
          </div>
          <div>
            <dt>Account ID</dt>
            <dd className="num">{order.buyerId}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3>Status timeline</h3>
        <Timeline order={order} />
      </section>
    </div>
  );
}

export default function OrderReceiptDrawer({ orderId, onClose }) {
  const { data, error } = useApiGet(`/orders/${encodeURIComponent(orderId)}`);

  let content;
  if (data) content = <Receipt order={data} />;
  else if (error?.status === 403) {
    content = (
      <EmptyState icon={Lock} title="Receipt restricted">
        Only the purchaser and the product's creator can open this receipt.
      </EmptyState>
    );
  } else if (error) content = <Alert>{error.message}</Alert>;
  else content = <SkeletonRows rows={6} />;

  return (
    <Dialog
      variant="drawer"
      title={`Order #${orderId}`}
      onClose={onClose}
      dismissOnBackdrop
    >
      {content}
    </Dialog>
  );
}
