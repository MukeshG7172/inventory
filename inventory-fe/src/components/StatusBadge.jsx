const STATUS_BADGE = {
  PENDING: 'badge-warning',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_BADGE[status] ?? 'badge-primary'}`}>{status}</span>;
}
