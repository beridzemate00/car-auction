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

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Car auctions</h1>
          <p className="page-subtitle">
            Browse live, upcoming and sold auctions. Click a car to see full details.
          </p>
        </div>
      </div>

      <CarFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {loading && <p>Loading auctions...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && filteredAuctions.length === 0 && (
        <p>No auctions found. Try changing filters.</p>
      )}

      <div className="car-grid">
        {filteredAuctions.map((auction) => (
          <CarCard key={auction.id} auction={auction} />
        ))}
      </div>
    </div>
  );
};

export default CarListPage;
