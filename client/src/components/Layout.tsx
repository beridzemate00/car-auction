// client/src/components/Layout.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ScrollToTop from "./ScrollToTop";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">🚗</span>
            CarBid<span className="logo-dot">.</span>
          </Link>
          <nav className="nav-links">
            <Link to="/">Browse</Link>
            {user && <Link to="/dashboard">Dashboard</Link>}
            {!user ? (
              <Link to="/auth" className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Sign In
              </Link>
            ) : (
              <button className="btn-ghost" onClick={handleLogout}>
                👤 {user.name || user.email.split('@')[0]} · Logout
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: 0 }}>
            © {new Date().getFullYear()} CarBid — Your trusted car auction platform
          </p>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
};

export default Layout;
