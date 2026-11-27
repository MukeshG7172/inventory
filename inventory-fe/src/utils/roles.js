/*
 * The backend's role names read backwards: BUYER manages stock and SELLER
 * places purchase orders. Always show these labels beside the raw names.
 */
export const ROLES = {
  BUYER: {
    label: 'Inventory Manager',
    description: 'Create, update, and manage catalog stock',
  },
  SELLER: {
    label: 'Procurement / Buyer',
    description: 'Browse catalog and execute purchase orders',
  },
};
