import { client } from '../api/client';
import { useRefresh, useToast } from '../context/appContexts';
import { useAuth } from '../context/useAuth';
import { useApiGet } from '../hooks/useApiGet';
import { useForm } from '../hooks/useForm';
import { validateProduct } from '../utils/validation';
import Alert from './Alert';
import Dialog from './Dialog';
import FormField from './FormField';
import { SkeletonRows } from './Skeleton';
import SubmitButton from './SubmitButton';

const EMPTY_PRODUCT = { name: '', description: '', price: '', quantity: '' };

/* Field names match ProductRequest, so backend errors land under their inputs. */
function ProductForm({ product, focusQuantity, onCancel, onDone }) {
  const { refresh } = useRefresh();
  const toast = useToast();
  const form = useForm(
    product
      ? {
          name: product.name,
          description: product.description ?? '',
          price: String(product.price),
          quantity: String(product.quantity),
        }
      : EMPTY_PRODUCT,
    async (values) => {
      const body = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        quantity: Number(values.quantity),
      };
      const saved = product
        ? await client.put(`/products/${product.id}`, body)
        : await client.post('/products', body);
      toast(`"${saved.name}" ${product ? 'updated' : 'added'}`);
      refresh();
      onDone();
    },
    validateProduct,
  );

  return (
    <form className="form" onSubmit={form.handleSubmit} noValidate>
      {form.error && <Alert onDismiss={form.dismissError}>{form.error.message}</Alert>}

      {/* A new product focuses once the dialog opens; an edit form mounts later. */}
      <FormField
        label="Name"
        data-autofocus={product ? undefined : true}
        autoFocus={Boolean(product) && !focusQuantity}
        required
        {...form.field('name')}
      />
      <FormField
        label="Description"
        as="textarea"
        rows={4}
        hint={`${form.values.description.length} / 1000`}
        {...form.field('description')}
      />
      <div className="form-row">
        <FormField
          label="Unit price (USD)"
          type="number"
          min="0.01"
          step="0.01"
          inputMode="decimal"
          required
          {...form.field('price')}
        />
        <FormField
          label="Available stock"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          autoFocus={focusQuantity}
          required
          {...form.field('quantity')}
        />
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <SubmitButton busy={form.submitting} busyLabel="Saving…">
          {product ? 'Save changes' : 'Add product'}
        </SubmitButton>
      </div>
    </form>
  );
}

/* Loads the current record first: the update replaces every field. */
function EditProduct({ productId, ...props }) {
  const { user } = useAuth();
  const { data, error } = useApiGet(`/products/${encodeURIComponent(productId)}`);

  if (!data) return error ? <Alert>{error.message}</Alert> : <SkeletonRows rows={4} />;
  if (data.addedById !== user.id) {
    return <Alert>Only {data.addedByUsername}, who added this product, can edit it.</Alert>;
  }
  return <ProductForm product={data} {...props} />;
}

/** Slide-over for adding a product, or editing one when productId is given. */
export default function ProductDrawer({ productId, focusQuantity = false, onClose }) {
  return (
    <Dialog
      variant="drawer"
      title={productId ? 'Edit product' : 'Add product'}
      onClose={onClose}
    >
      {(close) => {
        const props = { onCancel: close, onDone: onClose };
        return productId ? (
          <EditProduct productId={productId} focusQuantity={focusQuantity} {...props} />
        ) : (
          <ProductForm {...props} />
        );
      }}
    </Dialog>
  );
}
