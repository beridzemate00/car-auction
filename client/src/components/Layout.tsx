// client/src/components/Layout.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
            Car Auction<span className="logo-dot">.</span>
          </Link>
          <nav className="nav-links">
            <Link to="/">Live auctions</Link>
            {user && <Link to="/dashboard">Dashboard</Link>}
            {!user ? (
              <Link to="/auth">Login / Sign up</Link>
            ) : (
              <button className="btn-ghost small" onClick={handleLogout}>
                {user.email} · Logout
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <span>© {new Date().getFullYear()} Car Auction Demo</span>
      </footer>
    </div>
  );
};

export default Layout;
