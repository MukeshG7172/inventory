import { stockStatus } from '../utils/stock';

const BADGES = {
  out: ['badge-danger', 'OUT OF STOCK'],
  low: ['badge-warning', 'LOW STOCK'],
  ok: ['badge-success', 'IN STOCK'],
};

export default function StockBadge({ quantity }) {
  const [className, label] = BADGES[stockStatus(quantity)];
  return <span className={`badge ${className}`}>{label}</span>;
}
