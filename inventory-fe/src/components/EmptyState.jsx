export default function EmptyState({ icon: Icon, title, action, children }) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon size={24} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
