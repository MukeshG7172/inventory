/* Client-side mirrors of the constraints on the backend DTOs in vault/. */

const EMAIL = /^[^\s@]+@[^\s@]+$/;

/* Drop fields without a message, so an empty object means "valid". */
const compact = (errors) =>
  Object.fromEntries(Object.entries(errors).filter(([, message]) => message));

/* LoginRequest */
export const validateLogin = ({ username, password }) =>
  compact({
    username: !username.trim() && 'Username is required',
    password: !password.trim() && 'Password is required',
  });

/* RegisterRequest */
export const validateRegister = ({ username, email, password }) =>
  compact({
    username:
      (!username.trim() && 'Username is required') ||
      ((username.length < 3 || username.length > 50) &&
        'Username must be between 3 and 50 characters'),
    email:
      (!email.trim() && 'Email is required') ||
      (email.length > 100 && 'Email cannot exceed 100 characters') ||
      (!EMAIL.test(email) && 'Email should be valid'),
    password:
      (!password.trim() && 'Password is required') ||
      ((password.length < 6 || password.length > 100) &&
        'Password must be between 6 and 100 characters'),
  });

/* ProductRequest */
export const validateProduct = ({ name, description, price, quantity }) =>
  compact({
    name:
      (!name.trim() && 'Product name is required') ||
      ((name.length < 2 || name.length > 150) &&
        'Product name must be between 2 and 150 characters'),
    description: description.length > 1000 && 'Description cannot exceed 1000 characters',
    price:
      (price === '' && 'Price is required') ||
      (!(Number(price) >= 0.01) && 'Price must be greater than zero'),
    quantity:
      (quantity === '' && 'Quantity is required') ||
      (!(Number.isInteger(Number(quantity)) && Number(quantity) >= 0) &&
        'Quantity must be a whole number, 0 or more'),
  });

/* OrderRequest, plus the stock limit the order service enforces */
export const validateOrder =
  (products) =>
  ({ productId, quantity }) => {
    const product = products.find((p) => String(p.id) === productId);
    const amount = Number(quantity);

    return compact({
      productId: !product && 'Choose a product',
      quantity:
        (!(Number.isInteger(amount) && amount >= 1) &&
          'Purchase quantity must be a whole number, at least 1') ||
        (product && amount > product.quantity && `Only ${product.quantity} in stock`),
    });
  };
