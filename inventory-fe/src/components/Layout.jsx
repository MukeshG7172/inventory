import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  ShoppingCart,
  X,
} from 'lucide-react';
import { RefreshContext } from '../context/appContexts';
import { useAuth } from '../context/useAuth';
import { ROLES } from '../utils/roles';
import Brand from './Brand';
import ProductDrawer from './ProductDrawer';
import PurchaseModal from './PurchaseModal';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products Catalog', icon: Package },
  { path: '/orders', label: 'Orders History', icon: ShoppingCart },
];

/* These pages carry the primary button in their own toolbar. */
const PAGES_WITH_TOOLBAR = ['/products', '/orders'];

/* The header button for each role, opened through the ?action= parameter. */
const PRIMARY_ACTIONS = {
  BUYER: { action: 'add', label: 'Add Product' },
  SELLER: { action: 'order', label: 'New Purchase Order' },
};

export default function Layout() {
  const { user, role, logout } = useAuth();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  const refreshState = useMemo(() => ({ version, refresh }), [version, refresh]);

  const title = NAV_ITEMS.find((item) => item.path === pathname)?.label ?? 'Dashboard';
  const primary = !PAGES_WITH_TOOLBAR.includes(pathname) && PRIMARY_ACTIONS[role];
  const action = params.get('action');
  const productId = params.get('productId');

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const closeDialog = () => {
    setParams(
      (current) => {
        current.delete('action');
        current.delete('productId');
        return current;
      },
      { replace: true },
    );
  };

  return (
    <RefreshContext.Provider value={refreshState}>
      <div className="shell">
        <aside id="sidebar" className={`sidebar ${menuOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <Brand />
            <button
              type="button"
              className="btn btn-icon sidebar-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <nav className="sidebar-nav" aria-label="Main">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <NavLink key={path} to={path} className="nav-link" onClick={() => setMenuOpen(false)}>
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="profile-card">
            <span className="avatar" aria-hidden="true">
              {user.username.charAt(0)}
            </span>
            <div className="profile-info">
              <span className="profile-name" title={user.username}>
                {user.username}
              </span>
              <span className="badge badge-primary" title={ROLES[role]?.label}>
                {role}
              </span>
            </div>
            <button
              type="button"
              className="btn btn-icon"
              onClick={logout}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </aside>

        {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

        <div className="shell-body">
          <header className="topbar">
            <button
              type="button"
              className="btn btn-icon menu-button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="sidebar"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="topbar-title">
              <nav aria-label="Breadcrumb">
                <ol className="breadcrumb">
                  <li>
                    <Link to="/dashboard">Vault Inventory</Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight size={12} />
                  </li>
                  <li aria-current="page">{title}</li>
                </ol>
              </nav>
              <h1>{title}</h1>
            </div>
            {primary && (
              <Link to={`?action=${primary.action}`} className="btn btn-primary">
                <Plus size={16} aria-hidden="true" />
                <span className="cta-label">{primary.label}</span>
              </Link>
            )}
          </header>

          <main className="page">
            <Outlet />
          </main>
        </div>

        {role === 'BUYER' && action === 'add' && <ProductDrawer onClose={closeDialog} />}
        {role === 'BUYER' && (action === 'edit' || action === 'restock') && productId && (
          <ProductDrawer
            key={productId}
            productId={productId}
            focusQuantity={action === 'restock'}
            onClose={closeDialog}
          />
        )}
        {role === 'SELLER' && action === 'order' && (
          <PurchaseModal productId={productId} onClose={closeDialog} />
        )}
      </div>
    </RefreshContext.Provider>
  );
}
