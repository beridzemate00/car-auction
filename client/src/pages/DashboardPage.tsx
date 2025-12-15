// client/src/pages/DashboardPage.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { getWatchlist, getUserBids } from "../api/user";
import type { WatchlistItem, UserBid } from "../types";
import CarCard from "../components/CarCard";

const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [bids, setBids] = useState<UserBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      navigate("/auth");
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [wl, bidsData] = await Promise.all([
          getWatchlist(),
          getUserBids(),
        ]);
        if (!cancelled) {
          setWatchlist(wl);
          setBids(bidsData);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [token, user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      {/* Welcome Header */}
      <div className="page-header">
        <div>
          <h1>👋 Welcome back, {user.name || user.email.split('@')[0]}!</h1>
          <p className="page-subtitle">
            Manage your watchlist, view bidding history, and track your activity.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="dash-section" style={{ margin: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
            {watchlist.length}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Watchlist Items
          </div>
        </div>
        <div className="dash-section" style={{ margin: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)' }}>
            {bids.length}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Total Bids
          </div>
        </div>
        <div className="dash-section" style={{ margin: 0, textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
            ${bids.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Total Bid Amount
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem' }}>Loading your dashboard...</p>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          {/* Watchlist Section */}
          <section className="dash-section">
            <h2>⭐ Your Watchlist</h2>
            {watchlist.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div className="empty-state-icon">🔖</div>
                <h3>No saved vehicles</h3>
                <p>Start building your watchlist by saving vehicles you're interested in.</p>
                <Link to="/" className="btn">Browse Auctions</Link>
              </div>
            ) : (
              <div className="car-grid">
                {watchlist.map((a) => (
                  <CarCard key={a.id} auction={a} />
                ))}
              </div>
            )}
          </section>

          {/* Bidding History Section */}
          <section className="dash-section">
            <h2>📊 Bidding History</h2>
            {bids.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <div className="empty-state-icon">🏷️</div>
                <h3>No bids yet</h3>
                <p>When you place bids on vehicles, they'll appear here.</p>
                <Link to="/" className="btn">Start Bidding</Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="bids-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Vehicle</th>
                      <th>Bid Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bids.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <span style={{ fontWeight: 500 }}>
                            {new Date(b.created_at).toLocaleDateString()}
                          </span>
                          <br />
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {new Date(b.created_at).toLocaleTimeString()}
                          </span>
                        </td>
                        <td>
                          <Link to={`/auctions/${b.auction_id}`} style={{ fontWeight: 500 }}>
                            {b.year} {b.make} {b.model}
                          </Link>
                        </td>
                        <td>
                          <span style={{
                            fontWeight: 600,
                            color: 'var(--primary)',
                            fontSize: '1.05rem'
                          }}>
                            ${b.amount.toLocaleString("en-US")}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/auctions/${b.auction_id}`}
                            className="btn-ghost small"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
