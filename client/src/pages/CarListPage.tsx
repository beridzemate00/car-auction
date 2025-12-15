// client/src/pages/CarListPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { getAuctions } from "../api/auctions";
import type { AuctionSummary } from "../types";
import CarCard from "../components/CarCard";
import CarFilters from "../components/CarFilters";

const CarListPage: React.FC = () => {
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "live" | "upcoming" | "sold">("all");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await getAuctions();
        if (!cancelled) {
          setAuctions(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Failed to load auctions");
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
  }, []);

  const filteredAuctions = useMemo(() => {
    return auctions.filter((a) => {
      const matchesStatus = status === "all" || a.status === status;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        a.title.toLowerCase().includes(term) ||
        a.make.toLowerCase().includes(term) ||
        a.model.toLowerCase().includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [auctions, search, status]);

  const liveCount = auctions.filter(a => a.status === 'live').length;
  const upcomingCount = auctions.filter(a => a.status === 'upcoming').length;

  return (
    <div className="page">
      {/* Hero Section */}
      <div className="hero">
        <h1>🚗 Find Your Dream Car</h1>
        <p>
          Discover incredible deals on premium vehicles. Bid on live auctions or buy now at fixed prices.
        </p>
        <div className="stats-row">
          <div className="stat-item">
            <div className="stat-value">{liveCount}</div>
            <div className="stat-label">Live Auctions</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{upcomingCount}</div>
            <div className="stat-label">Coming Soon</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{auctions.length}</div>
            <div className="stat-label">Total Vehicles</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <CarFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {/* Loading State */}
      {loading && (
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem' }}>Loading auctions...</p>
        </div>
      )}

      {/* Error State */}
      {error && <p className="error-text">{error}</p>}

      {/* Empty State */}
      {!loading && !error && filteredAuctions.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No auctions found</h3>
          <p>Try adjusting your search or filter criteria.</p>
          <button
            className="btn-secondary"
            onClick={() => { setSearch(""); setStatus("all"); }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Car Grid */}
      {!loading && !error && filteredAuctions.length > 0 && (
        <div className="car-grid">
          {filteredAuctions.map((auction) => (
            <CarCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarListPage;
