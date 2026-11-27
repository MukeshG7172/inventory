import { Navigate, useLocation } from 'react-router-dom';
import { ChartColumn, PackageCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import Brand from './Brand';

const FEATURES = [
  {
    icon: PackageCheck,
    title: 'Catalog control',
    text: 'Inventory managers add and maintain products, prices and stock levels.',
  },
  {
    icon: ChartColumn,
    title: 'Stock at a glance',
    text: 'The dashboard flags low and out-of-stock items beside recent orders.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-based access',
    text: 'Each account sees the actions that match its role.',
  },
];

/** Split-screen frame for sign-in and sign-up; signed-in users are sent onwards. */
export default function AuthShell({ title, subtitle, footer, children }) {
  const { isAuthenticated } = useAuth();
  const { state } = useLocation();

  if (isAuthenticated) {
    return <Navigate to={state?.from ?? '/dashboard'} replace />;
  }

  return (
    <div className="auth">
      <aside className="auth-panel">
        <Brand />
        <div className="auth-pitch">
          <h2>Know what is in stock, and what needs attention.</h2>
          <p>One workspace for managing your catalog and placing purchase orders.</p>
          <ul className="features">
            {FEATURES.map(({ icon: Icon, title: heading, text }) => (
              <li key={heading}>
                <span className="feature-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3>{heading}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="auth-note">Vault Inventory</p>
      </aside>

      <main className="auth-main">
        <div className="card auth-card">
          <h1>{title}</h1>
          <p>{subtitle}</p>
          {children}
        </div>
        <p className="auth-footer">{footer}</p>
      </main>
    </div>
  );
}
