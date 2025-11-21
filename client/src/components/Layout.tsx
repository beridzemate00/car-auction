import React from "react";
import { Link } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="logo">
            Car Auction<span className="logo-dot">.</span>
          </Link>
          <nav className="nav-links">
            <Link to="/">Live auctions</Link>
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
