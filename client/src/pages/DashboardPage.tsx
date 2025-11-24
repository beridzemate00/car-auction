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
      <div className="page-header">
        <div>
          <h1>Your dashboard</h1>
          <p className="page-subtitle">
            Watchlist, bidding history and account overview.
          </p>
        </div>
      </div>

      {loading && <p>Loading dashboard...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <>
          <section className="dash-section">
            <h2>Watchlist</h2>
            {watchlist.length === 0 ? (
              <p>
                Your watchlist is empty.{" "}
                <Link to="/">Browse auctions</Link> to add some.
              </p>
            ) : (
              <div className="car-grid">
                {watchlist.map((a) => (
                  <CarCard key={a.id} auction={a} />
                ))}
              </div>
            )}
          </section>

          <section className="dash-section">
            <h2>Bidding history</h2>
            {bids.length === 0 ? (
              <p>You have no bids yet.</p>
            ) : (
              <table className="bids-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Car</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map((b) => (
                    <tr key={b.id}>
                      <td>{new Date(b.created_at).toLocaleString()}</td>
                      <td>
                        <Link to={`/auctions/${b.auction_id}`}>
                          {b.year} {b.make} {b.model}
                        </Link>
                      </td>
                      <td>${b.amount.toLocaleString("en-US")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
