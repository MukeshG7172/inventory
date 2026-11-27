import { PackageOpen } from 'lucide-react';
import { client } from '../api/client';
import { useRefresh, useToast } from '../context/appContexts';
import { useApiGet } from '../hooks/useApiGet';
import { useForm } from '../hooks/useForm';
import { formatCount, formatCurrency } from '../utils/format';
import { lineTotal } from '../utils/stock';
import { validateOrder } from '../utils/validation';
import Alert from './Alert';
import Dialog from './Dialog';
import EmptyState from './EmptyState';
import FormField from './FormField';
import QuantityStepper from './QuantityStepper';
import { SkeletonRows } from './Skeleton';
import SubmitButton from './SubmitButton';

function PurchaseForm({ products, productId, onCancel, onDone }) {
  const { refresh } = useRefresh();
  const toast = useToast();
  const find = (id) => products.find((p) => String(p.id) === id);
  const validate = validateOrder(products);
  const form = useForm(
    { productId: find(productId) ? productId : '', quantity: '1' },
    async (values) => {
      let order;
      try {
        /* OrderRequest */
        order = await client.post('/orders/buy', {
          productId: Number(values.productId),
          quantity: Number(values.quantity),
        });
      } catch (error) {
        /* Stock may have moved since the list loaded. */
        refresh();
        throw error;
      }
      toast(`Order #${order.id} completed`);
      refresh();
      onDone();
    },
    validate,
  );

  const product = find(form.values.productId);
  const quantity = Number(form.values.quantity);
  const problems = validate(form.values);
  const valid = Object.keys(problems).length === 0;

  const chooseProduct = (event) => {
    form.handleChange(event);
    const next = find(event.target.value);
    if (next && quantity > next.quantity) form.setValue('quantity', String(next.quantity));
  };

  return (
    <form className="form" onSubmit={form.handleSubmit} noValidate>
      {form.error && <Alert onDismiss={form.dismissError}>{form.error.message}</Alert>}

      <FormField
        label="Product"
        as="select"
        autoFocus
        required
        {...form.field('productId')}
        onChange={chooseProduct}
      >
        <option value="">Select a product</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {`${p.name} · ${formatCurrency(p.price)} · ${formatCount(p.quantity)} left`}
          </option>
        ))}
      </FormField>

      <QuantityStepper
        label="Quantity"
        name="quantity"
        value={form.values.quantity}
        max={product?.quantity ?? 1}
        disabled={!product}
        error={product && form.values.quantity !== '' ? problems.quantity : undefined}
        onChange={(next) => form.setValue('quantity', next)}
      />

      <div className="order-summary" aria-live="polite">
        <span className="order-summary-label">Unit Price × Quantity = Total Price</span>
        <strong className="num">
          {product && quantity > 0
            ? `${formatCurrency(product.price)} × ${formatCount(quantity)} = ${formatCurrency(lineTotal(product.price, quantity))}`
            : '—'}
        </strong>
        {product && (
          <span className="order-summary-note">
            <span className="num">{formatCount(Math.max(product.quantity - quantity, 0))}</span>{' '}
            units will remain in stock
          </span>
        )}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <SubmitButton busy={form.submitting} busyLabel="Placing order…" disabled={!valid}>
          Place order
        </SubmitButton>
      </div>
    </form>
  );
}

/** Buys stock through POST /orders/buy. For SELLER accounts. */
export default function PurchaseModal({ productId, onClose }) {
  const { data, error } = useApiGet('/products/in-stock');

  return (
    <Dialog title="New purchase order" onClose={onClose}>
      {(close) => {
        if (!data) return error ? <Alert>{error.message}</Alert> : <SkeletonRows rows={3} />;
        if (data.length === 0) {
          return (
            <EmptyState icon={PackageOpen} title="Nothing in stock">
              There are no products available to order right now.
            </EmptyState>
          );
        }
        return (
          <PurchaseForm products={data} productId={productId} onCancel={close} onDone={onClose} />
        );
      }}
    </Dialog>
  );
}
