import { LOW_STOCK_THRESHOLD } from './format';

/** 'out' | 'low' | 'ok' */
export function stockStatus(quantity) {
  if (quantity === 0) return 'out';
  return quantity < LOW_STOCK_THRESHOLD ? 'low' : 'ok';
}

/* Multiply in cents to avoid floating-point drift. */
export const lineTotal = (unitPrice, quantity) =>
  (Math.round(unitPrice * 100) * quantity) / 100;
